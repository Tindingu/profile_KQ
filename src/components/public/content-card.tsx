import { TransitionLink as Link } from "@/components/public/page-transition";
import Image from "next/image";
import { translated, type ContentRecord } from "@/lib/content";
export function ContentCard({
  item,
  locale,
  path,
  large = false,
}: {
  item: ContentRecord;
  locale: string;
  path: string;
  large?: boolean;
}) {
  const t = translated(item, locale);
  if (!t) return null;
  const words = t.body.replace(/<[^>]+>/g, " ").split(/\s+/).length;
  return (
    <Link
      href={`/${locale}/${path}/${item.kind === "SERVICE" && item.parent ? item.parent.slug + "/" : ""}${item.slug}`}
      className={`content-card ${large ? "large" : ""}`}
    >
      <div className="card-image">
        {item.cover && (
          <Image
            src={item.cover.url}
            alt={item.cover.alt || t.title}
            width={1000}
            height={700}
            sizes="(max-width: 700px) 100vw, 50vw"
          />
        )}
        <span className="card-arrow">↗</span>
      </div>
      <div className="card-meta">
        <span>
          {locale === "en"
            ? item.category?.nameEn || item.category?.nameVi
            : item.category?.nameVi}
        </span>
        <span>
          {item.kind === "POST"
            ? `${Math.max(1, Math.ceil(words / 200))} ${locale === "en" ? "min read" : "phút đọc"}`
            : item.year}
        </span>
      </div>
      <h3>{t.title}</h3>
      {item.kind === "POST" || item.kind === "SERVICE" ? <p>{t.excerpt}</p> : <p>{item.client}</p>}
    </Link>
  );
}
