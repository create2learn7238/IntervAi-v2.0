/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        saas: {
          bg: '#FAFAFC',
          surface: '#FFFFFF',
          primary: '#6D28D9', // Royal Purple
          secondary: '#8B5CF6',
          accent: '#7C3AED',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          text: '#0F172A',
          subtext: '#64748B',
          border: '#E2E8F0',
          muted: '#F1F5F9',
          hover: '#F5F3FF',
        },
      },
      borderRadius: {
        'card': '18px',
        'input': '16px',
        'btn': '12px',
        'panel': '20px',
      },
      boxShadow: {
        'saas-sm': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'saas-card': '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        'saas-glow': '0 10px 30px -5px rgba(109, 40, 217, 0.3)',
        'saas-modal': '0 20px 40px -15px rgba(15, 23, 42, 0.15)',
      },
    },
  },
  plugins: [],
}
