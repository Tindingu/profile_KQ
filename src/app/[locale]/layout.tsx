import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { TransitionLink as Link, PageTransition, PageScene } from "@/components/public/page-transition";
import Script from "next/script";
import type { Metadata } from "next";
import { siteData } from "@/lib/site";
import { safeUrl } from "@/lib/security";
import { PublicNav } from "@/components/public/interactions";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { s, data } = await siteData(locale);
  return {
    title: {
      default: s?.metaTitle || s?.title || "Portfolio",
      template: `%s | ${s?.title || "Portfolio"}`,
    },
    description: s?.metaDescription || s?.excerpt,
    icons:
      typeof data.favicon === "string" && safeUrl(data.favicon)
        ? { icon: data.favicon }
        : undefined,
  };
}
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!["vi", "en"].includes(locale)) notFound();
  setRequestLocale(locale);
  const { p, s, labels, socials, data, setting } = await siteData(locale);
  const analyticsId =
    typeof data.analyticsId === "string" &&
    /^G-[A-Z0-9]+$/.test(data.analyticsId)
      ? data.analyticsId
      : null;
  return (
    <NextIntlClientProvider locale={locale} messages={{}}>
      <PageTransition brand={p?.title || "Content Studio"} locale={locale}>
      <div className="public-site">
        <PublicNav
          locale={locale}
          brand={p?.title || "Content Studio"}
          labels={labels as unknown as Record<string, string>}
          logo={setting?.cover?.url}
        />
        <PageScene>{children}</PageScene>
        {analyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script
              id="site-analytics"
              strategy="afterInteractive"
            >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(analyticsId)});`}</Script>
          </>
        )}
        <footer className="public-footer">
          <div className="footer-invite">
            <p className="eyebrow">LET’S MAKE SOMETHING MEANINGFUL</p>
            <h2>{labels.footerHeading}</h2>
            <Link
              className="round-arrow"
              href={`/${locale}/lien-he`}
              aria-label={labels.contact}
            >
              ↗
            </Link>
          </div>
          <div className="footer-bottom">
            <Link href={`/${locale}`} className="wordmark">
              {p?.title}
            </Link>
            <div className="social-links">
              {Object.entries(socials)
                .filter(([, url]) => url && safeUrl(url))
                .map(([key, url]) => (
                  <a
                    key={key}
                    href={safeUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {key} ↗
                  </a>
                ))}
            </div>
            <p>
              © {new Date().getFullYear()} {s?.title}
            </p>
          </div>
          <p className="demo-notice">
            {labels.demo} {String(data.footer || "")}
          </p>
        </footer>
      </div>
      </PageTransition>
    </NextIntlClientProvider>
  );
}
