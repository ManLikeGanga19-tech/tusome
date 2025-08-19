import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from trying to compile backend (Encore) code
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      "encore.dev/api": "commonjs encore.dev/api",
      "encore.dev/storage/sqldb": "commonjs encore.dev/storage/sqldb",
    });
    return config;
  },

  // Exclude server folder from Next.js build
  eslint: {
    ignoreDuringBuilds: true, // so linting doesn’t block you
  },
  typescript: {
    ignoreBuildErrors: true, // so Encore TS files don’t block frontend
  },
};

export default nextConfig;
