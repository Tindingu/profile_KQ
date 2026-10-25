import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const u = await db.user.findUnique({ where: { id: session.user.id } });
  if (!u?.active)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(
    await db.media.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
  );
}
