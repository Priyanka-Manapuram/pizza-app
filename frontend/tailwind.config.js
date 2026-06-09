/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pizza: {
          red: "#e63946",
          orange: "#f4a261",
          dark: "#1d3557",
          light: "#f1faee",
        },
      },
    },
  },
  plugins: [],
};
