import type {NextConfig} from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: isDev,
})

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
