/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bgPrimary: 'rgb(var(--bg-primary) / <alpha-value>)',
        bgSecondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
        textPrimary: 'rgb(var(--text-primary) / <alpha-value>)',
        textSecondary: 'rgb(var(--text-secondary) / <alpha-value>)',
        borderColor: 'rgb(var(--border-color) / <alpha-value>)',
        appBg: 'rgb(var(--app-bg) / <alpha-value>)',
        accentPink: 'rgb(var(--accent-pink) / <alpha-value>)',
        accentYellow: 'rgb(var(--accent-yellow) / <alpha-value>)',
        accentGreen: 'rgb(var(--accent-green) / <alpha-value>)',
        sidebarBg: 'rgb(var(--sidebar-bg) / <alpha-value>)',
        sidebarText: 'rgb(var(--sidebar-text) / <alpha-value>)',
        sidebarBorder: 'rgb(var(--sidebar-border) / <alpha-value>)',
        sidebarHover: 'rgb(var(--sidebar-hover) / <alpha-value>)',
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
        },
        grad: {
          start: 'rgb(var(--grad-start) / <alpha-value>)',
          end: 'rgb(var(--grad-end) / <alpha-value>)',
        }
      },
      boxShadow: {
        soft: '0 12px 40px rgba(var(--brand-500), 0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, rgb(var(--grad-start)), rgb(var(--grad-end)))',
      }
    },
  },
  plugins: [],
};
