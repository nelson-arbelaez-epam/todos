/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        'primary-light': '#818CF8',
        'primary-dark': '#3730A3',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        'surface-elevated': '#FFFFFF',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-disabled': '#9CA3AF',
        'text-inverse': '#FFFFFF',
        border: '#E5E7EB',
        'border-focus': '#4F46E5',
      },
    },
  },
  plugins: [],
};
