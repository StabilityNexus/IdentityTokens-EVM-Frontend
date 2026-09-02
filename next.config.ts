import type { NextConfig } from "next";

const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // Required for GitHub Pages
  basePath: basePath,
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
