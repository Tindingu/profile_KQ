"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink as Link } from "@/components/public/page-transition";
import Image from "next/image";
import { motion } from "motion/react";
import { Menu, X, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 1, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}
export function PublicNav({
  locale,
  brand,
  labels,
  logo,
}: {
  locale: string;
  brand: string;
  labels: Record<string, string>;
  logo?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const other = locale === "vi" ? "en" : "vi";
  const navBrand = `MC ${brand.replace(/^MC\s+/i, "")}`;
  const links = [
    ["gioi-thieu", "about"],
    ["kinh-nghiem", "work"],
    ["dich-vu", "services"],
    ["hinh-anh", "gallery"],
    ["blog", "blog"],
    ["bao-chi", "press"],
  ];
  return (
    <header className="public-header">
      <Link className="wordmark header-wordmark" href={`/${locale}`} aria-label={`${navBrand} — ${locale === "en" ? "Home" : "Trang chủ"}`}>
        {logo ? (
          <Image src={logo} alt={brand} width={130} height={50} />
        ) : (
          <bdi>{navBrand}</bdi>
        )}
      </Link>
      <nav className={open ? "open" : ""}>
        {links.map(([path, key]) => (
          <Link
            className={pathname.includes(path) ? "active" : ""}
            onClick={() => setOpen(false)}
            key={path}
            href={`/${locale}/${path}`}
          >
            {labels[key]}
          </Link>
        ))}
        <Link
          className="mobile-nav-contact"
          href={`/${locale}/lien-he`}
          onClick={() => setOpen(false)}
        >
          {labels.contact} ↗
        </Link>
      </nav>
      <div className="header-right">
        <Link
          className="language-switch"
          href={pathname.replace(/^\/(vi|en)/, `/${other}`)}
        >
          {locale.toUpperCase()} <span>/ {other.toUpperCase()}</span>
        </Link>
        <Link className="header-book" href={`/${locale}/lien-he`}>
          {labels.contact} ↗
        </Link>
        <button
          className="mobile-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
type Photo = { url: string; alt: string; caption: string; id: string };
export function Gallery({
  photos,
  moreLabel,
}: {
  photos: Photo[];
  moreLabel: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [limit, setLimit] = useState(12);
  useEffect(() => {
    if (active === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight")
        setActive((i) => (i === null ? null : (i + 1) % photos.length));
      if (e.key === "ArrowLeft")
        setActive((i) =>
          i === null ? null : (i - 1 + photos.length) % photos.length,
        );
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active, photos.length]);
  return (
    <>
      <div className="photo-grid">
        {photos.slice(0, limit).map((p, i) => (
          <button
            key={`${p.id}-${i}`}
            onClick={() => setActive(i)}
            className="photo-tile"
          >
            <Image
              src={p.url}
              alt={p.alt}
              width={700}
              height={i % 3 === 0 ? 900 : 600}
              sizes="(max-width: 700px) 100vw, 33vw"
            />
            <span>{p.caption || p.alt}</span>
          </button>
        ))}
      </div>
      {photos.length > limit && (
        <button className="text-link" onClick={() => setLimit(limit + 12)}>
          {moreLabel} ↓
        </button>
      )}
      {active !== null && photos[active] && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={photos[active].alt}
          onClick={() => setActive(null)}
        >
          <button
            className="lightbox-close"
            aria-label="Close"
            autoFocus
            onClick={() => setActive(null)}
          >
            <X />
          </button>
          <button
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              setActive((active - 1 + photos.length) % photos.length);
            }}
          >
            <ArrowLeft />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[active].url}
              alt={photos[active].alt}
              width={1400}
              height={1000}
            />
            <figcaption>
              {photos[active].caption} · {active + 1}/{photos.length}
            </figcaption>
          </figure>
          <button
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              setActive((active + 1) % photos.length);
            }}
          >
            <ArrowRight />
          </button>
        </div>
      )}
    </>
  );
}
export function ShareButton({ label }: { label: string }) {
  return (
    <button
      className="text-link"
      onClick={async () => {
        try {
          if (navigator.share)
            await navigator.share({
              title: document.title,
              url: location.href,
            });
          else {
            await navigator.clipboard.writeText(location.href);
            toast.success("Link copied");
          }
        } catch {}
      }}
    >
      {label} ↗
    </button>
  );
}
