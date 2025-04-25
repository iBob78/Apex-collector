import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        reveal: {
          '0%': { transform: 'scale(0) rotate(180deg)' },
          '100%': { transform: 'scale(1) rotate(0)' }
        }
      },
      animation: {
        reveal: 'reveal 0.5s ease-out'
      },
      boxShadow: {
        rainbow: '0 0 15px rgba(255,0,0,0.3), 0 0 30px rgba(255,165,0,0.3), 0 0 45px rgba(255,255,0,0.3), 0 0 60px rgba(0,128,0,0.3), 0 0 75px rgba(0,0,255,0.3), 0 0 90px rgba(75,0,130,0.3), 0 0 105px rgba(238,130,238,0.3)',
      }
    },
  },
  plugins: [],
};
export default config;
