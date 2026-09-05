import { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/app/lib/prisma";

// Discord access tokens live for 7 days, refresh a minute before that
const DEFAULT_TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000;
const MAX_TOKEN_LIFETIME = 30 * 24 * 60 * 60 * 1000;
const EXPIRY_SKEW = 60 * 1000;

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
        // account.expires_at is an absolute unix timestamp in seconds
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + DEFAULT_TOKEN_LIFETIME;
        token.providerAccountId = account.providerAccountId;
        return token;
      }

      // Valid token? Refresh slightly early so it cannot expire mid-request.
      // Anything further out than Discord can issue is a corrupted value from
      // an older session and has to be refreshed as well.
      if (
        typeof token.expiresAt === "number" &&
        Date.now() + EXPIRY_SKEW < token.expiresAt &&
        token.expiresAt < Date.now() + MAX_TOKEN_LIFETIME
      ) {
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
