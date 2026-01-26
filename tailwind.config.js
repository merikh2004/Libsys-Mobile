/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dito natin sasabihin na lahat ng files sa app at src folders ay may tailwind
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
