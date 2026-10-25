import { HeroImages } from "@/components/public/hero-images";
import Image from "next/image";
import { db } from "@/lib/db";
import Link from "next/link";
import { listContent, translated } from "@/lib/content";
import { siteData, siteUrl } from "@/lib/site";
import { safeUrl, cleanHtml } from "@/lib/security";
import { Reveal } from "@/components/public/interactions";
import { ContentCard } from "@/components/public/content-card";
import type { Metadata } from "next";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { p, s, profile } = await siteData(locale);
  const title = p?.metaTitle || s?.metaTitle || p?.title;
  const description = p?.metaDescription || p?.excerpt;
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: { vi: "/vi", en: "/en" },
    },
    openGraph: {
      title,
      description,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      images: profile?.cover ? [profile.cover.url] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { profile, p, labels, profileData } = await siteData(locale);
  const [projects, services, posts, partners, press] = await Promise.all([
    listContent("PROJECT"),
    listContent("SERVICE"),
    listContent("POST"),
    listContent("PARTNER"),
    listContent("PRESS"),
  ]);
  if (!p || !profile)
    return (
      <main className="error-box">
        <h1>Website chưa có nội dung.</h1>
        <p>Chạy migration và seed, sau đó biên tập trong Admin Portal.</p>
        <Link href="/admin">Mở Admin →</Link>
      </main>
    );
  const slides = Array.isArray(profileData.heroImageIds)
    ? await db.media.findMany({
        where: { id: { in: profileData.heroImageIds as string[] } },
      })
    : [];
  const slideIds = Array.isArray(profileData.heroImageIds)
    ? (profileData.heroImageIds as string[])
    : [];
  const orderedSlides = slideIds.flatMap((id) => {
    const photo = slides.find((photo) => photo.id === id);
    return photo ? [photo] : [];
  });
  const heroPhotos = [
    ...(profile.cover ? [profile.cover] : []),
    ...orderedSlides.filter(
      (photo, index) =>
        photo.id !== profile.coverId &&
        orderedSlides.findIndex((item) => item.id === photo.id) === index,
    ),
  ];
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);
  const featuredPosts = (
    posts.some((p) => p.featured) ? posts.filter((p) => p.featured) : posts
  ).slice(0, 3);
  const heroSubtitle = String(
    (profileData.roles as Record<string, string> | undefined)?.[locale] || "",
  );
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: p.title,
            description: p.excerpt,
            url: siteUrl() + `/${locale}`,
            image: profile.cover?.url,
          }).replace(/</g, "\u003c"),
        }}
      />
      <section className="hero">
        <HeroImages photos={heroPhotos} locale={locale} />
        <div className="hero-copy">
          <Reveal>
            <p className="eyebrow">{heroSubtitle || labels.heroEyebrow}</p>
            <h1>
              {String(
                (
                  profileData.heroGreeting as Record<string, string> | undefined
                )?.[locale] ||
                  (locale === "en" ? "Hello, I’m" : "Xin chào, tôi là"),
              )}
              <span className="hero-name">{p.title}.</span>
            </h1>
            <div
              className="hero-intro prose"
              dangerouslySetInnerHTML={{ __html: cleanHtml(p.body) }}
            />
            <p className="hero-script">{p.excerpt}</p>
            <div className="hero-actions">
              <Link href={`/${locale}/kinh-nghiem`} className="primary-link">
                {labels.work} <span>↗</span>
              </Link>
              <Link className="text-link" href={`/${locale}/lien-he`}>
                {labels.booking} ↗
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      <div className="role-strip">
        {(labels.strip || "").split("|").map((text, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
      <section className="section about-preview">
        <Reveal>
          <p className="eyebrow">01 / {labels.about}</p>
          <h2>
            {String(
              (
                profileData.aboutHeading as Record<string, string> | undefined
              )?.[locale] || labels.about,
            )}
          </h2>
        </Reveal>
        <Reveal>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: cleanHtml(p.body) }}
          />
          <Link href={`/${locale}/gioi-thieu`} className="text-link">
            {labels.read} ↗
          </Link>
        </Reveal>
      </section>
      <section className="section work-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / SELECTED WORK</p>
            <h2>{labels.workHeading}</h2>
          </div>
          <Link className="text-link" href={`/${locale}/kinh-nghiem`}>
            {labels.all} ↗
          </Link>
        </div>
        <div className="work-grid">
          {featuredProjects.map((item, i) => (
            <Reveal key={item.id} className={i % 2 === 1 ? "offset-card" : ""}>
              <ContentCard item={item} locale={locale} path="kinh-nghiem" />
            </Reveal>
          ))}
        </div>
      </section>
      <section className="services-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / WHAT I DO</p>
            <h2>{labels.serviceHeading}</h2>
          </div>
          <p>
            {String(
              (
                profileData.servicesIntro as Record<string, string> | undefined
              )?.[locale] || "",
            )}
          </p>
        </div>
        {services.map((s, i) => {
          const t = translated(s, locale);
          return (
            <Link
              key={s.id}
              href={`/${locale}/dich-vu/${s.slug}`}
              className="service-row"
            >
              <span className="service-number">0{i + 1}</span>
              <h3>{t?.title}</h3>
              <p>{t?.excerpt}</p>
              <span className="service-arrow">↗</span>
            </Link>
          );
        })}
      </section>
      {partners.length > 0 && (
        <section className="section partner-section">
          <p className="eyebrow">{labels.partnerHeading}</p>
          <div className="partner-grid">
            {partners.map((p) => {
              const t = translated(p, locale);
              const content = p.cover ? (
                <Image
                  src={p.cover.url}
                  alt={t?.title || ""}
                  width={150}
                  height={70}
                />
              ) : (
                <span>{t?.title}</span>
              );
              return p.externalUrl ? (
                <a
                  key={p.id}
                  href={safeUrl(p.externalUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {content}
                </a>
              ) : (
                <div key={p.id}>{content}</div>
              );
            })}
          </div>
        </section>
      )}
      <section className="section blog-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">04 / NOTES & REFLECTIONS</p>
            <h2>{labels.blogHeading}</h2>
          </div>
          <Link href={`/${locale}/blog`} className="text-link">
            {labels.all} ↗
          </Link>
        </div>
        <div className="blog-grid">
          {featuredPosts.map((p) => (
            <ContentCard key={p.id} item={p} locale={locale} path="blog" />
          ))}
        </div>
      </section>
      {press.length > 0 && (
        <section className="section press-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">05 / IN THE SPOTLIGHT</p>
              <h2>{labels.pressHeading}</h2>
            </div>
            <Link href={`/${locale}/bao-chi`} className="text-link">
              {labels.all} ↗
            </Link>
          </div>
          {press.slice(0, 3).map((p) => (
            <a
              className="press-row"
              key={p.id}
              href={safeUrl(p.externalUrl)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{p.client}</span>
              <h3>{translated(p, locale)?.title}</h3>
              <span>↗</span>
            </a>
          ))}
        </section>
      )}
    </main>
  );
}
