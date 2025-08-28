/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4B49AC", // main
          light: "#7DA0FA",  // lighter
          dark: "#7978E9",   // darker
        },
        secondary: {
          DEFAULT: "#F3797E",
          light: "#FF6584",
        },
        neutral: {
          bg: "#F9FAFB",    // background
          text: "#111827",  // main text
          subtext: "#6B7280", // secondary text
        }
      },
    },
  },
  plugins: [],
}