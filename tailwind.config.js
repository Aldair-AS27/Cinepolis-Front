/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        cinepolis: {
          bg: '#040814',         // Azul abismal casi negro (Fondo principal)
          deep: '#0A1128',       // Azul profundo Cinépolis moderno
          royal: '#112240',      // Azul medio para paneles secundarios
          accent: '#1E3A8A',     // Azul brillante para luces ambientales
        },
        gold: {
          light: '#FBF0B9',      // Dorado champán (Textos destacados / Hover)
          DEFAULT: '#D4AF37',    // Dorado clásico elegante (Botones, Bordes, Butaca seleccionada)
          dark: '#AA7C11',       // Dorado bronce (Gradientes y estados activos)
          glow: 'rgba(212, 175, 55, 0.45)'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.35)',
        'screen-glow': '0 25px 60px -15px rgba(56, 189, 248, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '16px',
      }
    },
  },
  plugins: [],
}