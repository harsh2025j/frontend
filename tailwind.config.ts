import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8",   // blue
        secondary: "#f59e0b", // amber
        gold: "#caa438",
        lightgray: "#d4d4d4",
      },
    },
  },
};

export default config;
