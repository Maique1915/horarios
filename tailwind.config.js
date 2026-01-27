/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#2563EB",
        "background-light": "#F8FAFC",
        "background-dark": "#0F172A",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E293B",
        "text-light-primary": "#0F172A",
        "text-dark-primary": "#F8FAFC",
        "text-light-secondary": "#64748B",
        "text-dark-secondary": "#94A3B8",
        "border-light": "#E2E8F0",
        "border-dark": "#334155",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
