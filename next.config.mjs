/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: false // Désactivé temporairement
  },
  images: {
    domains: ['images.unsplash.com'], // Pour permettre le chargement des images depuis unsplash
  }
}

export default nextConfig;
