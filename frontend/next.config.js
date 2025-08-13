/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', '127.0.0.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ];
  },
  // Development optimizations (only for webpack, not turbopack)
  ...(process.env.TURBOPACK ? {} : {
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Optimize development build
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
          ignored: ['**/node_modules', '**/.next'],
        };
        

      }
      return config;
    },
  }),
  // Reduce memory usage in development
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react'],
  },
  // Disable some development features that might cause issues
  devIndicators: {
    position: 'bottom-right',
  },
};

module.exports = nextConfig; 