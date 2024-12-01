/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.proximus.be',
      },
      {
        protocol: 'https',
        hostname: '**.orange.be',
      },
      {
        protocol: 'https',
        hostname: '**.telenet.be',
      },
      {
        protocol: 'https',
        hostname: '**.base.be',
      }
    ],
  },
}

module.exports = nextConfig
