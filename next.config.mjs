/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
