import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
  }
  interface Session {
    accessToken?: string | null;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | null;
    refreshToken?: string | null;
    expiresAt?: number | null;
    providerAccountId?: string | null;
  }
}
