import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ajout de la configuration pour Supabase
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // Configuration pour le mode strict TypeScript
  typescript: {
    strict: true,
  },
  // Configuration pour le mode de rendu
  reactStrictMode: true,
};

export default nextConfig;
