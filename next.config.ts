import { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  // Désactiver temporairement l'optimisation CSS expérimentale
  experimental: {
    optimizeCss: false // Changement ici
  }
}

export default config
