/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#1B4332',
        darkgreen: '#2D6A4F',
        freshgreen: '#52B788',
        mint: '#D8F3DC',
        cream: '#F8F5EC',
        darktext: '#26352C',
        orange: '#E76F51',
        brand: {
          50: '#F4FAF6',
          100: '#D8F3DC', // Soft mint
          200: '#B7E4C7',
          300: '#95D5B2',
          400: '#74C69D',
          500: '#52B788', // Fresh green
          600: '#40916C',
          700: '#2D6A4F', // Dark green
          800: '#1B4332', // Deep forest green
          900: '#081C15',
        },
        accent: {
          50: '#FDF4F2',
          100: '#FBE8E4',
          200: '#F7D1C9',
          300: '#F2B3A6',
          400: '#ED927E',
          500: '#E76F51', // Warm orange
          600: '#D65A3C',
          700: '#B54226',
        },
        surface: {
          50: '#F8F5EC', // Warm cream background
          100: '#F2EFE5',
          200: '#E6E1D3',
          300: '#D6CFBD',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(38, 53, 44, 0.05), 0 4px 6px -2px rgba(38, 53, 44, 0.02)',
        'soft-md': '0 4px 20px -2px rgba(38, 53, 44, 0.08), 0 2px 8px -1px rgba(38, 53, 44, 0.04)',
        'soft-lg': '0 10px 30px -4px rgba(38, 53, 44, 0.1), 0 4px 12px -2px rgba(38, 53, 44, 0.05)',
        'soft-xl': '0 20px 40px -6px rgba(38, 53, 44, 0.12), 0 8px 16px -3px rgba(38, 53, 44, 0.06)',
      },
    },
  },
  plugins: [],
}
