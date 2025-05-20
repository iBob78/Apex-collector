const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Active le mode strict pour détecter les erreurs

  experimental: {
    optimizeCss: false, // Désactive temporairement l'optimisation CSS
    middlewarePrefetch: "strict" // Optimise les préchargements liés aux middlewares
  },

  images: {
    domains: ['your-cdn.com', 'your-image-source.com'], // Autorise le chargement d’images externes
    formats: ['image/avif', 'image/webp'], // Active des formats optimisés pour le rendu
  },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, 'components'),
      '@styles': path.resolve(__dirname, 'styles'),
    };
    return config;
  }
}

export default nextConfig;
