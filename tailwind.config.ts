import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-instrument-sans)"],
        heading: ["var(--font-instrument-sans)"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        background: "#fbfbfa",
        card: "#ffffff",
        primary: "#0f0f0f",
        secondary: "#6f6f6d",
        muted: "#8c8c8c",
        tertiary: "#9a9a9a",
        label: "#a8a8a8",
        faint: "#b7b7b5",
        ghost: "#c4c4c2",
        inactive: "#d4d4d2",
        border: {
          DEFAULT: "#e6e6e4",
          light: "#e8e8e6",
          faint: "#f0f0f0",
        },
        accent: "var(--accent)",
        tint: "var(--tint)",
      },
      maxWidth: {
        prose: "680px",
        grid: "900px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "680px",
            color: "#0f0f0f",
            lineHeight: "1.7",
            "h1, h2, h3, h4": {
              fontFamily: "var(--font-instrument-sans)",
              fontWeight: "500",
            },
            a: {
              color: "#1C5238",
              "&:hover": { textDecorationColor: "#1C5238" },
            },
            blockquote: {
              borderLeftColor: "#e6e6e4",
              fontStyle: "italic",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
