/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f2',
          100: '#fce7e7',
          200: '#f9d3d3',
          300: '#f4b4b4',
          400: '#ec8989',
          500: '#e06363',
          600: '#cc4747',
          700: '#ab3838',
          800: '#8d2f2f',
          900: '#6F1D1B',    // Maroon profundo - main brand color
          950: '#4a1311',
        },
        secondary: {
          50: '#fefefe',
          100: '#fdfdfc',
          200: '#faf9f7',
          300: '#F5F3F0',    // Bege claro - main secondary
          400: '#ede8e0',
          500: '#e1d9cd',
          600: '#d0c4b3',
          700: '#b8a790',
          800: '#9a8772',
          900: '#7d6e5b',
        },
        text: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#2D2D2D',    // Grafite para textos - main text
          950: '#1a1a1a',
        },
        accent: {
          50: '#fdf8f3',
          100: '#faf0e4',
          200: '#f4ddc4',
          300: '#ecc59b',
          400: '#e3a66f',
          500: '#dc8d4f',
          600: '#ce7944',
          700: '#ab633a',
          800: '#C9A66B',    // Dourado sutil para detalhes
          900: '#74472a',
          950: '#3e2417',
        },
        neutral: {
          50: '#f9f9f9',
          100: '#f0f0f0',
          200: '#E5E5E5',    // Cinza para fundos e divisores - main neutral
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
