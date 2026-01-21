/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'thumbnails.roblox.com',
      },
    ],
  },
  // Allow importing from src/ directory
  experimental: {
    serverComponentsExternalPackages: ['cheerio'],
  },
};

export default nextConfig;
