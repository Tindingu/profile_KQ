import "dotenv/config";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    enableChannelBinding: true,
  }),
});
export const labelDefaults = {
  vi: {
    brandSubtitle: "MC & STORYTELLER",
    strip: "MC / EVENT HOST|✳|VOICE TALENT|✳|STORYTELLER|✳|BRAND COLLABORATOR",
    heroLocation: "HO CHI MINH CITY, VIETNAM",
    heroPhotoLabel: "THE ART OF CONNECTION",
    heroPhotoNote: "01 — PERSONAL JOURNAL",
    heroSeal: "KQ.",
    heroSealNote: "WITH PURPOSE",
    storyHeading: "Mỗi bước đi, một câu chuyện.",
    detailCta: "Cùng tạo nên một khoảnh khắc đáng nhớ.",
    detailButton: "Trao đổi về dự án",
    articleRelated: "Câu chuyện tiếp theo",
  },
  en: {
    brandSubtitle: "MC & STORYTELLER",
    strip: "MC / EVENT HOST|✳|VOICE TALENT|✳|STORYTELLER|✳|BRAND COLLABORATOR",
    heroLocation: "HO CHI MINH CITY, VIETNAM",
    heroPhotoLabel: "THE ART OF CONNECTION",
    heroPhotoNote: "01 — PERSONAL JOURNAL",
    heroSeal: "KQ.",
    heroSealNote: "WITH PURPOSE",
    storyHeading: "Every step has a story.",
    detailCta: "Let’s create a memorable moment.",
    detailButton: "Start a conversation",
    articleRelated: "More stories",
  },
};
export async function upgradeDefaults() {
  const settings = await db.content.findUnique({
    where: { kind_slug: { kind: "SETTINGS", slug: "settings" } },
  });
  if (settings) {
    const data = settings.data as Record<string, unknown>;
    const labels = (data.labels || {}) as Record<
      string,
      Record<string, string>
    >;
    const socials = (data.socials as Record<string, string>) || {};
    await db.content.update({
      where: { id: settings.id },
      data: {
        data: {
          favicon: "",
          ...data,
          socials: {
            Zalo: "",
            Facebook: "",
            TikTok: "",
            Instagram: "",
            YouTube: "",
            ...socials,
          },
          labels: {
            vi: { ...labelDefaults.vi, ...labels.vi },
            en: { ...labelDefaults.en, ...labels.en },
          },
        } as Prisma.InputJsonValue,
      },
    });
  }
  const profile = await db.content.findUnique({
    where: { kind_slug: { kind: "PROFILE", slug: "profile" } },
  });
  if (profile)
    await db.content.update({
      where: { id: profile.id },
      data: {
        data: {
          heroImageIds: [],
          heroGreeting: { vi: "Xin chào, tôi là", en: "Hello, I’m" },
          ...(profile.data as Record<string, unknown>),
        } as Prisma.InputJsonValue,
      },
    });
  await db.$disconnect();
}
if (process.argv[1]?.includes("upgrade-content-defaults"))
  upgradeDefaults().finally(() => db.$disconnect());
