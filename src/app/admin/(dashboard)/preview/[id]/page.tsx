import { db } from "@/lib/db";
import { contentInclude } from "@/lib/content";
import { requireKind, requireUser } from "@/lib/access";
import { ContentDetail } from "@/components/public/detail";
import { ServiceListing } from "@/components/public/service-listing";
import { notFound } from "next/navigation";
export const metadata = {
  robots: { index: false, follow: false },
  title: "Preview riêng tư",
};
export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const row = await db.content.findUnique({
    where: { id },
    include: contentInclude,
  });
  if (!row) notFound();
  await requireKind(row.kind);
  const { locale } = await searchParams;
  return (
    <div className="public-site preview-site">
      <p className="preview-banner">
        PRIVATE PREVIEW · {row.status} · Chỉ người dùng đã đăng nhập xem được.
      </p>
      {row.kind === "SERVICE" && !row.parentId ? <ServiceListing
        locale={locale === "en" ? "en" : "vi"}
        slug={row.slug}
        title=""
        search={{}}
        previewTopic={row}
      /> : <ContentDetail
        item={row}
        locale={locale === "en" ? "en" : "vi"}
        path={
          row.kind === "PROJECT"
            ? "kinh-nghiem"
            : row.kind === "SERVICE"
              ? "dich-vu"
              : "blog"
        }
      />}
    </div>
  );
}
