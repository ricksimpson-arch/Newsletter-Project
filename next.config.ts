import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 switches the build to a fully static export (used by the
 * GitHub Pages deploy workflow). NEXT_PUBLIC_BASE_PATH sets the subpath the
 * site is served from (e.g. "/Newsletter-Project" on project Pages).
 * Local `next dev` / `next start` and the Playwright E2E run are unaffected.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        basePath: basePath || undefined,
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
