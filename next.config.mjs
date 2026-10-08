/** @type {import('next').NextConfig} */
const codespaceOrigin =
  process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? `${process.env.CODESPACE_NAME}-${process.env.PORT || '3000'}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
    : null;
const codespaceLocalOrigin = codespaceOrigin ? `localhost:${process.env.PORT || '3000'}` : null;

const serverActionOrigins = [
  codespaceOrigin,
  codespaceLocalOrigin,
  ...(process.env.SERVER_ACTIONS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
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
    serverActions: {
      allowedOrigins: serverActionOrigins,
    },
  },
  // Disable x-powered-by header for security
  poweredByHeader: false,
};

export default nextConfig;
