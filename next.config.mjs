/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true
    // Suppression de serverActions car c'est maintenant activé par défaut
  },
  typescript: {
    ignoreBuildErrors: false
  }
}

export default nextConfig
