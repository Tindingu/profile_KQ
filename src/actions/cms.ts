"use server";
import { db } from "@/lib/db";
import { requireUser, requireKind } from "@/lib/access";
import { contentSchema } from "@/lib/validation";
import { cleanHtml } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { publicationDate } from "@/lib/dates";
function refresh() {
  revalidatePath("/", "layout");
}
export async function saveContent(input: unknown) {
  try {
    const p = contentSchema.parse(input);
    p.tags = [...new Set(p.tags.map((tag) => tag.trim()).filter(Boolean))];
    const user = await requireKind(p.kind);
    const existing = p.id
      ? await db.content.findUniqueOrThrow({ where: { id: p.id } })
      : null;
    if (existing && existing.kind !== p.kind)
      throw new Error("Không thể thay đổi loại nội dung.");
    if (p.parentId) {
      const parent = await db.content.findUnique({ where: { id: p.parentId } });
      if (p.kind !== "SERVICE" || !parent || parent.kind !== "SERVICE" || parent.parentId || parent.id === p.id)
        throw new Error("Vui lòng chọn chủ đề dịch vụ hợp lệ.");
    }
    if (existing && Boolean(existing.parentId) !== Boolean(p.parentId))
      throw new Error("Không thể đổi giữa chủ đề và bài viết dịch vụ.");
    if (p.categoryId) {
      const cat = await db.category.findUniqueOrThrow({
        where: { id: p.categoryId },
      });
      if (cat.kind !== p.kind) throw new Error("Danh mục không phù hợp.");
    }
    if (
      (p.kind === "PROFILE" && p.slug !== "profile") ||
      (p.kind === "SETTINGS" && p.slug !== "settings")
    )
      throw new Error("Slug cấu hình không hợp lệ.");
    const {
      id,
      translations,
      galleryIds,
      categoryId,
      parentId,
      coverId,
      publishedAt,
      data,
      ...rest
    } = p;
    const row = await db.$transaction(async (tx) => {
      const record = await tx.content.upsert({
        where: { id: id || "__new__" },
        create: {
          ...rest,
          authorId: user.id,
          categoryId: categoryId || null,
          parentId: parentId || null,
          coverId: coverId || null,
          publishedAt: publishedAt
            ? publicationDate(publishedAt)
            : p.status === "PUBLISHED"
              ? new Date()
              : null,
          data: data as Prisma.InputJsonValue,
        },
        update: {
          ...rest,
          categoryId: categoryId || null,
          parentId: parentId || null,
          coverId: coverId || null,
          publishedAt: publishedAt
            ? publicationDate(publishedAt)
            : p.status === "PUBLISHED"
              ? new Date()
              : null,
          data: data as Prisma.InputJsonValue,
        },
      });
      for (const t of translations) {
        const value = { ...t, body: cleanHtml(t.body) };
        await tx.translation.upsert({
          where: {
            contentId_locale: { contentId: record.id, locale: t.locale },
          },
          create: { ...value, contentId: record.id },
          update: value,
        });
      }
      await tx.contentMedia.deleteMany({ where: { contentId: record.id } });
      if (galleryIds.length)
        await tx.contentMedia.createMany({
          data: [...new Set(galleryIds)].map((mediaId, sortOrder) => ({
            contentId: record.id,
            mediaId,
            sortOrder,
          })),
        });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: `${id ? "UPDATE" : "CREATE"} ${p.kind} ${p.status}`,
          entityId: record.id,
        },
      });
      return record;
    });
    refresh();
    return { ok: true as const, id: row.id };
  } catch (e) {
    return {
      ok: false as const,
      error:
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
          ? "Slug đã tồn tại."
          : e instanceof Error
            ? e.message
            : "Không lưu được nội dung.",
    };
  }
}
export async function contentAction(
  id: string,
  action: "delete" | "duplicate" | "publish" | "unpublish",
) {
  await requireUser();
  const row = await db.content.findUniqueOrThrow({
    where: { id },
    include: { translations: true, gallery: true },
  });
  const user = await requireKind(row.kind);
  if (action === "delete" && await db.content.count({ where: { parentId: id } }))
    throw new Error("Hãy chuyển hoặc xóa các bài viết thuộc chủ đề trước khi xóa chủ đề.");
  if (
    ["PROFILE", "SETTINGS"].includes(row.kind) &&
    ["delete", "duplicate"].includes(action)
  )
    throw new Error("Không thể xóa hoặc nhân bản cấu hình.");
  await db.$transaction(async (tx) => {
    if (action === "delete") await tx.content.delete({ where: { id } });
    else if (action === "duplicate") {
      const {
        id: _,
        createdAt: __,
        updatedAt: ___,
        translations,
        gallery,
        ...data
      } = row;
      void _;
      void __;
      void ___;
      await tx.content.create({
        data: {
          ...data,
          slug: `${row.slug}-copy-${Date.now()}`,
          status: "DRAFT",
          featured: false,
          publishedAt: null,
          authorId: user.id,
          categoryId: data.categoryId,
          coverId: data.coverId,
          data: data.data as Prisma.InputJsonValue,
          translations: {
            create: translations.map(({ id: tid, contentId: cid, ...t }) => {
              void tid;
              void cid;
              return { ...t, title: t.title ? `${t.title} (copy)` : "" };
            }),
          },
          gallery: {
            create: gallery.map((g) => ({
              mediaId: g.mediaId,
              sortOrder: g.sortOrder,
            })),
          },
        },
      });
    } else
      await tx.content.update({
        where: { id },
        data: {
          status: action === "publish" ? "PUBLISHED" : "DRAFT",
          publishedAt: action === "publish" ? new Date() : null,
        },
      });
    await tx.auditLog.create({
      data: {
        userId: user.id,
        action: `${action.toUpperCase()} ${row.kind}`,
        entityId: id,
      },
    });
  });
  refresh();
}
export async function saveCategory(input: unknown) {
  const p = z
    .object({
      id: z.string().optional(),
      kind: z.enum(["POST", "PROJECT", "ALBUM", "SERVICE"]),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      nameVi: z.string().min(1).max(100),
      nameEn: z.string().max(100),
      sortOrder: z.number().int().min(0),
    })
    .parse(input);
  await requireKind(p.kind);
  if (p.id) {
    const old = await db.category.findUniqueOrThrow({ where: { id: p.id } });
    await requireKind(old.kind);
    if (old.kind !== p.kind) throw new Error("Loại danh mục không hợp lệ.");
  }
  await db.category.upsert({
    where: { id: p.id || "__new__" },
    create: p,
    update: p,
  });
  refresh();
}
export async function deleteCategory(id: string) {
  await requireUser();
  const c = await db.category.findUniqueOrThrow({ where: { id } });
  await requireKind(c.kind);
  await db.category.delete({ where: { id } });
  refresh();
}
export async function saveUser(input: unknown) {
  await requireUser(true);
  const p = z
    .object({
      id: z.string().optional(),
      name: z.string().min(2).max(100),
      email: z.email(),
      password: z.string().max(128),
      role: z.enum(["ADMIN", "EDITOR"]),
      active: z.boolean(),
    })
    .parse(input);
  const { hash } = await import("bcryptjs");
  if (!p.id && p.password.length < 12)
    throw new Error("Mật khẩu phải có ít nhất 12 ký tự.");
  if (p.password && p.password.length < 12)
    throw new Error("Mật khẩu phải có ít nhất 12 ký tự.");
  await db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(487132)`;
    if (p.id) {
      const old = await tx.user.findUniqueOrThrow({ where: { id: p.id } });
      if (
        old.role === "ADMIN" &&
        old.active &&
        (p.role !== "ADMIN" || !p.active) &&
        (await tx.user.count({ where: { role: "ADMIN", active: true } })) <= 1
      )
        throw new Error("Phải giữ ít nhất một Admin hoạt động.");
    }
    const passwordHash = p.password ? await hash(p.password, 12) : undefined;
    const data = {
      name: p.name,
      email: p.email.toLowerCase(),
      role: p.role,
      active: p.active,
    };
    await tx.user.upsert({
      where: { id: p.id || "__new__" },
      create: { ...data, passwordHash: passwordHash! },
      update: { ...data, ...(passwordHash ? { passwordHash } : {}) },
    });
  });
  refresh();
}
export async function updateContact(input: unknown) {
  await requireUser(true);
  const p = z
    .object({
      id: z.string(),
      status: z.enum(["NEW", "PROCESSING", "CONTACTED", "COMPLETED"]),
      notes: z.string().max(10000),
    })
    .parse(input);
  await db.contactSubmission.update({ where: { id: p.id }, data: p });
  refresh();
}
export async function deleteContact(id: string) {
  await requireUser(true);
  await db.contactSubmission.delete({ where: { id } });
  refresh();
}
