import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#025E65",
        secondary: "#F37B21",
        background: "#F5F5F5",
      },
    },
  },
  plugins: [],
};
export default config;