import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // S&S FASHION color palette
        brand: {
          black: "#000000",
          white: "#ffffff",
          gold: "#D4A843",
          orange: "#E87C22",
          accent: "#D4A843",
          "accent-hover": "#C4963A",
          red: "#E53E3E",
          "red-hover": "#C53030",
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "xl": "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        "card": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.12)",
        "drawer": "0 -4px 30px rgba(0, 0, 0, 0.1)",
      },
      transitionDuration: {
        "200": "200ms",
        "300": "300ms",
      },
    },
  },
  plugins: [],
};

export default config;