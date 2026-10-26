import { TransitionLink as Link } from "@/components/public/page-transition";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { contentInclude, publicWhere, translated, type ContentRecord } from "@/lib/content";
import { cleanHtml } from "@/lib/security";
import { ContentCard } from "./content-card";

export async function ServiceListing({ locale, slug, title, search, previewTopic }: {
  locale: string;
  slug?: string;
  title: string;
  search: { q?: string; page?: string; sort?: string };
  previewTopic?: ContentRecord;
}) {
  const en = locale === "en";
  const topics = await db.content.findMany({
    where: { kind: "SERVICE", parentId: null, ...publicWhere() },
    include: contentInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  if (previewTopic && !topics.some((item) => item.id === previewTopic.id)) topics.push(previewTopic);
  const topic = previewTopic || (slug ? topics.find((item) => item.slug === slug) : undefined);
  if (slug && !topic) notFound();
  const t = topic && translated(topic, locale);
  const page = Math.max(1, Math.floor(Number(search.page) || 1));
  const where = {
    kind: "SERVICE" as const,
    parentId: topic?.id,
    ...publicWhere(),
    ...(search.q ? { translations: { some: { OR: [
      { title: { contains: search.q, mode: "insensitive" as const } },
      { excerpt: { contains: search.q, mode: "insensitive" as const } },
    ] } } } : {}),
  };
  const [articles, count] = topic ? await Promise.all([
    db.content.findMany({ where, include: contentInclude, take: 9, skip: (page - 1) * 9,
      orderBy: { publishedAt: search.sort === "oldest" ? "asc" : "desc" } }),
    db.content.count({ where }),
  ]) : [[], 0];
  const pageLink = (next: number) => {
    const query = new URLSearchParams();
    if (search.q) query.set("q", search.q);
    if (search.sort) query.set("sort", search.sort);
    query.set("page", String(next));
    return `?${query}`;
  };
  return <main className="section">
    <header className="listing-header">
      {topic && <Link className="eyebrow" href={`/${locale}/dich-vu`}>← {en ? "SERVICES" : "DỊCH VỤ"}</Link>}
      {!topic && <p className="eyebrow">WORK WITH ME</p>}
      <h1>{t?.title || title}</h1>
      {t?.excerpt && <p>{t.excerpt}</p>}
    </header>
    <nav className="category-tabs" aria-label={en ? "Service topics" : "Chủ đề dịch vụ"}>
      {topics.map((item) => <Link key={item.id} href={`/${locale}/dich-vu/${item.slug}`} className={item.id === topic?.id ? "active" : ""}>{translated(item, locale)?.title}</Link>)}
    </nav>
    {topic ? <>
      {t?.body && <details className="story-expand service-topic-intro">
        <summary>{en ? "About this service" : "Giới thiệu dịch vụ"}</summary>
        <div className="prose" dangerouslySetInnerHTML={{ __html: cleanHtml(t.body) }} />
      </details>}
      <h2>{en ? "Articles" : "Bài viết"} <small>({count})</small></h2>
      <form className="public-filters">
        <input name="q" aria-label={en ? "Search articles" : "Tìm bài viết"} placeholder={en ? "Search articles…" : "Tìm bài viết trong chủ đề…"} defaultValue={search.q} />
        <select name="sort" aria-label={en ? "Sort" : "Sắp xếp"} defaultValue={search.sort}>
          <option value="newest">{en ? "Newest" : "Mới nhất"}</option>
          <option value="oldest">{en ? "Oldest" : "Cũ nhất"}</option>
        </select>
        <button className="primary-link">{en ? "Apply" : "Lọc"} ↗</button>
      </form>
      <div className="blog-grid">{articles.map((item) => <ContentCard key={item.id} item={item} locale={locale} path="dich-vu" />)}</div>
      {!count && <p className="empty-state">{search.q ? en ? "No matching articles." : "Không có bài viết phù hợp với từ khóa." : en ? "Articles on this topic will be updated soon." : "Các bài viết về chủ đề này sẽ được cập nhật sớm."}</p>}
      {count > 9 && <nav className="pagination">
        {page > 1 && <Link href={pageLink(page - 1)}>← {en ? "Previous" : "Trước"}</Link>}
        <span>{page} / {Math.max(1, Math.ceil(count / 9))}</span>
        {page * 9 < count && <Link href={pageLink(page + 1)}>{en ? "Next" : "Tiếp"} →</Link>}
      </nav>}
    </> : <>
      {/* <p>{en ? "Choose a service to explore its articles and stories." : "Chọn một dịch vụ để khám phá các bài viết và câu chuyện theo chủ đề."}</p> */}
      <div className="blog-grid">{topics.map((item) => <ContentCard key={item.id} item={item} locale={locale} path="dich-vu" />)}</div>
      {!topics.length && <p className="empty-state">{en ? "Services will be updated soon." : "Dịch vụ sẽ được cập nhật sớm."}</p>}
    </>}
  </main>;
}
