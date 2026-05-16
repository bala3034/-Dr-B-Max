import type { NextConfig } from "next";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  turbopack: {},
};

// next-pwa injects a webpack config which conflicts with Next.js 16 Turbopack.
// Only wrap with next-pwa in production builds.
const isDev = process.env.NODE_ENV === 'development';

let exportConfig: NextConfig = nextConfig;

if (!isDev) {
  const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  });
  exportConfig = withPWA(nextConfig);
}

export default exportConfig;

