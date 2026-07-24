/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        app: {
          bg: '#FFFFFF',
          secondary: '#F8FBFF',
          section: '#EFF6FF',
          primary: '#2563EB',
          lightBlue: '#DBEAFE',
          sky: '#38BDF8',
          accent: '#0EA5E9',
          textPrimary: '#1E293B',
          textSecondary: '#64748B',
          border: '#E2E8F0',
          card: '#FFFFFF',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '20px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(37, 99, 235, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-hover': '0 12px 30px -4px rgba(37, 99, 235, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'blue-glow': '0 0 25px rgba(37, 99, 235, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(37, 99, 235, 0.15), 0 0 30px rgba(56, 189, 248, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(37, 99, 235, 0.35), 0 0 45px rgba(56, 189, 248, 0.25)' },
        }
      }
    },
  },
  plugins: [],
}
