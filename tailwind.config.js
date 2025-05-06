/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        black: "#000000",
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        primary: {
          50: '#EBF8FF',
          100: '#D1ECFF',
          200: '#A6D8FF',
          300: '#7BC2FF',
          400: '#51ADFF',
          500: '#2897FF',
          600: '#0077E6',
          700: '#005BB3',
          800: '#003D80',
          900: '#00264D',
        },
        danger: {
          DEFAULT: '#FF4136',
          light: '#FF6C64',
          dark: '#D10A00',
        },
        warning: {
          DEFAULT: '#FF851B',
          light: '#FFA64C',
          dark: '#D16100',
        },
        success: {
          DEFAULT: '#2ECC40',
          light: '#5FE56F',
          dark: '#129C25',
        },
      }
    },
  },
  safelist: [
    'bg-white',
    'text-gray-800',
    'hover:bg-gray-100',
    'border-gray-200',
    'bg-gray-50'
  ],
  plugins: [],
} 