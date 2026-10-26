import Image from "next/image";
import { ArrowUpRight, AudioLines, Mic2, Sparkles } from "lucide-react";
import { translated, type ContentRecord } from "@/lib/content";
import { TransitionLink } from "./page-transition";
import { Reveal } from "./interactions";

export function ServiceShowcase({ services, locale, portrait }: {
  services: ContentRecord[];
  locale: string;
  portrait?: ContentRecord["cover"];
}) {
  return (
    <div className="service-showcase">
      {services.map((service, index) => {
        const text = translated(service, locale);
        // Use the owner's portrait in place of the original demo person's photo.
        const cover = service.cover?.publicId === "seed/portrait" && portrait ? portrait : service.cover;
        const Icon = service.slug === "voice-talent" ? AudioLines
          : service.slug === "hop-tac-thuong-hieu" ? Sparkles : Mic2;
        return (
          <Reveal key={service.id} className="service-tile-reveal">
            <TransitionLink className="service-tile" href={`/${locale}/dich-vu/${service.slug}`}>
              <div className="service-tile-image">
                {cover ? <Image
                  src={cover.url}
                  alt={cover.alt || text?.title || ""}
                  fill
                  sizes="(max-width: 540px) 88vw, (max-width: 900px) 44vw, 33vw"
                /> : <Icon className="service-tile-placeholder" strokeWidth={.7} aria-hidden="true" />}
                <span className="service-tile-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}<span> / KQ</span></span>
                <span className="service-tile-icon" aria-hidden="true"><Icon size={25} strokeWidth={1.3} /></span>
              </div>
              <div className="service-tile-copy">
                <h3>{text?.title}</h3>
                <p>{text?.excerpt}</p>
                <span className="service-tile-cta">
                  {locale === "en" ? "Explore stories" : "Khám phá dịch vụ"}
                  <span className="service-tile-arrow"><ArrowUpRight size={20} strokeWidth={1.3} aria-hidden="true" /></span>
                </span>
              </div>
            </TransitionLink>
          </Reveal>
        );
      })}
    </div>
  );
}
