import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The PDF route handlers read the bundled Japanese font from assets/fonts/ via fs at
  // request time; Next.js's file tracer can't discover that dynamic path on its own, so it
  // has to be included explicitly or Vercel's deploy will 500 on the font read.
  outputFileTracingIncludes: {
    "/api/resume/pdf": ["./assets/fonts/**"],
  },
};

export default nextConfig;
