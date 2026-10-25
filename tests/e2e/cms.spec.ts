import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { createHash } from "node:crypto";
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
test.beforeAll(async () => {
  await db.rateLimit.deleteMany({
    where: {
      key: {
        in: [
          createHash("sha256")
            .update("login:" + process.env.ADMIN_EMAIL!.toLowerCase())
            .digest("hex"),
          createHash("sha256").update("login-ip:::1").digest("hex"),
          createHash("sha256").update("login-ip:127.0.0.1").digest("hex"),
        ],
      },
    },
  });
});
const stamp = Date.now();
const slug = `e2e-story-${stamp}`;
const title = `E2E câu chuyện ${stamp}`;
test.afterAll(async () => {
  await db.content.deleteMany({ where: { slug: { startsWith: "e2e-" } } });
  await db.contactSubmission.deleteMany({
    where: { email: `e2e-${stamp}@example.com` },
  });
  await db.user.deleteMany({
    where: { email: `e2e-editor-${stamp}@example.com` },
  });
  await db.$disconnect();
});
async function login(
  page: import("@playwright/test").Page,
  email = process.env.ADMIN_EMAIL!,
  password = process.env.ADMIN_PASSWORD!,
) {
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập →" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test("private admin and media endpoints reject anonymous access", async ({
  page,
  request,
}) => {
  await page.goto("/admin/posts");
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await request.get("/api/media/library")).status()).toBe(401);
});
test("blog: draft → private preview → publish → edit → unpublish", async ({
  page,
  browser,
}) => {
  await login(page);
  await page.goto("/admin/posts/new");
  await page.getByLabel("Tiêu đề VI *", { exact: true }).fill(title);
  await page.getByLabel("Slug *", { exact: true }).fill(slug);
  await page
    .getByLabel("Tags (phân cách bằng dấu phẩy)")
    .pressSequentially("stage, storytelling");
  await page
    .locator(".tiptap")
    .first()
    .fill(
      "Đây là nội dung bài viết được tạo từ Admin qua server và PostgreSQL.",
    );
  await page
    .getByLabel("Danh mục", { exact: true })
    .selectOption({ label: "Nghề MC" });
  await page.getByRole("button", { name: "Chọn từ thư viện" }).last().click();
  await page.locator(".media-tile").first().locator("button").first().click();
  await page.getByRole("button", { name: "Chọn 1 ảnh", exact: true }).click();
  await page.getByRole("button", { name: "Lưu nội dung", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/[^/]+\/edit/);
  const record = await db.content.findUniqueOrThrow({
    where: { kind_slug: { kind: "POST", slug } },
    include: { translations: true },
  });
  expect(record.status).toBe("DRAFT");
  expect(record.coverId).toBeTruthy();
  expect(record.tags).toEqual(["stage", "storytelling"]);
  const anon = await browser.newContext();
  const hidden = await (await anon.request.get(`/vi/blog/${slug}`)).text();
  expect(hidden).not.toContain(title);
  expect(hidden).toContain("noindex");
  const preview = await page.context().newPage();
  await preview.goto(`/admin/preview/${record.id}`);
  await expect(
    preview.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await preview.close();
  await page
    .getByLabel("Trạng thái", { exact: true })
    .selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Lưu nội dung", exact: true }).click();
  await expect(
    page.getByText("Đã lưu nội dung.", { exact: true }).last(),
  ).toBeVisible();
  const publicPage = await anon.newPage();
  await publicPage.goto(`/vi/blog/${slug}`);
  await expect(
    publicPage.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Tiêu đề VI *", { exact: true })
    .fill(`${title} cập nhật`);
  await page.getByRole("button", { name: "Lưu nội dung", exact: true }).click();
  await expect(
    page.getByText("Đã lưu nội dung.", { exact: true }).last(),
  ).toBeVisible();
  await expect
    .poll(
      async () =>
        (
          await db.translation.findUnique({
            where: { contentId_locale: { contentId: record.id, locale: "vi" } },
          })
        )?.title,
    )
    .toBe(`${title} cập nhật`);
  await publicPage.reload();
  await expect(
    publicPage.getByRole("heading", { name: `${title} cập nhật`, exact: true }),
  ).toBeVisible();
  await page.getByLabel("Trạng thái", { exact: true }).selectOption("DRAFT");
  await page.getByRole("button", { name: "Lưu nội dung", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await db.content.findUnique({ where: { id: record.id } }))?.status,
    )
    .toBe("DRAFT");
  const hiddenAfter = await (await anon.request.get(`/vi/blog/${slug}`)).text();
  expect(hiddenAfter).not.toContain(title);
  expect(hiddenAfter).toContain("noindex");
  await anon.close();
});
test("portfolio publishing, multi-image selection and public detail", async ({
  page,
}) => {
  await login(page);
  await page.goto("/admin/portfolio/new");
  await page
    .getByLabel("Tiêu đề VI *", { exact: true })
    .fill(`E2E portfolio ${stamp}`);
  await page.getByLabel("Slug *", { exact: true }).fill(`e2e-project-${stamp}`);
  await page.getByLabel("Khách hàng / Nhà xuất bản").fill("E2E client");
  await page.getByLabel("Năm", { exact: true }).fill("2026");
  await page
    .getByLabel("Danh mục", { exact: true })
    .selectOption({ label: "Doanh nghiệp" });
  await page
    .getByLabel("Trạng thái", { exact: true })
    .selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Chọn từ thư viện" }).first().click();
  await page.locator(".media-tile").nth(0).locator("button").first().click();
  await page.locator(".media-tile").nth(1).locator("button").first().click();
  await page.getByRole("button", { name: "Chọn 2 ảnh", exact: true }).click();
  await page.getByRole("button", { name: "Lưu nội dung", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/portfolio\/[^/]+\/edit/);
  const saved = await db.content.findUniqueOrThrow({
    where: { kind_slug: { kind: "PROJECT", slug: `e2e-project-${stamp}` } },
  });
  expect(saved.status).toBe("PUBLISHED");
  expect(saved.publishedAt!.getTime()).toBeLessThanOrEqual(Date.now());
  await page.goto(`/vi/kinh-nghiem/e2e-project-${stamp}`);
  await expect(
    page.getByRole("heading", { name: `E2E portfolio ${stamp}`, exact: true }),
  ).toBeVisible();
  await expect(page.locator(".photo-tile")).toHaveCount(2);
});
test("booking persists and admin can change status and notes", async ({
  page,
}) => {
  await page.goto("/vi/lien-he");
  await page.getByLabel("Họ và tên *").fill("E2E Nguyễn An");
  await page
    .getByLabel("Email *", { exact: true })
    .fill(`e2e-${stamp}@example.com`);
  await page.getByLabel("Số điện thoại *").fill("0901234567");
  await page
    .getByLabel("Dịch vụ *", { exact: true })
    .selectOption({ index: 1 });
  await page
    .getByLabel("Chia sẻ về dự án của bạn *")
    .fill("Tôi muốn trao đổi về một sự kiện doanh nghiệp.");
  await page.getByRole("button", { name: "Gửi lời mời hợp tác" }).click();
  await expect(page.getByRole("status")).toContainText("thành công");
  const contact = await db.contactSubmission.findFirstOrThrow({
    where: { email: `e2e-${stamp}@example.com` },
  });
  await login(page);
  await page.goto("/admin/contacts");
  await page.getByText("E2E Nguyễn An", { exact: true }).click();
  await page
    .getByLabel("Trạng thái", { exact: true })
    .selectOption("CONTACTED");
  await page.getByLabel("Ghi chú nội bộ").fill("Đã gọi điện xác nhận.");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect
    .poll(
      async () =>
        (await db.contactSubmission.findUnique({ where: { id: contact.id } }))
          ?.status,
    )
    .toBe("CONTACTED");
});
test("editor is denied account and settings access by server", async ({
  page,
}) => {
  const email = `e2e-editor-${stamp}@example.com`;
  const password = `Test!${stamp}LongPassword`;
  await db.user.create({
    data: {
      email,
      name: "E2E Editor",
      passwordHash: await hash(password, 12),
      role: "EDITOR",
    },
  });
  await login(page, email, password);
  await page.goto("/admin/users");
  await expect(
    page.getByRole("heading", { name: "Không thể tải nội dung" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Tài khoản quản trị", exact: true }),
  ).toHaveCount(0);
  await page.goto("/admin/settings");
  await expect(
    page.getByRole("heading", { name: "Không thể tải nội dung" }),
  ).toBeVisible();
});
test("public routes, locale switch, gallery keyboard controls and responsive layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of [
    "/vi",
    "/en",
    "/vi/gioi-thieu",
    "/vi/kinh-nghiem",
    "/vi/dich-vu",
    "/vi/hinh-anh",
    "/vi/blog",
    "/vi/bao-chi",
    "/vi/lien-he",
  ]) {
    const r = await page.goto(path);
    expect(r?.status(), path).toBe(200);
    await expect(page.locator("html")).toHaveAttribute(
      "lang",
      path.startsWith("/en") ? "en" : "vi",
    );
    await expect(page.locator("main:visible").first()).toBeVisible();
  }
  await page.goto("/vi/blog/truoc-khi-den-sang");
  await page.locator(".language-switch").click();
  await expect(page).toHaveURL("/en/blog/truoc-khi-den-sang");
  await page.goto("/vi/hinh-anh");
  await page.locator(".photo-tile").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("figcaption")).toContainText("2/");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi");
  await expect(page.locator(".hero h1")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: ".local/mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".hero h1")).toBeVisible();
  await page.screenshot({ path: ".local/desktop.png", fullPage: true });
  expect(errors).toEqual([]);
});
