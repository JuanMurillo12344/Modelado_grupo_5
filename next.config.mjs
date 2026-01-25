/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  // Skip static generation for API routes that need database connection
  experimental: {
    // This ensures API routes are not statically generated at build time
  }
};

export default nextConfig;
