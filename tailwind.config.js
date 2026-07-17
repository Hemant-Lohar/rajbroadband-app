/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Raj Broadband brand — sampled from the logo.
        // Orange is now the ACCENT (actions, active states), not the wallpaper.
        brand: {
          50:  '#fff6ed',
          100: '#ffead4',
          200: '#ffd1a8',
          300: '#ffb171',
          400: '#ff9a45',
          500: '#ff7f15',   // ← logo orange
          600: '#f26a00',
          700: '#c25200',
          800: '#8f3d00',
          900: '#5c2700',
        },
        // Neutrals do the quiet work. Deeper ink + a hair more separation
        // between the page and cards gives the UI depth instead of a flat
        // orange wash.
        ink:      '#1c1a17',  // near-black, slightly warm (text)
        'ink-70': '#4a4740',
        // Softer dark for surfaces like the avatar + Call button — a cool
        // muted slate that sits with the theme instead of harsh black.
        slate:    '#3a3f4b',
        'slate-dark': '#2e323c',
        muted:    '#78746c',
        hairline: '#eae6de',
        surface:  '#f6f3ee',  // warm paper (page background)
        card:     '#ffffff',  // cards lift cleanly off the paper
        whatsapp: '#25d366',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,19,0,0.04), 0 8px 24px -12px rgba(20,19,0,0.14)',
        pop: '0 12px 40px -12px rgba(20,19,0,0.3)',
        glow: '0 8px 24px -8px rgba(255,127,21,0.45)',
      },
      keyframes: {
        'slide-up': { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'sheet-in': { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'slide-up': 'slide-up .22s ease-out',
        'fade-in': 'fade-in .18s ease-out',
        'sheet-in': 'sheet-in .24s cubic-bezier(0.22,1,0.36,1)',
        'spin-slow': 'spin-slow 1s linear infinite',
      },
    },
  },
  plugins: [],
}
