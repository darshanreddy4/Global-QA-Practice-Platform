/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b7cdff",
          300: "#8aabff",
          400: "#5c82f7",
          500: "#3b5fe0",
          600: "#2c47c2",
          700: "#24399b",
          800: "#20317c",
          900: "#1c2a63",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
