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
        molly: {
          red: "#E8001C",
          "red-dark": "#B50016",
          navy: "#0033A0",
          "navy-light": "#1A4DB0",
          orange: "#F97316",
          amber: "#F59E0B",
          green: "#22C55E",
          slate: "#64748B",
          "slate-light": "#F1F5F9",
          white: "#FFFFFF",
          ink: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      animation: {
        "flash-row": "flashRow 0.3s ease-out",
      },
      keyframes: {
        flashRow: {
          "0%": { backgroundColor: "#fff" },
          "50%": { backgroundColor: "#fbbf24" },
          "100%": { backgroundColor: "#fff" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
