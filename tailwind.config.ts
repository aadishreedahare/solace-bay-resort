import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0f1410',
          900: '#161b16',
          800: '#232a23',
        },
        sand: {
          50: '#faf7f0',
          100: '#f3ecdd',
          200: '#e6dabd',
        },
        gold: {
          400: '#c9a227',
          500: '#b8862e',
          600: '#8f6a24',
        },
        sea: {
          500: '#2b6f76',
          600: '#1f5359',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(15, 20, 16, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
