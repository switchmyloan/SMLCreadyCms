/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ✅ manual toggle ke liye
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {}, // ✅ ab yaha extra colors ki zaroorat nahi
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: { // ✅ apna custom DaisyUI theme
          "primary": "#4B49AC",
          "secondary": "#F3797E",
          "accent": "#7DA0FA",
          "neutral": "#111827",
          "base-100": "#F9FAFB",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      "light",
      "dark",
    ],
  },
}
