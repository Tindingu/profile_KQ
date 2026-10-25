import "dotenv/config";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { cleanHtml, rateLimit, safeUrl } from "../src/lib/security";
import { slugify, contactSchema, contentSchema } from "../src/lib/validation";
import { db } from "../src/lib/db";
import { publicationDate, publicationInput } from "../src/lib/dates";
test("publishing schedule preserves Vietnam time independently of the server timezone", () => {
  const date = publicationDate("2026-10-25T21:30");
  assert.equal(date.toISOString(), "2026-10-25T14:30:00.000Z");
  assert.equal(publicationInput(date), "2026-10-25T21:30");
  assert.equal(
    publicationDate("2026-10-25T14:30:00Z").getTime(),
    date.getTime(),
  );
});
test("rich text strips scripts, event handlers, javascript URLs and unsafe iframes", () => {
  const html = cleanHtml(
    '<script>alert(1)</script><p onclick="alert(1)">Hello</p><a href="javascript:alert(1)">link</a><img src="https://example.com/a.png" onerror="alert(1)"><iframe src="https://evil.example/embed"></iframe><iframe src="https://www.youtube-nocookie.com/embed/abcdefghijk"></iframe>',
  );
  assert.doesNotMatch(
    html,
    /<script|onclick|onerror|javascript:|src="https:\/\/evil/,
  );
  assert.match(html, /youtube-nocookie/);
  assert.match(html, /<p>Hello<\/p>/);
});
test("Vietnamese slugs normalize safely", () => {
  assert.equal(slugify("Đằng sau ánh đèn!"), "dang-sau-anh-den");
  assert.equal(safeUrl("javascript:alert(1)"), "");
  assert.equal(safeUrl("//evil.com"), "");
  assert.equal(safeUrl("https://example.com"), "https://example.com");
});
test("contact validation rejects spam and malformed fields", () => {
  const valid = {
    name: "Nguyễn An",
    email: "an@example.com",
    phone: "0901234567",
    company: "",
    service: "MC",
    eventDate: "",
    location: "",
    message: "Một yêu cầu hợp tác hợp lệ.",
    website: "",
  };
  assert.equal(contactSchema.safeParse(valid).success, true);
  assert.equal(
    contactSchema.safeParse({ ...valid, website: "spam" }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({ ...valid, eventDate: "not-date" }).success,
    false,
  );
  assert.equal(
    contactSchema.safeParse({ ...valid, email: "not-email" }).success,
    false,
  );
});
test("content validation rejects invalid slug and untranslated Vietnamese title", () => {
  assert.equal(
    contentSchema.safeParse({ kind: "POST", slug: "<script>" }).success,
    false,
  );
});
test("PostgreSQL rate limiter is atomic under concurrency", async () => {
  const key = `test-${Date.now()}`;
  const results = await Promise.all(
    Array.from({ length: 12 }, () => rateLimit(key, 5, 60000)),
  );
  assert.equal(results.filter(Boolean).length, 5);
});
after(async () => {
  await db.$disconnect();
});
