import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8",
        secondary: "#f59e0b",
        gold: "#caa438",
        lightgray: "#d4d4d4",
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'var(--font-lora)', 'var(--font-noto-serif-devanagari)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'var(--font-source-sans)', 'var(--font-noto-sans-devanagari)', 'Arial', 'sans-serif'],
        sans: ['var(--font-body)', 'var(--font-source-sans)', 'var(--font-noto-sans-devanagari)', 'Arial', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-heading)', 'var(--font-lora)', 'var(--font-noto-serif-devanagari)', 'Georgia', 'serif'],
        lora: ['var(--font-lora)', 'var(--font-noto-serif-devanagari)', 'Georgia', 'serif'],
        'source-sans': ['var(--font-source-sans)', 'var(--font-noto-sans-devanagari)', 'Arial', 'sans-serif'],
        georgia: ['var(--font-heading)', 'var(--font-lora)', 'Georgia', 'serif'],
        merriweather: ['var(--font-heading)', 'var(--font-lora)', 'Georgia', 'serif'],
        ui: ['var(--font-body)', 'var(--font-source-sans)', 'var(--font-noto-sans-devanagari)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
