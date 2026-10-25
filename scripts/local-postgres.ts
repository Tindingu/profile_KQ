import "dotenv/config";
import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL first.");
  const url = new URL(process.env.DATABASE_URL);
  if (!["localhost", "127.0.0.1"].includes(url.hostname))
    throw new Error("Local helper only accepts localhost.");
  const directory = resolve(".local/postgres");
  mkdirSync(resolve(".local"), { recursive: true });
  const pg = new EmbeddedPostgres({
    databaseDir: directory,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    port: Number(url.port || 5432),
    persistent: true,
    authMethod: "scram-sha-256",
    postgresFlags: ["-h", "127.0.0.1"],
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    onLog: () => {},
    onError: (message) => {
      if (String(message).includes("FATAL")) console.error(message);
    },
  });
  if (!existsSync(resolve(directory, "PG_VERSION"))) await pg.initialise();
  await pg.start();
  const client = pg.getPgClient();
  await client.connect();
  const dbName = url.pathname.slice(1);
  if (!/^[a-zA-Z0-9_]+$/.test(dbName))
    throw new Error("Invalid local database name.");
  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname=$1",
    [dbName],
  );
  if (!existing.rowCount) await pg.createDatabase(dbName);
  await client.end();
  console.log(
    `PostgreSQL ready on 127.0.0.1:${url.port || 5432}. Data: .local/postgres`,
  );
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 60000);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
