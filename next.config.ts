import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "complianceos-new.vercel.app",
      },
    ],
    domains: ["localhost", "complianceos-new.vercel.app"],
    unoptimized: true,
  },
  experimental: {
    reactCompiler: true,
  },
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), "sharp"];
    }
    return config;
  },
};

export default nextConfig;
