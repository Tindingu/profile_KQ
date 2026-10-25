import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { rateLimit } from "@/lib/security";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL || req.url).origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.active)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await rateLimit(`upload:${user.id}`, 100, 3600000)))
    return NextResponse.json({ error: "Quá nhiều lượt tải." }, { status: 429 });
  if (
    !process.env.CLOUDINARY_API_SECRET ||
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY
  )
    return NextResponse.json(
      { error: "Chưa cấu hình Cloudinary trên server." },
      { status: 503 },
    );
  try {
    const form = await req.formData();
    const files = form.getAll("files");
    if (!files.length || files.length > 20)
      throw new Error("Chọn từ 1 đến 20 ảnh.");
    const results = [];
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    for (const file of files) {
      if (
        !(file instanceof File) ||
        file.size > 10 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
        throw new Error("Chỉ nhận JPG, PNG, WebP tối đa 10 MB.");
      const buffer = Buffer.from(await file.arrayBuffer());
      const png = buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const jpg = buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
      const webp =
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";
      if (!(png || jpg || webp))
        throw new Error("Nội dung file không phải ảnh hợp lệ.");
      const uploaded = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "portfolio",
                resource_type: "image",
                allowed_formats: ["jpg", "png", "webp"],
              },
              (e, r) => (e || !r ? reject(e) : resolve(r)),
            )
            .end(buffer);
        },
      );
      try {
        results.push(
          await db.media.create({
            data: {
              publicId: uploaded.public_id,
              url: uploaded.secure_url,
              name: file.name,
              alt: file.name,
              width: uploaded.width,
              height: uploaded.height,
              bytes: uploaded.bytes,
              mime: file.type,
            },
          }),
        );
      } catch (e) {
        await cloudinary.uploader.destroy(uploaded.public_id);
        throw e;
      }
    }
    return NextResponse.json({ media: results });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Upload thất bại. Một số ảnh có thể đã tải thành công; hãy làm mới thư viện.",
      },
      { status: 400 },
    );
  }
}
