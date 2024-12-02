/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['jointoffer.be', 'www.jointoffer.be'],
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
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://www.jointoffer.be' : '',
  basePath: '',
}

module.exports = nextConfig
