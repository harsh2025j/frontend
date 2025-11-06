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
    },
  },
};

export default config;
