/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SecureAuth Design System tokens
        primary: {
          DEFAULT: '#000000',
          foreground: '#ffffff',
          // Legacy blue scale preserved for dashboard components
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          DEFAULT: '#0051d5',
          foreground: '#ffffff',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          foreground: '#ffffff',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          container: '#e1e2ec',
          lowest: '#ffffff',
        },
        outline: {
          DEFAULT: '#74747e',
          variant: '#c6c6cd',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'display-lg-mobile': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'body-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'label-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
      },
      spacing: {
        'stack-sm': '1rem',
        'stack-md': '1.5rem',
        'stack-lg': '2.5rem',
      },
      boxShadow: {
        'card': '0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.02)',
        'card-hover': '0 25px 30px -5px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl2': '1rem',
      },
    },
  },
  plugins: [],
}
