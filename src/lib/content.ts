import { db } from "./db";
import type { Prisma, Kind } from "@/generated/prisma/client";
export const contentInclude = {
  translations: true,
  category: true,
  parent: { select: { slug: true, translations: true } },
  author: { select: { name: true } },
  cover: true,
  gallery: { include: { media: true }, orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ContentInclude;
export type ContentRecord = Prisma.ContentGetPayload<{
  include: typeof contentInclude;
}>;
export function translated(c: ContentRecord, locale: string) {
  return (
    c.translations.find((t) => t.locale === locale && t.title.trim()) ??
    c.translations.find((t) => t.locale === "vi") ??
    c.translations[0]
  );
}
export const visible = {
  status: "PUBLISHED" as const,
  publishedAt: { lte: new Date() },
};
export const publicWhere = () => ({
  status: "PUBLISHED" as const,
  publishedAt: { lte: new Date() },
});
export async function listContent(kind: Kind, take = 100) {
  return db.content.findMany({
    where: { kind, ...(kind === "SERVICE" ? { parentId: null } : {}), ...publicWhere() },
    include: contentInclude,
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    take,
  });
}
export const sections = {
  posts: { kind: "POST", label: "Bài viết", path: "blog" },
  portfolio: { kind: "PROJECT", label: "Portfolio", path: "kinh-nghiem" },
  services: { kind: "SERVICE", label: "Chủ đề dịch vụ", path: "dich-vu" },
  "service-articles": { kind: "SERVICE", label: "Bài viết dịch vụ", path: "dich-vu" },
  partners: { kind: "PARTNER", label: "Đối tác", path: "" },
  press: { kind: "PRESS", label: "Báo chí", path: "bao-chi" },
  timeline: {
    kind: "TIMELINE",
    label: "Timeline & thành tích",
    path: "gioi-thieu",
  },
  gallery: { kind: "ALBUM", label: "Album ảnh", path: "hinh-anh" },
  profile: { kind: "PROFILE", label: "Trang chủ & Giới thiệu", path: "" },
  settings: { kind: "SETTINGS", label: "Cài đặt & SEO", path: "" },
} as const;
export type Section = keyof typeof sections;
export function isSection(value: string): value is Section {
  return Object.hasOwn(sections, value);
}
export const adminOnlyKinds: readonly string[] = [
  "PROFILE",
  "SETTINGS",
  "PARTNER",
  "PRESS",
  "TIMELINE",
  "SERVICE",
];
