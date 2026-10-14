import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let Next.js and Turbopack handle global CSS natively.
  // The site uses authored CSS classes, not Tailwind utility classes.
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
