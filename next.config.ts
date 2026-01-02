import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/chatbot-kms/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.minio.io',
        pathname: '/**',
      },
    ],
    // Disable optimization for external URLs with signed parameters
    unoptimized: false,
  },
};

export default nextConfig;
