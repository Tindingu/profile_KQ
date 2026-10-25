import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "node:crypto";
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
test.beforeAll(async () => {
  await db.rateLimit.deleteMany({
    where: {
      key: createHash("sha256")
        .update("login:" + process.env.ADMIN_EMAIL!.toLowerCase())
        .digest("hex"),
    },
  });
});
test.afterAll(async () => {
  await db.content.deleteMany({
    where: { slug: { startsWith: "module-test-" } },
  });
  await db.$disconnect();
});
async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page
    .getByLabel("Email", { exact: true })
    .fill(process.env.ADMIN_EMAIL!);
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole("button", { name: "Đăng nhập →" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test("homepage slogan and hero cover changes are reflected immediately", async ({
  page,
  browser,
}) => {
  const original = await db.content.findUniqueOrThrow({
    where: { kind_slug: { kind: "PROFILE", slug: "profile" } },
    include: { translations: true },
  });
  const vi = original.translations.find((t) => t.locale === "vi")!;
  try {
    await login(page);
    await page.goto("/admin/profile");
    const slogan = `Kết nối mới ${Date.now()}`;
    await page.getByLabel("Mô tả ngắn", { exact: true }).first().fill(slogan);
    await page.getByRole("button", { name: "Chọn từ thư viện" }).last().click();
    await page.locator(".media-tile").nth(2).locator("button").first().click();
    await page.getByRole("button", { name: "Chọn 1 ảnh", exact: true }).click();
    await page
      .getByRole("button", { name: "Lưu nội dung", exact: true })
      .click();
    await expect
      .poll(
        async () =>
          (
            await db.translation.findUnique({
              where: {
                contentId_locale: { contentId: original.id, locale: "vi" },
              },
            })
          )?.excerpt,
      )
      .toBe(slogan);
    const publicContext = await browser.newContext();
    const publicPage = await publicContext.newPage();
    await publicPage.goto("/vi");
    await expect(publicPage.locator(".hero-script")).toHaveText(slogan);
    const changed = await db.content.findUniqueOrThrow({
      where: { id: original.id },
      include: { cover: true },
    });
    expect(changed.coverId).not.toBe(original.coverId);
    await expect(
      publicPage.locator(".hero-visual img").first(),
    ).toHaveAttribute("alt", changed.cover!.alt);
    await publicContext.close();
  } finally {
    await db.content.update({
      where: { id: original.id },
      data: { coverId: original.coverId },
    });
    await db.translation.update({
      where: { contentId_locale: { contentId: original.id, locale: "vi" } },
      data: { excerpt: vi.excerpt },
    });
  }
});
test("service, partner, press, timeline and album share real database CRUD", async ({
  page,
  request,
}) => {
  await login(page);
  for (const section of [
    "services",
    "partners",
    "press",
    "timeline",
    "gallery",
  ]) {
    const slug = `module-test-${section}-${Date.now()}`;
    await page.goto(`/admin/${section}/new`);
    await page
      .getByLabel("Tiêu đề VI *", { exact: true })
      .fill(`Module ${section}`);
    await page.getByLabel("Slug *", { exact: true }).fill(slug);
    await page
      .getByLabel("Trạng thái", { exact: true })
      .selectOption("PUBLISHED");
    if (section === "press")
      await page
        .getByLabel("Link website / bài gốc")
        .fill("https://example.com/illustrative-press");
    await page
      .getByRole("button", { name: "Lưu nội dung", exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/admin/${section}/[^/]+/edit`));
    const record = await db.content.findFirstOrThrow({
      where: { slug },
      include: { translations: true },
    });
    expect(record.translations.find((t) => t.locale === "vi")?.title).toBe(
      `Module ${section}`,
    );
    if (section === "services") {
      const response = await request.get(`/vi/dich-vu/${slug}`);
      expect(await response.text()).toContain("Module services");
    }
    await page.goto(`/admin/${section}?q=Module`);
    const row = page.locator("tr").filter({
      has: page.getByRole("link", { name: `Module ${section}`, exact: true }),
    });
    await row.getByRole("button", { name: "Nhân bản", exact: true }).click();
    await expect
      .poll(() => db.content.count({ where: { slug: { startsWith: slug } } }))
      .toBe(2);
    await row.getByRole("button", { name: "Gỡ đăng", exact: true }).click();
    await expect
      .poll(
        async () =>
          (await db.content.findUnique({ where: { id: record.id } }))?.status,
      )
      .toBe("DRAFT");
    await row.getByRole("button", { name: "Xóa", exact: true }).click();
    await page.getByRole("button", { name: "Xác nhận xóa" }).click();
    await expect
      .poll(async () => db.content.count({ where: { id: record.id } }))
      .toBe(0);
  }
});
test("media metadata persists and an in-use image cannot be deleted", async ({
  page,
}) => {
  await login(page);
  await page.goto("/admin/media");
  const first = page.locator(".media-tile").first();
  const name = await first.locator("p").first().textContent();
  const media = await db.media.findFirstOrThrow({ where: { name: name! } });
  try {
    await first.getByLabel("Alt text").fill("Accessible test description");
    await first.getByLabel("Caption").focus();
    await expect
      .poll(
        async () =>
          (await db.media.findUnique({ where: { id: media.id } }))?.alt,
      )
      .toBe("Accessible test description");
    await first.getByRole("button", { name: "Xóa", exact: true }).click();
    await page.getByRole("button", { name: "Xác nhận xóa" }).click();
    await expect(
      page.getByText("Ảnh đang được sử dụng. Hãy gỡ ảnh khỏi nội dung trước.", {
        exact: true,
      }),
    ).toBeVisible();
    expect(await db.media.count({ where: { id: media.id } })).toBe(1);
  } finally {
    await db.media.update({
      where: { id: media.id },
      data: { alt: media.alt, caption: media.caption },
    });
  }
});
