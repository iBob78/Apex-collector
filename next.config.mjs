/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jkrmpvkfgbkewwtuekxm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: false, // Désactivé temporairement
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Disable x-powered-by header for security
  poweredByHeader: false,
};

export default nextConfig;
