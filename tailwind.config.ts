import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter Variable", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#17212b",
        canvas: "#f4f7f9",
        brand: {
          50: "#ecfdf7",
          100: "#d1fae9",
          500: "#0f9f78",
          600: "#087f62",
          700: "#08644f",
          900: "#073b31"
        }
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, .04), 0 12px 30px rgba(15, 23, 42, .05)"
      }
    }
  },
  plugins: []
};

export default config;
