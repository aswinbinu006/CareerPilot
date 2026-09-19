/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--bg-rgb) / <alpha-value>)",
        secondary: "rgb(var(--secondary-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        surfaceLight: "rgb(var(--surface-light-rgb) / <alpha-value>)",
        borderMuted: "rgb(var(--border-muted-rgb) / <alpha-value>)",
        textPrimary: "rgb(var(--text-primary-rgb) / <alpha-value>)",
        textSecondary: "rgb(var(--text-secondary-rgb) / <alpha-value>)",
        textMuted: "var(--text-muted)",
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          hover: "var(--accent-hover)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)"
        },
        charcoal: "rgb(var(--charcoal-rgb) / <alpha-value>)"
      },
      fontFamily: {
        serif: ['"Outfit"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        sans: ['"Manrope"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        editorial: '-0.02em',
        tightest: '-0.04em'
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        'luxury-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
