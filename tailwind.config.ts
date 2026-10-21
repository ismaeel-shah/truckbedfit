import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1F2328",
        accent:  "#EA580C",
        amazon:  "#FF9900",
        background: "#F8FAFC",
        surface: "#FFFFFF",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Arial Narrow", "system-ui", "sans-serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #1F2328 0%, #181B20 40%, #0C0D0F 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(234, 88, 12,0.05) 0%, rgba(234, 88, 12,0) 100%)",
        "accent-gradient":
          "linear-gradient(135deg, #EA580C 0%, #F59E0B 100%)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.1)",
        accent: "0 8px 30px rgba(234, 88, 12,0.35)",
        glow: "0 0 40px rgba(234, 88, 12,0.2)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "fade-up": "fadeUp 0.5s ease forwards",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#1F2328",
            a: { color: "#EA580C", "&:hover": { color: "#F59E0B" } },
            "h1,h2,h3,h4": { fontFamily: "var(--font-heading)" },
            img: {
              width: "100%",
              height: "auto",
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: "1.125rem",
            },
            "blockquote": {
              borderLeftColor: "#EA580C",
              fontStyle: "normal",
              background: "rgba(234, 88, 12,0.05)",
              padding: "1rem 1.25rem",
              borderRadius: "0 0.5rem 0.5rem 0",
            },
          },
        },
        invert: {
          css: { color: "#cbd5e1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
