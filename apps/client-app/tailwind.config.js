const sharedConfig = require('../../tailwind.config.shared.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    // Include UI library components
    "../../libs/ui/src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  ...sharedConfig,
};
