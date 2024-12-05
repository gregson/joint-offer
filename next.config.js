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
  experimental: {
    outputFileTracingRoot: process.env.NODE_ENV === 'production' ? '/app' : undefined,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  }
}

module.exports = nextConfig
