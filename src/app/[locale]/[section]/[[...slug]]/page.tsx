import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { Kind, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import {
  contentInclude,
  publicWhere,
  listContent,
  translated,
} from "@/lib/content";
import { siteData, siteUrl } from "@/lib/site";
import { safeUrl, cleanHtml } from "@/lib/security";
import { ContentCard } from "@/components/public/content-card";
import { ContentDetail } from "@/components/public/detail";
import { Gallery } from "@/components/public/interactions";
import { ContactForm } from "@/components/public/contact-form";
type Params = { locale: string; section: string; slug?: string[] };
const kindMap: Record<string, Kind> = {
  blog: "POST",
  "kinh-nghiem": "PROJECT",
  "dich-vu": "SERVICE",
  "bao-chi": "PRESS",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, section, slug } = await params;
  const { labels } = await siteData(locale);
  const names: Record<string, string> = {
    "gioi-thieu": labels.about,
    "kinh-nghiem": labels.work,
    "dich-vu": labels.services,
    "hinh-anh": labels.gallery,
    blog: labels.blog,
    "bao-chi": labels.press,
    "lien-he": labels.contact,
  };
  let title = names[section];
  let description: string | undefined;
  let image: string | undefined;
  let canonical: string | undefined;
  if (slug?.length === 1 && kindMap[section]) {
    const row = await db.content.findFirst({
      where: { kind: kindMap[section], slug: slug[0], ...publicWhere() },
      include: contentInclude,
    });
    if (row) {
      const t = translated(row, locale);
      title = t?.metaTitle || t?.title;
      description = t?.metaDescription || t?.excerpt;
      image = t?.ogImage || row.cover?.url;
      canonical = t?.canonical;
    }
  }
  const path = `/${locale}/${section}${slug ? "/" + slug.join("/") : ""}`;
  return {
    title,
    description,
    alternates: {
      canonical: canonical || path,
      languages: {
        vi: path.replace(/^\/(vi|en)/, "/vi"),
        en: path.replace(/^\/(vi|en)/, "/en"),
      },
    },
    openGraph: {
      title,
      description,
      images: image ? [image] : [],
      url: path,
      locale: locale === "vi" ? "vi_VN" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    sort?: string;
    album?: string;
  }>;
}) {
  const { locale, section, slug = [] } = await params;
  const sp = await searchParams;
  const en = locale === "en";
  const { profile, p, labels, profileData, data, socials } =
    await siteData(locale);
  if (slug.length) {
    if (slug.length !== 1 || !kindMap[section]) notFound();
    const row = await db.content.findFirst({
      where: { kind: kindMap[section], slug: slug[0], ...publicWhere() },
      include: contentInclude,
    });
    if (!row) notFound();
    const related = await db.content.findMany({
      where: {
        ...publicWhere(),
        id: { not: row.id },
        ...(row.relatedIds.length
          ? { AND: { id: { in: row.relatedIds } } }
          : {
              kind: row.kind,
              ...(row.categoryId ? { categoryId: row.categoryId } : {}),
            }),
      },
      include: contentInclude,
      take: 3,
    });
    const t = translated(row, locale);
    const path = `/${locale}/${section}/${row.slug}`;
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": row.kind === "POST" ? "Article" : "CreativeWork",
                headline: t?.title,
                description: t?.excerpt,
                image: row.cover?.url,
                datePublished: row.publishedAt?.toISOString(),
                dateModified: row.updatedAt.toISOString(),
                author: { "@type": "Person", name: row.author.name },
                url: siteUrl() + path,
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: p?.title,
                    item: siteUrl() + `/${locale}`,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: section,
                    item: siteUrl() + `/${locale}/${section}`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: t?.title,
                    item: siteUrl() + path,
                  },
                ],
              },
            ]).replace(/</g, "\u003c"),
          }}
        />
        <ContentDetail
          item={row}
          locale={locale}
          path={section}
          related={related}
          labels={labels}
        />
      </>
    );
  }
  if (section === "gioi-thieu") {
    const timeline = await listContent("TIMELINE");
    const about =
      (profileData.aboutBody as Record<string, string> | undefined)?.[locale] ||
      p?.body ||
      "";
    return (
      <main>
        <section className="section about-page">
          <p className="eyebrow">THE PERSON BEHIND THE MICROPHONE</p>
          <h1>
            {labels.about}
            <span className="serif-italic">{p?.title}</span>
          </h1>
          <div className="about-split">
            {profile?.cover && (
              <Image
                src={profile.cover.url}
                alt={profile.cover.alt}
                width={900}
                height={1100}
                priority
              />
            )}
            <div>
              <p className="large-quote">{p?.excerpt}</p>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: cleanHtml(p?.body || "") }}
              />
              <details className="story-expand">
                <summary>{labels.read} +</summary>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: cleanHtml(String(about)) }}
                />
              </details>
              {Boolean(profileData.pdf) && (
                <a
                  href={safeUrl(String(profileData.pdf))}
                  className="text-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio PDF ↓
                </a>
              )}
            </div>
          </div>
        </section>
        <section className="section timeline-section">
          <p className="eyebrow">A JOURNEY IN CHAPTERS</p>
          <h2>{labels.storyHeading}</h2>
          {timeline.map((t) => (
            <div className="timeline-row" key={t.id}>
              <span>{t.year}</span>
              <div>
                <h3>{translated(t, locale)?.title}</h3>
                <p>{translated(t, locale)?.excerpt}</p>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{
                    __html: cleanHtml(translated(t, locale)?.body || ""),
                  }}
                />
              </div>
            </div>
          ))}
        </section>
        {profile?.gallery.length ? (
          <section id="gallery" className="section">
            <Gallery
              photos={profile.gallery.map((g) => ({ ...g.media }))}
              moreLabel={en ? "Load more" : "Xem thêm"}
            />
          </section>
        ) : null}
      </main>
    );
  }
  if (section === "lien-he") {
    const services = await listContent("SERVICE");
    return (
      <main className="section contact-page">
        <div>
          <p className="eyebrow">LET’S CONNECT</p>
          <h1>
            {en ? "A good story starts with" : "Câu chuyện hay bắt đầu bằng"}
            <span className="serif-italic">
              {en ? "a conversation." : "một lời chào."}
            </span>
          </h1>
          <p>
            {String(
              (
                profileData.contactIntro as Record<string, string> | undefined
              )?.[locale] || "",
            )}
          </p>
          <div className="contact-links">
            {Boolean(data.email) && (
              <a href={`mailto:${String(data.email)}`}>
                {String(data.email)} ↗
              </a>
            )}
            {Boolean(data.phone) && (
              <a href={`tel:${String(data.phone)}`}>{String(data.phone)}</a>
            )}
            {Object.entries(socials)
              .filter(([, v]) => safeUrl(v))
              .map(([k, v]) => (
                <a
                  key={k}
                  href={safeUrl(v)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {k} ↗
                </a>
              ))}
          </div>
        </div>
        <ContactForm
          locale={locale}
          services={services.map((s) => translated(s, locale)?.title || s.slug)}
        />
      </main>
    );
  }
  if (section === "hinh-anh") {
    const albums = await listContent("ALBUM");
    const photos = albums
      .filter((a) => !sp.album || a.id === sp.album)
      .flatMap((a) => a.gallery.map((g) => ({ ...g.media })));
    return (
      <main className="section">
        <header className="listing-header">
          <p className="eyebrow">A VISUAL JOURNAL</p>
          <h1>{labels.gallery}</h1>
        </header>
        <nav className="category-tabs">
          <Link
            className={!sp.album ? "active" : ""}
            href={`/${locale}/hinh-anh`}
          >
            {labels.all}
          </Link>
          {albums.map((a) => (
            <Link
              key={a.id}
              className={sp.album === a.id ? "active" : ""}
              href={`?album=${a.id}`}
            >
              {translated(a, locale)?.title}
            </Link>
          ))}
        </nav>
        <Gallery photos={photos} moreLabel={en ? "Load more" : "Xem thêm"} />
        {!photos.length && (
          <p className="empty-state">
            {en ? "This album is empty." : "Album chưa có hình ảnh."}
          </p>
        )}
      </main>
    );
  }
  const kind = kindMap[section];
  if (!kind) notFound();
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.ContentWhereInput = {
    kind,
    ...publicWhere(),
    ...(sp.q
      ? {
          translations: {
            some: {
              OR: [
                { title: { contains: sp.q, mode: "insensitive" } },
                { excerpt: { contains: sp.q, mode: "insensitive" } },
              ],
            },
          },
        }
      : {}),
    ...(sp.category ? { categoryId: sp.category } : {}),
  };
  const [rows, count, categories] = await Promise.all([
    db.content.findMany({
      where,
      include: contentInclude,
      orderBy:
        sp.sort === "oldest"
          ? { publishedAt: "asc" }
          : [
              { featured: "desc" },
              { publishedAt: "desc" },
              { sortOrder: "asc" },
            ],
      skip: (page - 1) * 9,
      take: 9,
    }),
    db.content.count({ where }),
    db.category.findMany({ where: { kind }, orderBy: { sortOrder: "asc" } }),
  ]);
  const title =
    kind === "POST"
      ? labels.blogHeading
      : kind === "PROJECT"
        ? labels.workHeading
        : kind === "SERVICE"
          ? labels.serviceHeading
          : labels.pressHeading;
  const query = (n: number) => {
    const p = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    p.set("page", String(n));
    return `?${p}`;
  };
  return (
    <main className="section">
      <header className="listing-header">
        <p className="eyebrow">
          {kind === "PROJECT"
            ? "SELECTED WORK"
            : kind === "POST"
              ? "NOTES & REFLECTIONS"
              : kind === "SERVICE"
                ? "WORK WITH ME"
                : "PRESS & MEDIA"}
        </p>
        <h1>{title}</h1>
        <p>
          {count} {en ? "stories to discover" : "câu chuyện để khám phá"}
        </p>
      </header>
      <form className="public-filters">
        <input
          aria-label={en ? "Search" : "Tìm kiếm"}
          name="q"
          placeholder={en ? "Search stories…" : "Tìm kiếm câu chuyện…"}
          defaultValue={sp.q}
        />
        <select
          name="category"
          aria-label="Category"
          defaultValue={sp.category}
        >
          <option value="">{en ? "All categories" : "Tất cả danh mục"}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {en ? c.nameEn || c.nameVi : c.nameVi}
            </option>
          ))}
        </select>
        <select name="sort" aria-label="Sort" defaultValue={sp.sort}>
          <option value="newest">{en ? "Newest" : "Mới nhất"}</option>
          <option value="oldest">{en ? "Oldest" : "Cũ nhất"}</option>
        </select>
        <button className="primary-link">{en ? "Apply" : "Lọc"} ↗</button>
      </form>
      <div className={kind === "PROJECT" ? "work-grid" : "blog-grid"}>
        {rows.map((r) =>
          kind === "PRESS" ? (
            <a
              className="content-card"
              key={r.id}
              href={safeUrl(r.externalUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {r.cover && (
                <div className="card-image">
                  <Image
                    src={r.cover.url}
                    alt={r.cover.alt}
                    width={900}
                    height={600}
                  />
                </div>
              )}
              <p className="eyebrow">
                {r.client} ·{" "}
                {r.publishedAt?.toLocaleDateString(en ? "en-US" : "vi-VN")}
              </p>
              <h3>{translated(r, locale)?.title} ↗</h3>
              <p>{translated(r, locale)?.excerpt}</p>
            </a>
          ) : (
            <ContentCard key={r.id} item={r} locale={locale} path={section} />
          ),
        )}
      </div>
      {!count && (
        <p className="empty-state">
          {en
            ? "No matching content. Try another search."
            : "Chưa có nội dung phù hợp. Hãy thử từ khóa khác."}
        </p>
      )}
      <nav className="pagination">
        {page > 1 && (
          <Link href={query(page - 1)}>← {en ? "Previous" : "Trước"}</Link>
        )}
        <span>
          {page} / {Math.max(1, Math.ceil(count / 9))}
        </span>
        {page * 9 < count && (
          <Link href={query(page + 1)}>{en ? "Next" : "Tiếp"} →</Link>
        )}
      </nav>
    </main>
  );
}
