/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // Segue o sistema automaticamente
  theme: {
    extend: {
      colors: {
        // Paleta Vaporwave
        vaporwave: {
          pink: '#FF71CE',
          'pink-bright': '#FF10F0',
          cyan: '#01CDFE',
          'cyan-bright': '#00FFF0',
          purple: '#B967FF',
          'purple-deep': '#7B2CBF',
          yellow: '#FFFB96',
          'yellow-neon': '#FFF44F',
        },
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#01CDFE', // Vaporwave cyan
          600: '#00D9FF',
          700: '#00B8D4',
          900: '#0c2340',
        }
      },
      backgroundImage: {
        'vaporwave-gradient': 'linear-gradient(135deg, #FF71CE 0%, #B967FF 50%, #01CDFE 100%)',
        'vaporwave-radial': 'radial-gradient(circle at center, #B967FF 0%, #7B2CBF 50%, #0c2340 100%)',
      }
    },
  },
  plugins: [],
}
