import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env"))
  throw new Error(".env exists; refusing to replace credentials.");
const dbPassword = randomBytes(24).toString("hex");
writeFileSync(
  ".env",
  `DATABASE_URL="postgresql://portfolio:${dbPassword}@localhost:55432/portfolio"\nAUTH_SECRET="${randomBytes(48).toString("base64url")}"\nAUTH_URL="http://localhost:3000"\nNEXT_PUBLIC_SITE_URL="http://localhost:3000"\nADMIN_EMAIL="admin@localhost.test"\nADMIN_PASSWORD="${randomBytes(18).toString("base64url")}"\n`,
);
console.log(
  "Created ignored .env with random local database and admin credentials. Read ADMIN_EMAIL / ADMIN_PASSWORD in your editor.",
);
