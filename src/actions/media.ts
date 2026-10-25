"use server";
import { requireUser } from "@/lib/access";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export async function updateMedia(input: unknown) {
  await requireUser();
  const p = z
    .object({
      id: z.string(),
      alt: z.string().max(500),
      caption: z.string().max(2000),
    })
    .parse(input);
  await db.media.update({
    where: { id: p.id },
    data: { alt: p.alt, caption: p.caption },
  });
  revalidatePath("/", "layout");
}
export async function deleteMedia(id: string) {
  try {
    await requireUser();
    const m = await db.media.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { covers: true, usages: true } } },
    });
    const inline = await db.translation.count({
      where: {
        OR: [
          { body: { contains: m.url } },
          { body: { contains: m.url.replace(/&/g, "&amp;") } },
          { ogImage: m.url },
        ],
      },
    });
    const json = await db.content.findMany({
      where: {
        OR: [{ audioUrl: m.url }, { videoUrl: m.url }, { data: { not: {} } }],
      },
      select: { data: true, audioUrl: true, videoUrl: true },
    });
    if (
      m._count.covers ||
      m._count.usages ||
      inline ||
      json.some(
        (c) =>
          JSON.stringify(c).includes(m.url) || JSON.stringify(c).includes(m.id),
      )
    )
      return {
        ok: false,
        error: "Ảnh đang được sử dụng. Hãy gỡ ảnh khỏi nội dung trước.",
      };
    if (m.publicId.startsWith("seed/"))
      return { ok: false, error: "Tài nguyên mẫu dùng chung được bảo vệ." };
    if (!process.env.CLOUDINARY_API_SECRET)
      return { ok: false, error: "Chưa cấu hình Cloudinary trên server." };
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const result = await cloudinary.uploader.destroy(m.publicId);
    if (!["ok", "not found"].includes(result.result))
      throw new Error("Không xóa được file Cloudinary.");
    await db.media.delete({ where: { id } });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Không thể xóa ảnh. Vui lòng kiểm tra kết nối Cloudinary.",
    };
  }
}
