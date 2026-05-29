import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "bufferutil",
    "utf-8-validate",
    "@remotion/renderer",
    "@remotion/bundler",
    "@rspack/core",
    "@rspack/binding",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "2gb",
    },
  },
};

export default nextConfig;
