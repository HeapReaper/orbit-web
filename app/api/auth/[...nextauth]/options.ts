import { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify guilds",
        },
      },
      httpOptions: {
        timeout: 10000, // 10 seconds timeout
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, account }) {
      // On first login
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken =
          account.refresh_token ?? token.refreshToken ?? null;
        token.expiresAt = Date.now() + account.expires_at! * 1000;
        token.providerAccountId = account.providerAccountId;
        return token;
      }

      // Valid token?
      if (typeof token.expiresAt === "number" && Date.now() < token.expiresAt) {
        return token;
      }

      // No refresh token → force re-login
      if (!token.refreshToken) {
        token.accessToken = null;
        return token;
      }

      // Refresh the token
      try {
        const params = new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID!,
          client_secret: process.env.DISCORD_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        });

        const res = await fetch("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        });

        const refreshed = await res.json();

        if (!res.ok) throw new Error("Failed to refresh Discord token");

        token.accessToken = refreshed.access_token;
        token.refreshToken = refreshed.refresh_token ?? token.refreshToken;
        token.expiresAt = Date.now() + refreshed.expires_in * 1000;
      } catch (err) {
        console.error("Discord refresh error:", err);
        token.accessToken = null;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.providerAccountId as string;
      session.accessToken = token.accessToken as string | null;
      return session;
    },
  },
};
