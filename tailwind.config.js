/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#7c3aed',
        'bg-primary': '#0a0a0a',
        'bg-card': '#1a1a1a',
        'bg-input': '#1e1e1e',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      }
    }
  },
  plugins: []
}
