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
    unoptimized: true
  },
  output: 'standalone',
  basePath: '',
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/images/:path*',
          destination: '/public/images/:path*'
        }
      ]
    }
  }
}

module.exports = nextConfig
