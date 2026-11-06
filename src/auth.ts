import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validators";

declare module "next-auth" {
  interface Session {
    user: { id: string; isAdmin: boolean; name?: string | null; email?: string | null; image?: string | null };
  }
}
declare module "@auth/core/jwt" {
  interface JWT {
    uid?: string;
    isAdmin?: boolean;
  }
}

export const googleEnabled = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        return ok ? { id: user.id, name: user.name, email: user.email, image: user.image } : null;
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || !profile.email_verified) return false;
      await db.user.upsert({
        where: { email: profile.email.toLowerCase() },
        update: {},
        create: { email: profile.email.toLowerCase(), name: profile.name ?? profile.email, image: profile.picture as string | undefined },
      });
      return true;
    },
    async jwt({ token, user, trigger }) {
      // Resolve the DB user id + admin flag on sign-in (and on explicit update()).
      if (user || trigger === "update" || !token.uid) {
        const u = await db.user.findUnique({
          where: { email: String(user?.email ?? token.email ?? "").toLowerCase() },
          select: { id: true, admin: { select: { id: true } } },
        });
        token.uid = u?.id;
        token.isAdmin = !!u?.admin;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.uid ?? "";
      session.user.isAdmin = !!token.isAdmin;
      return session;
    },
  },
});
