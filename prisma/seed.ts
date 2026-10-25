import "dotenv/config";
import { upgradeDefaults } from "../scripts/upgrade-content-defaults";
import { PrismaClient, Kind } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import type { Prisma } from "../src/generated/prisma/client";
const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    enableChannelBinding: true,
  }),
});
async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12)
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters).");
  const user = await db.user.upsert({
    where: { email },
    create: {
      name: "Quản trị viên",
      email,
      passwordHash: await hash(password, 12),
      role: "ADMIN",
    },
    update: {},
  });
  const mediaData = [
    [
      "portrait",
      "photo-1500648767791-00dcc994a43e",
      "Chân dung minh họa — Unsplash",
    ],
    [
      "conference",
      "photo-1540575467063-178a50c2df87",
      "Không gian hội nghị — Unsplash",
    ],
    [
      "stage",
      "photo-1470225620780-dba8ba36b745",
      "Sân khấu ánh sáng — Unsplash",
    ],
    [
      "talk",
      "photo-1515187029135-18ee286d815b",
      "Cuộc trò chuyện kết nối — Unsplash",
    ],
    ["studio", "photo-1598488035139-bdbb2231ce04", "Phòng thu âm — Unsplash"],
    [
      "journal",
      "photo-1455390582262-044cdead277a",
      "Trang viết và những suy nghĩ — Unsplash",
    ],
    [
      "city",
      "photo-1519608487953-e999c86e7455",
      "Một góc thành phố — Unsplash",
    ],
  ];
  const media: Record<string, string> = {};
  for (const [name, photo, alt] of mediaData) {
    const m = await db.media.upsert({
      where: { publicId: `seed/${name}` },
      create: {
        publicId: `seed/${name}`,
        name: `${name}.jpg`,
        url: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1600&q=85`,
        alt,
        caption: alt,
        width: 1600,
        height: name === "portrait" ? 2000 : 1067,
        bytes: 220000,
        mime: "image/jpeg",
      },
      update: {},
    });
    media[name] = m.id;
  }
  const categories: Record<string, string> = {};
  for (const [kind, names] of [
    [
      "PROJECT",
      [
        ["doanh-nghiep", "Doanh nghiệp", "Corporate"],
        ["chinh-luan", "Chính luận", "Public affairs"],
        ["giai-tri", "Giải trí", "Entertainment"],
        ["truyen-hinh", "Truyền hình", "Television"],
        ["talkshow", "Talkshow", "Talkshow"],
        ["kinh-te", "Kinh tế", "Business"],
        ["khac", "Khác", "Other"],
      ],
    ],
    [
      "POST",
      [
        ["nghe-mc", "Nghề MC", "The craft"],
        ["song-va-viet", "Sống & Viết", "Life & Notes"],
        ["truyen-thong", "Truyền thông", "Communication"],
      ],
    ],
  ] as [Kind, string[][]][]) {
    for (const [slug, nameVi, nameEn] of names) {
      const c = await db.category.upsert({
        where: { kind_slug: { kind, slug } },
        create: { kind, slug, nameVi, nameEn },
        update: {},
      });
      categories[slug] = c.id;
    }
  }
  async function content(
    kind: Kind,
    slug: string,
    title: string,
    titleEn: string,
    excerpt: string,
    excerptEn: string,
    cover: string,
    extra: Record<string, unknown> = {},
  ) {
    const body = String(
      extra.body ||
        `<h2>Mỗi khoảnh khắc đều có ý nghĩa</h2><p>${excerpt}</p><p>Lắng nghe để hiểu điều người đối diện cần, chuẩn bị để mỗi cuộc gặp gỡ đều trọn vẹn. Đó là cách Kiều Quy tiếp cận một câu chuyện mới.</p><blockquote>Sự kết nối bắt đầu từ những điều chân thành.</blockquote><h2>Phía sau một câu chuyện</h2><p>Từ ý tưởng đầu tiên đến buổi tổng duyệt cuối cùng, từng chi tiết nhỏ đều góp phần tạo nên trải nghiệm có chiều sâu.</p>`,
    );
    const bodyEn = String(
      extra.bodyEn ||
        `<h2>Every moment matters</h2><p>${excerptEn}</p><p>Thoughtful preparation and a willingness to listen help turn a moment into a meaningful shared experience.</p><blockquote>Connection begins with sincerity.</blockquote><h2>Behind the story</h2><p>From the first conversation to the final rehearsal, careful attention to detail shapes an experience that feels effortless.</p>`,
    );
    const { body: _, bodyEn: __, gallery: photos, ...rest } = extra;
    void _;
    void __;
    return db.content.upsert({
      where: { kind_slug: { kind, slug } },
      update: {},
      create: {
        kind,
        slug,
        status: "PUBLISHED",
        publishedAt: new Date("2026-10-01T08:00:00Z"),
        authorId: user.id,
        featured: true,
        coverId: media[cover] || null,
        ...rest,
        translations: {
          create: [
            { locale: "vi", title, excerpt, body },
            { locale: "en", title: titleEn, excerpt: excerptEn, body: bodyEn },
          ],
        },
        ...(photos
          ? {
              gallery: {
                create: [...new Set(photos as string[])].map(
                  (key, sortOrder) => ({ mediaId: media[key], sortOrder }),
                ),
              },
            }
          : {}),
      } as Prisma.ContentUncheckedCreateInput,
    });
  }
  await content(
    "PROFILE",
    "profile",
    "Kiều Quy",
    "Kiều Quy",
    "Kể chuyện.\nKết nối.\nTruyền cảm hứng.",
    "Stories.\nConnection.\nInspiration.",
    "portrait",
    {
      body: "<p>Tôi tin rằng một sân khấu đáng nhớ không chỉ được tạo nên bởi ánh đèn, mà còn bởi những câu chuyện chạm đến người nghe.</p><p>Là người dẫn chương trình và người kể chuyện, tôi tìm kiếm sự kết nối chân thành trong mỗi sự kiện, mỗi lời dẫn và mỗi hành trình đồng hành.</p>",
      bodyEn:
        "<p>A memorable stage is shaped by more than the lights. It is shaped by stories that stay with people.</p><p>As an event host and storyteller, I look for honest connections in every conversation, every introduction, and every shared journey.</p>",
      gallery: ["portrait", "studio", "talk"],
      data: {
        roles: {
          vi: "MC sự kiện · Voice Talent · Sáng tạo nội dung",
          en: "Event host · Voice talent · Content creator",
        },
        aboutHeading: {
          vi: "Đằng sau chiếc micro, là một người yêu những câu chuyện.",
          en: "Behind the microphone, a love for stories.",
        },
        aboutBody: {
          vi: "<h2>Hành trình bắt đầu từ sự lắng nghe</h2><p>Kiều Quy là nhân vật minh họa cho website portfolio này. Phần giới thiệu, timeline và dự án là nội dung mẫu để bạn thay thế bằng thông tin đã kiểm chứng của mình.</p>",
          en: "<h2>A journey that starts with listening</h2><p>Kiều Quy is an illustrative identity for this portfolio. Replace this sample biography, timeline, and projects with your verified information.</p>",
        },
        servicesIntro: {
          vi: "Từ sân khấu đến phòng thu, cùng tạo nên những trải nghiệm có ý nghĩa.",
          en: "From the stage to the studio, creating experiences that matter.",
        },
        contactIntro: {
          vi: "Chia sẻ ý tưởng, mong đợi và ngày dự kiến. Tôi mong được lắng nghe câu chuyện của bạn.",
          en: "Share your idea, your expectations and your preferred date. I look forward to hearing your story.",
        },
        pdf: "",
      },
    },
  );
  const labels = {
    vi: {
      about: "Giới thiệu",
      work: "Kinh nghiệm",
      services: "Dịch vụ",
      gallery: "Hình ảnh",
      blog: "Blog",
      press: "Truyền thông",
      contact: "Liên hệ",
      all: "Xem tất cả",
      read: "Câu chuyện của tôi",
      booking: "Kết nối với tôi",
      heroEyebrow: "Mỗi khoảnh khắc, một câu chuyện",
      workHeading: "Những sân khấu.\nNhững dấu ấn.",
      serviceHeading: "Cùng kể câu chuyện\ncủa bạn.",
      blogHeading: "Ghi chép trên hành trình.",
      pressHeading: "Góc nhìn từ truyền thông.",
      partnerHeading: "Những thương hiệu minh họa",
      footerHeading: "Cùng tạo nên điều\nđáng nhớ.",
      demo: "Website minh họa: nhân vật, thương hiệu, dự án và mốc nghề nghiệp là nội dung mẫu.",
    },
    en: {
      about: "About",
      work: "Selected work",
      services: "Services",
      gallery: "Gallery",
      blog: "Journal",
      press: "Press",
      contact: "Let’s talk",
      all: "View all",
      read: "My story",
      booking: "Let’s connect",
      heroEyebrow: "Every moment tells a story",
      workHeading: "The stages.\nThe stories.",
      serviceHeading: "Let’s tell\nyour story.",
      blogHeading: "Notes along the way.",
      pressHeading: "In the spotlight.",
      partnerHeading: "Illustrative brand names",
      footerHeading: "Let’s make something\nworth remembering.",
      demo: "Illustrative portfolio: the identity, brands, projects and career milestones are sample content.",
    },
  };
  await content(
    "SETTINGS",
    "settings",
    "Kiều Quy Studio",
    "Kiều Quy Studio",
    "Website cá nhân & portfolio",
    "Personal website & portfolio",
    "",
    {
      data: {
        labels,
        email: "hello@example.com",
        phone: "",
        socials: {},
        footer: "",
        analyticsId: "",
      },
    },
  );
  const projects = [
    [
      "ket-noi-tuong-lai",
      "Kết nối tương lai — Diễn đàn sáng tạo",
      "Connecting tomorrow — Creative forum",
      "conference",
      "Nova Studio",
      "doanh-nghiep",
    ],
    [
      "mot-dem-ruc-ro",
      "Một đêm, ngàn cảm xúc",
      "One evening, a thousand emotions",
      "stage",
      "Lumière Collective",
      "giai-tri",
    ],
    [
      "cau-chuyen-khoi-nghiep",
      "Những người viết tiếp tương lai",
      "The people shaping what comes next",
      "talk",
      "Open Stories",
      "talkshow",
    ],
    [
      "thanh-pho-trong-toi",
      "Thành phố trong tôi",
      "The city within",
      "city",
      "Urban Notes",
      "truyen-hinh",
    ],
  ];
  for (const [i, [slug, vi, en, image, client, category]] of projects.entries())
    await content(
      "PROJECT",
      slug,
      vi,
      en,
      "Dự án minh họa về hành trình kết nối con người, ý tưởng và những giá trị bền vững.",
      "An illustrative project connecting people, ideas, and lasting values.",
      image,
      {
        client,
        year: 2026,
        categoryId: categories[category],
        sortOrder: i,
        location: "TP. Hồ Chí Minh",
        gallery: [image, "conference", "talk"],
      },
    );
  for (const [i, [slug, vi, en, image, desc, descEn]] of [
    [
      "mc-su-kien",
      "MC Sự kiện & Talkshow",
      "Event hosting & Talkshows",
      "conference",
      "Dẫn dắt mạch cảm xúc, kết nối khán giả và truyền tải trọn vẹn thông điệp.",
      "Connecting audiences and bringing the heart of your event to life.",
    ],
    [
      "voice-talent",
      "Voice Talent",
      "Voice Talent",
      "studio",
      "Một giọng kể có chiều sâu cho TVC, phim thương hiệu và nội dung số.",
      "An expressive voice for commercials, brand films and digital stories.",
    ],
    [
      "hop-tac-thuong-hieu",
      "Hợp tác thương hiệu",
      "Brand collaboration",
      "portrait",
      "Cùng xây dựng nội dung sáng tạo, gần gũi và có giá trị với người xem.",
      "Thoughtful creative collaborations that feel natural and meaningful.",
    ],
  ].entries())
    await content("SERVICE", slug, vi, en, desc, descEn, image, {
      sortOrder: i,
    });
  for (const [i, [slug, vi, en, image, category]] of [
    [
      "truoc-khi-den-sang",
      "Trước khi ánh đèn bật sáng",
      "Before the lights come on",
      "conference",
      "nghe-mc",
    ],
    [
      "lang-nghe-de-ket-noi",
      "Lắng nghe để kết nối sâu hơn",
      "Listening for a deeper connection",
      "talk",
      "truyen-thong",
    ],
    [
      "nhung-khoang-lang",
      "Giá trị của những khoảng lặng",
      "The value of quiet moments",
      "journal",
      "song-va-viet",
    ],
  ].entries())
    await content(
      "POST",
      slug,
      vi,
      en,
      "Những ghi chép nhỏ về sự chuẩn bị, sự chân thành và nghệ thuật kể chuyện trong cuộc sống.",
      "Reflections on preparation, sincerity and the art of telling stories in everyday life.",
      image,
      {
        categoryId: categories[category],
        sortOrder: i,
        tags: ["storytelling", "inspiration"],
      },
    );
  for (const [i, name] of [
    "Nova Studio",
    "Lumière",
    "OPEN STORIES",
    "Urban Notes",
    "MỘC collective",
  ].entries())
    await content(
      "PARTNER",
      `brand-${i}`,
      name,
      name,
      "Thương hiệu mẫu",
      "Illustrative brand",
      "",
      { sortOrder: i },
    );
  await content(
    "ALBUM",
    "san-khau",
    "Phía sau ánh đèn",
    "Behind the lights",
    "Album minh họa",
    "Illustrative album",
    "stage",
    {
      gallery: [
        "stage",
        "conference",
        "talk",
        "studio",
        "portrait",
        "journal",
        "city",
      ],
    },
  );
  for (const [year, title, en] of [
    [
      2020,
      "Chương đầu tiên: tìm thấy giọng nói của mình",
      "The first chapter: finding a voice",
    ],
    [2023, "Những sân khấu, những kết nối mới", "New stages, new connections"],
    [
      2026,
      "Tiếp tục kể những câu chuyện có ý nghĩa",
      "Continuing to tell meaningful stories",
    ],
  ] as const)
    await content(
      "TIMELINE",
      `chapter-${year}`,
      title,
      en,
      "Mốc nghề nghiệp minh họa. Thay thế bằng thông tin xác thực của bạn.",
      "Illustrative career milestone. Replace with your verified information.",
      "",
      { year, sortOrder: year },
    );
  await upgradeDefaults();
  console.log(
    "Seed complete. Existing content and passwords were preserved. Admin credentials are read from the environment.",
  );
}
main().finally(() => db.$disconnect());
