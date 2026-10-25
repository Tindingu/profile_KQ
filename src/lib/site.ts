import { listContent, translated } from "./content";
export type Labels = {
  about: string;
  work: string;
  services: string;
  gallery: string;
  blog: string;
  press: string;
  contact: string;
  all: string;
  read: string;
  booking: string;
  heroEyebrow: string;
  workHeading: string;
  serviceHeading: string;
  blogHeading: string;
  pressHeading: string;
  partnerHeading: string;
  footerHeading: string;
  demo: string;
  brandSubtitle: string;
  strip: string;
  heroLocation: string;
  heroPhotoLabel: string;
  heroPhotoNote: string;
  heroSeal: string;
  heroSealNote: string;
  storyHeading: string;
  detailCta: string;
  detailButton: string;
  articleRelated: string;
};
export async function siteData(locale: string) {
  const [profiles, settings] = await Promise.all([
    listContent("PROFILE", 1),
    listContent("SETTINGS", 1),
  ]);
  const profile = profiles[0];
  const setting = settings[0];
  const p = profile ? translated(profile, locale) : null;
  const s = setting ? translated(setting, locale) : null;
  const data = (setting?.data || {}) as Record<string, unknown>;
  const labels = ((data.labels as Record<string, Labels> | undefined)?.[
    locale
  ] || {}) as Labels;
  const socials = (data.socials || {}) as Record<string, string>;
  const profileData = (profile?.data || {}) as Record<string, unknown>;
  return { profile, setting, p, s, data, labels, socials, profileData };
}
export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
