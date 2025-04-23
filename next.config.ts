import { NextConfig } from 'next'

const config: NextConfig = {
  // Configuration pour le mode de rendu
  reactStrictMode: true,
  
  // Configuration expérimentale
  experimental: {
    optimizeCss: true
  }
}

export default config
