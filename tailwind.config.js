/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const colors = require("tailwindcss/colors");

module.exports = {
  mode: "jit",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        currentColor: "#D73F09",
        neutral: colors.neutral,
      },
      typography: {
        DEFAULT: {
          css: {
            h2: { marginTop: "1em" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        osu: {
          primary: "#D73F09",
          secondary: "#E6E6E6",
          accent: "#00859B",
          neutral: "#000000",
          "base-100": "#ffffff",
          "--rounded-box": "0.4rem",
          "--rounded-btn": "0.2rem",
        },
      },
    ],
  },
};
