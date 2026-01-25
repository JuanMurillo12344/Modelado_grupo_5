/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  // Esto genera el servidor optimizado para Azure
  output: 'standalone',
  experimental: {
    turbopack: {
      root: './',
    },
  },
};

export default nextConfig;
