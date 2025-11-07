/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2332",
        "text-light-primary": "#0d121b",
        "text-dark-primary": "#f1f3f7",
        "text-light-secondary": "#4c669a",
        "text-dark-secondary": "#a0b3d7",
        "border-light": "#e7ebf3",
        "border-dark": "#344159",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"]
      },
      borderRadius: {"DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px"},
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
