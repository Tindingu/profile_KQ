import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/security";
const dummy = hash("timing-protection-only", 12);
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(input, request) {
        const parsed = z
          .object({
            email: z.email().max(254),
            password: z.string().min(1).max(128),
          })
          .safeParse(input);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          "local";
        if (
          !(await rateLimit(`login-ip:${ip}`, 40, 15 * 60 * 1000)) ||
          !(await rateLimit(`login:${email}`, 8, 15 * 60 * 1000))
        )
          return null;
        const user = await db.user.findUnique({ where: { email } });
        const ok = await compare(
          parsed.data.password,
          user?.passwordHash ?? (await dummy),
        );
        if (!user || !ok || !user.active) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = String(token.uid);
      return session;
    },
  },
});
