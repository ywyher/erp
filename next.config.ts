import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'pub-807948bf9f3942aea505db93dacff517.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
