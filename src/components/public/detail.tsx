import Image from "next/image";
import type { Labels } from "@/lib/site";
import { TransitionLink as Link } from "@/components/public/page-transition";
import { translated, type ContentRecord } from "@/lib/content";
import { cleanHtml, safeUrl } from "@/lib/security";
import { Gallery, ShareButton } from "./interactions";
import { ContentCard } from "./content-card";
export function ContentDetail({
  item,
  locale,
  path,
  related = [],
  labels,
}: {
  item: ContentRecord;
  locale: string;
  path: string;
  related?: ContentRecord[];
  labels?: Labels;
}) {
  const t = translated(item, locale);
  if (!t) return null;
  const body = cleanHtml(t.body);
  const headings = [...body.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/g)].map(
    (m, i) => ({ id: `section-${i}`, text: m[2].replace(/<[^>]+>/g, "") }),
  );
  let index = 0;
  const withIds = body.replace(
    /<h([23])[^>]*>/g,
    (_, level) => `<h${level} id="section-${index++}">`,
  );
  const youtube = item.videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/,
  );
  return (
    <article>
      <header className="detail-header section">
        <Link className="eyebrow" href={`/${locale}/${path}${item.parent ? "/" + item.parent.slug : ""}`}>
          ← {item.parent ? item.parent.translations.find((t) => t.locale === locale && t.title)?.title || item.parent.translations.find((t) => t.locale === "vi")?.title : path.toUpperCase()}
        </Link>
        <p className="detail-meta">
          {item.category?.[locale === "en" ? "nameEn" : "nameVi"]} ·{" "}
          {item.client || item.author.name} ·{" "}
          {item.year ||
            item.publishedAt?.toLocaleDateString(
              locale === "vi" ? "vi-VN" : "en-US",
            )}
        </p>
        <h1>{t.title}</h1>
        <p className="detail-excerpt">{t.excerpt}</p>
        {item.cover && (
          <Image
            className="detail-cover"
            src={item.cover.url}
            alt={item.cover.alt || t.title}
            width={1600}
            height={1000}
            priority
            sizes="100vw"
          />
        )}
      </header>
      <div className="article-layout section">
        <aside>
          <p className="eyebrow">
            {locale === "en" ? "IN THIS STORY" : "TRONG BÀI VIẾT"}
          </p>
          {headings.map((h) => (
            <a key={h.id} href={`#${h.id}`}>
              {h.text}
            </a>
          ))}
          <ShareButton
            label={locale === "en" ? "Share story" : "Chia sẻ bài viết"}
          />
        </aside>
        <div>
          <div
            className="prose article-prose"
            dangerouslySetInnerHTML={{ __html: withIds }}
          />
          {item.audioUrl && (
            <audio
              className="w-full mt-8"
              controls
              src={safeUrl(item.audioUrl)}
            />
          )}{" "}
          {youtube && (
            <iframe
              className="video-embed"
              title={t.title}
              src={`https://www.youtube-nocookie.com/embed/${youtube[1]}`}
              allowFullScreen
              loading="lazy"
            />
          )}
          <div className="tags">
            {item.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
          {item.location && <p className="muted">{item.location}</p>}
        </div>
      </div>
      {item.gallery.length > 0 && (
        <section className="section">
          <Gallery
            photos={item.gallery.map((g) => ({
              id: g.media.id,
              url: g.media.url,
              alt: g.media.alt,
              caption: g.media.caption,
            }))}
            moreLabel={locale === "en" ? "Load more" : "Xem thêm"}
          />
        </section>
      )}
      <section className="section detail-cta">
        <h2>{labels?.detailCta}</h2>
        <Link href={`/${locale}/lien-he`} className="primary-link">
          {labels?.detailButton} ↗
        </Link>
      </section>
      {related.length > 0 && (
        <section className="section">
          <h2>{labels?.articleRelated}</h2>
          <div className="blog-grid">
            {related.map((r) => (
              <ContentCard
                key={r.id}
                item={r}
                locale={locale}
                path={
                  r.kind === "PROJECT"
                    ? "kinh-nghiem"
                    : r.kind === "SERVICE"
                      ? "dich-vu"
                      : "blog"
                }
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
