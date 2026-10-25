import { auth } from "@/auth";
import { db } from "./db";
import { redirect } from "next/navigation";
import { adminOnlyKinds } from "./content";
export async function requireUser(adminOnly = false) {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.active) redirect("/admin/login");
  if (adminOnly && user.role !== "ADMIN")
    throw new Error("Bạn không có quyền thực hiện thao tác này.");
  return user;
}
export async function requireKind(kind: string) {
  return requireUser(adminOnlyKinds.includes(kind));
}
