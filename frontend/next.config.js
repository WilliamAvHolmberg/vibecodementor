/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Configure for Docker deployment
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configure images domain if using external images
  images: {
    unoptimized: false,
    remotePatterns: [
      // Add your domains here for external images
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },
  
  // Ensure static file generation
  trailingSlash: false,
  
  // Configure for production optimization
  poweredByHeader: false,
  reactStrictMode: true,
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
      {
        source: '/hubs/:path*',
        destination: 'http://localhost:5001/hubs/:path*',
      },
    ];
  },
};

export default nextConfig; 