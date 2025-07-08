const sharedConfig = require('../../tailwind.config.shared.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  ...sharedConfig,
};
