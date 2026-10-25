import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { requireUser, requireKind } from "@/lib/access";
import { sections, isSection, contentInclude } from "@/lib/content";
import { ContentForm } from "@/components/admin/content-form";
import { MediaLibrary } from "@/components/admin/media-library";
import { Categories, Users, Contacts } from "@/components/admin/management";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@/generated/prisma/client";
import { publicationInput } from "@/lib/dates";
export default async function Manage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string; path?: string[] }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
    category?: string;
    page?: string;
    sort?: string;
    kind?: string;
  }>;
}) {
  const { section, path = [] } = await params;
  const sp = await searchParams;
  const user = await requireUser();
  if (section === "media")
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">ASSET LIBRARY</p>
            <h1>Media Library</h1>
          </div>
        </div>
        <MediaLibrary
          initial={await db.media.findMany({
            orderBy: { createdAt: "desc" },
            take: 500,
          })}
        />
      </>
    );
  if (section === "categories") {
    const rows = await db.category.findMany({
      where:
        user.role === "ADMIN"
          ? {}
          : { kind: { in: ["POST", "PROJECT", "ALBUM"] } },
      orderBy: { sortOrder: "asc" },
    });
    return <Categories rows={rows} admin={user.role === "ADMIN"} />;
  }
  if (section === "users") {
    await requireUser(true);
    return (
      <Users
        rows={await db.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
          },
          orderBy: { createdAt: "asc" },
        })}
      />
    );
  }
  if (section === "contacts") {
    await requireUser(true);
    const page = Math.max(1, Number(sp.page) || 1);
    const where: Prisma.ContactSubmissionWhereInput = {
      ...(sp.q
        ? {
            OR: [
              { name: { contains: sp.q, mode: "insensitive" } },
              { email: { contains: sp.q, mode: "insensitive" } },
              { message: { contains: sp.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(["NEW", "PROCESSING", "CONTACTED", "COMPLETED"].includes(
        sp.status || "",
      )
        ? { status: sp.status as "NEW" }
        : {}),
    };
    const [rows, count] = await Promise.all([
      db.contactSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * 20,
        take: 20,
      }),
      db.contactSubmission.count({ where }),
    ]);
    return (
      <>
        <h1>
          Liên hệ & Booking <small>({count})</small>
        </h1>
        <form className="filter-bar">
          <input name="q" placeholder="Tìm yêu cầu…" defaultValue={sp.q} />
          <select name="status" defaultValue={sp.status}>
            <option value="">Mọi trạng thái</option>
            {["NEW", "PROCESSING", "CONTACTED", "COMPLETED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <Button>Lọc</Button>
        </form>
        <Contacts
          rows={rows.map((r) => ({
            ...r,
            eventDate: r.eventDate?.toISOString() || null,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          }))}
        />
        <Pagination page={page} count={count} search={sp} />
      </>
    );
  }
  if (!isSection(section)) notFound();
  const config = sections[section];
  await requireKind(config.kind);
  if (path[0] === "new" || (path.length === 2 && path[1] === "edit")) {
    const row =
      path[0] === "new"
        ? null
        : await db.content.findUnique({
            where: { id: path[0] },
            include: contentInclude,
          });
    if (path[0] !== "new" && (!row || row.kind !== config.kind)) notFound();
    const [categories, media, related] = await Promise.all([
      db.category.findMany({
        where: { kind: config.kind },
        orderBy: { sortOrder: "asc" },
      }),
      db.media.findMany({ take: 500, orderBy: { createdAt: "desc" } }),
      db.content.findMany({
        where: { kind: { in: ["PROJECT", "POST", "SERVICE"] } },
        include: { translations: true },
        take: 500,
      }),
    ]);
    return (
      <ContentForm
        key={row?.id || "new"}
        kind={config.kind}
        section={section}
        categories={categories}
        media={media}
        related={related.map((r) => ({
          id: r.id,
          title: r.translations.find((t) => t.locale === "vi")?.title || r.slug,
        }))}
        initial={
          row
            ? {
                id: row.id,
                kind: row.kind,
                slug: row.slug,
                status: row.status,
                featured: row.featured,
                sortOrder: row.sortOrder,
                publishedAt: publicationInput(row.publishedAt),
                categoryId: row.categoryId || "",
                coverId: row.coverId || "",
                galleryIds: row.gallery.map((g) => g.mediaId),
                tags: row.tags,
                client: row.client,
                year: row.year,
                location: row.location,
                externalUrl: row.externalUrl,
                videoUrl: row.videoUrl,
                audioUrl: row.audioUrl,
                relatedIds: row.relatedIds,
                data: row.data as Record<string, unknown>,
                translations: (["vi", "en"] as const).map((locale) => {
                  const t = row.translations.find((t) => t.locale === locale);
                  return {
                    locale,
                    title: t?.title || "",
                    excerpt: t?.excerpt || "",
                    body: t?.body || "",
                    metaTitle: t?.metaTitle || "",
                    metaDescription: t?.metaDescription || "",
                    canonical: t?.canonical || "",
                    ogImage: t?.ogImage || "",
                  };
                }),
              }
            : undefined
        }
      />
    );
  }
  if (path.length) notFound();
  if (["PROFILE", "SETTINGS"].includes(config.kind)) {
    const row = await db.content.findFirst({ where: { kind: config.kind } });
    redirect(`/admin/${section}/${row ? `${row.id}/edit` : "new"}`);
  }
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.ContentWhereInput = {
    kind: config.kind,
    ...(sp.q
      ? {
          translations: {
            some: { title: { contains: sp.q, mode: "insensitive" } },
          },
        }
      : {}),
    ...(["DRAFT", "PUBLISHED", "ARCHIVED"].includes(sp.status || "")
      ? { status: sp.status as "DRAFT" }
      : {}),
    ...(sp.category ? { categoryId: sp.category } : {}),
  };
  const [rows, count, categories] = await Promise.all([
    db.content.findMany({
      where,
      include: contentInclude,
      orderBy: { updatedAt: sp.sort === "oldest" ? "asc" : "desc" },
      skip: (page - 1) * 20,
      take: 20,
    }),
    db.content.count({ where }),
    db.category.findMany({ where: { kind: config.kind } }),
  ]);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONTENT LIBRARY</p>
          <h1>
            {config.label} <small>({count})</small>
          </h1>
          <p className="muted">Tạo, biên tập và chia sẻ câu chuyện của bạn.</p>
        </div>
        <Button asChild>
          <Link href={`/admin/${section}/new`}>+ Tạo mới</Link>
        </Button>
      </div>
      <form className="filter-bar">
        <input name="q" placeholder="Tìm theo tiêu đề…" defaultValue={sp.q} />
        <select name="status" defaultValue={sp.status}>
          <option value="">Mọi trạng thái</option>
          <option>DRAFT</option>
          <option>PUBLISHED</option>
          <option>ARCHIVED</option>
        </select>
        <select name="category" defaultValue={sp.category}>
          <option value="">Mọi danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameVi}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort}>
          <option value="newest">Mới cập nhật</option>
          <option value="oldest">Cũ nhất</option>
        </select>
        <Button variant="outline">Lọc</Button>
      </form>
      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Danh mục / tác giả</th>
              <th>Trạng thái</th>
              <th>Ngày đăng / cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.cover && (
                    <Image
                      className="mb-2 rounded-sm object-cover"
                      src={r.cover.url}
                      alt={r.cover.alt}
                      width={64}
                      height={44}
                      unoptimized
                    />
                  )}
                  <Link
                    className="table-title"
                    href={`/admin/${section}/${r.id}/edit`}
                  >
                    {r.translations.find((t) => t.locale === "vi")?.title ||
                      r.slug}
                  </Link>
                  <small>
                    /{r.slug}
                    {r.featured ? " · ★ Featured" : ""}
                  </small>
                </td>
                <td>
                  {r.category?.nameVi || "—"}
                  <small>{r.author.name}</small>
                </td>
                <td>
                  <span className={`badge ${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.publishedAt?.toLocaleDateString("vi-VN") || "—"}
                  <small>{r.updatedAt.toLocaleDateString("vi-VN")}</small>
                </td>
                <td>
                  <div className="flex gap-2 mb-2">
                    <Link href={`/admin/${section}/${r.id}/edit`}>Sửa</Link>
                    <Link href={`/admin/preview/${r.id}`} target="_blank">
                      Preview ↗
                    </Link>
                  </div>
                  <RowActions id={r.id} published={r.status === "PUBLISHED"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <p className="empty-state">Chưa có nội dung phù hợp.</p>
        )}
      </div>
      <Pagination page={page} count={count} search={sp} />
    </>
  );
}
function Pagination({
  page,
  count,
  search,
}: {
  page: number;
  count: number;
  search: Record<string, string | undefined>;
}) {
  function href(n: number) {
    const p = new URLSearchParams();
    Object.entries(search).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    p.set("page", String(n));
    return `?${p}`;
  }
  return (
    <nav className="pagination">
      {page > 1 && <Link href={href(page - 1)}>← Trước</Link>}
      <span>
        Trang {page} / {Math.max(1, Math.ceil(count / 20))}
      </span>
      {page * 20 < count && <Link href={href(page + 1)}>Tiếp →</Link>}
    </nav>
  );
}
