declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAOptions {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    buildExcludes?: string[];
    [key: string]: any;
  }

  export default function withPWA(config?: PWAOptions): (nextConfig: NextConfig) => NextConfig;
}