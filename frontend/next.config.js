/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
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