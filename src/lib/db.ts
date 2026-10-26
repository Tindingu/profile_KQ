import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const globalDb = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaUrl?: string;
  prismaSchema?: string;
};
const prismaSchema = "service-articles-v1";
if (globalDb.prisma && (globalDb.prismaUrl !== process.env.DATABASE_URL || globalDb.prismaSchema !== prismaSchema)) {
  void globalDb.prisma.$disconnect();
  globalDb.prisma = undefined;
}
export const db =
  globalDb.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      enableChannelBinding: true,
      max: 10,
      connectionTimeoutMillis: 20000,
    }),
  });
if (process.env.NODE_ENV !== "production") {
  globalDb.prisma = db;
  globalDb.prismaUrl = process.env.DATABASE_URL;
  globalDb.prismaSchema = prismaSchema;
}
