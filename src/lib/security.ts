import sanitizeHtml from "sanitize-html";
import { createHash } from "node:crypto";
import { db } from "./db";
export function cleanHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "figure",
      "figcaption",
      "iframe",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["id"],
      img: ["src", "alt", "width", "height", "title"],
      iframe: ["src", "width", "height", "allowfullscreen", "title"],
      a: ["href", "target", "rel"],
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
export function safeUrl(value: string) {
  return /^(https?:\/\/|\/[^/]|mailto:|tel:)/i.test(value) ? value : "";
}
export async function rateLimit(
  identity: string,
  limit: number,
  windowMs: number,
) {
  const key = createHash("sha256").update(identity).digest("hex");
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO "RateLimit" ("key","count","expiresAt") VALUES (${key},1,timezone('UTC', NOW()) + (${windowMs} * interval '1 millisecond')) ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "RateLimit"."expiresAt" < timezone('UTC', NOW()) THEN 1 ELSE "RateLimit"."count" + 1 END, "expiresAt" = CASE WHEN "RateLimit"."expiresAt" < timezone('UTC', NOW()) THEN EXCLUDED."expiresAt" ELSE "RateLimit"."expiresAt" END RETURNING "count"`;
  return rows[0].count <= limit;
}
