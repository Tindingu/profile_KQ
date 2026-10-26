import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { publicWhere } from "@/lib/content";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const records = await db.content.findMany({
    where: { kind: { in: ["POST", "PROJECT", "SERVICE"] }, ...publicWhere(), OR: [{ parentId: null }, { parent: publicWhere() }] },
    select: { slug: true, kind: true, updatedAt: true, parent: { select: { slug: true } } },
  });
  const paths = [
    "",
    "/gioi-thieu",
    "/kinh-nghiem",
    "/dich-vu",
    "/hinh-anh",
    "/blog",
    "/bao-chi",
    "/lien-he",
    ...records.map(
      (r) =>
        `/${r.kind === "POST" ? "blog" : r.kind === "PROJECT" ? "kinh-nghiem" : "dich-vu"}/${r.parent ? r.parent.slug + "/" : ""}${r.slug}`,
    ),
  ];
  return ["vi", "en"].flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteUrl()}/${locale}${path}`,
      alternates: {
        languages: {
          vi: `${siteUrl()}/vi${path}`,
          en: `${siteUrl()}/en${path}`,
        },
      },
    })),
  );
}
