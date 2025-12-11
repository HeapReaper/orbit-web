import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" },
      { protocol: "https", hostname: "strapi.botinorbit.com", pathname: "/**" },
      { protocol: "https", hostname: "directus.botinorbit.com", pathname: "/**" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "klikbit",
  project: "orbit-dashboard",
  sentryUrl: "https://glitchtip.klikbit.nl/",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
