import { z } from "zod";
const url = z
  .string()
  .max(2048)
  .refine(
    (v) => !v || /^https?:\/\//i.test(v),
    "URL phải bắt đầu bằng https:// hoặc http://",
  );
export const translationSchema = z.object({
  locale: z.enum(["vi", "en"]),
  title: z.string().max(220),
  excerpt: z.string().max(2000),
  body: z.string().max(300000),
  metaTitle: z.string().max(220),
  metaDescription: z.string().max(500),
  ogImage: url,
  canonical: url,
});
export const contentSchema = z
  .object({
    id: z.string().optional(),
    kind: z.enum([
      "POST",
      "PROJECT",
      "SERVICE",
      "PARTNER",
      "PRESS",
      "TIMELINE",
      "ALBUM",
      "PROFILE",
      "SETTINGS",
    ]),
    slug: z
      .string()
      .min(1)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    featured: z.boolean(),
    sortOrder: z.number().int().min(0).max(99999),
    publishedAt: z.string().max(50),
    categoryId: z.string(),
    coverId: z.string(),
    galleryIds: z.array(z.string()).max(100),
    tags: z.array(z.string().max(80)).max(30),
    client: z.string().max(250),
    year: z.number().int().min(1900).max(2200).nullable(),
    location: z.string().max(300),
    externalUrl: url,
    videoUrl: url,
    audioUrl: url,
    relatedIds: z.array(z.string()).max(50),
    data: z.record(z.string(), z.unknown()),
    translations: z.array(translationSchema).length(2),
  })
  .refine(
    (v) =>
      v.translations.some(
        (t) => t.locale === "vi" && t.title.trim().length > 0,
      ),
    "Vui lòng nhập tiêu đề tiếng Việt",
  )
  .refine(
    (v) => !v.publishedAt || Number.isFinite(Date.parse(v.publishedAt)),
    "Ngày xuất bản không hợp lệ",
  );
export const contactSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.email().max(254),
  phone: z.string().min(8).max(30),
  company: z.string().max(250),
  service: z.string().min(1).max(200),
  eventDate: z
    .string()
    .max(30)
    .refine((v) => !v || Number.isFinite(Date.parse(v)), "Ngày không hợp lệ"),
  location: z.string().max(300),
  message: z.string().min(15).max(5000),
  website: z.string().max(0),
});
export function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
