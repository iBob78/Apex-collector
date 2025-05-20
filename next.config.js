import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, 
  experimental: {
    optimizeCss: false,
    middlewarePrefetch: "strict",
  },
  images: {
    domains: ['your-cdn.com', 'your-image-source.com'],
    formats: ['image/avif', 'image/webp'],
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': path.resolve(__dirname, 'components'),
      '@styles': path.resolve(__dirname, 'styles'),
    };
    return config;
  }
};

export default nextConfig; // ✅ Remplace `module.exports` par `export default`
