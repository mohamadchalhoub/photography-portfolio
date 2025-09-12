/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
  // Increase body size limit for file uploads
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Configure API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default nextConfig
