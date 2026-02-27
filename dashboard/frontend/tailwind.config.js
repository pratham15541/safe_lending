/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
