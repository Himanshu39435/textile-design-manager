export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#effcfb',
          100: '#d7f7f5',
          500: '#0ea5a4',
          600: '#0b7f7d',
          700: '#0b5e5d'
        },
        accent: '#0f172a'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
