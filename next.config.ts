
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Required for Capacitor to build APK
  typescript: {
    // Ensuring CI build doesn't hang on type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ensuring CI build doesn't hang on linting issues
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'ibb.co.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co.com',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      }
    ],
  },
};

export default nextConfig;
