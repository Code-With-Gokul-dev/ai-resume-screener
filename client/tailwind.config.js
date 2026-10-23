/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16212C",
        paper: "#F4F6F8",
        line: "#D9DFE6",
        accent: { DEFAULT: "#0E7C7B", dark: "#0A5F5E", soft: "#E3F2F1" },
        good: { DEFAULT: "#1B8A5A", soft: "#E1F3EA" },
        warn: { DEFAULT: "#9A6700", soft: "#FBF0D4" },
        bad: { DEFAULT: "#B42318", soft: "#FBE4E1" },
      },
    },
  },
  plugins: [],
};
