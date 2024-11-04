/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.pug"],
  theme: {
    fontFamily: {
      sans: ["Playwrite DE Grund", "cursive", "ui-sans-serif", "sans-serif"],
      ui: ["Red Hat Display", "ui-sans-serif", "sans-serif"],
    },
    extend: {
      screens: {
        xs: "360px",
      },
    },
  },
  safelist: ["font-medium", "leading-relaxed"],
  plugins: [require("tailwind-scrollbar")],
};
