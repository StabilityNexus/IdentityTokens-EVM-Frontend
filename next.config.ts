import type { NextConfig } from "next";

const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // Required for GitHub Pages
  basePath: basePath,
  // `basePath` is applied by the server and the router, but the 404 redirect
  // has to read `window.location.pathname` -- which still carries the prefix --
  // to tell a pretty URL from a real miss. Only NEXT_PUBLIC_ vars reach it.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
