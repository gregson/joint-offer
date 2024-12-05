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
  basePath: '',
  // Ajout de la configuration pour les fichiers statiques
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
