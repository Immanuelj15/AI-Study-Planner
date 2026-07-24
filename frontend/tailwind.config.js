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
          bg: '#0F172A',
          secondary: '#1E293B',
          accent: '#3B82F6',
          cyan: '#06B6D4',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
          border: '#334155',
        }
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
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
          '50%': { transform: 'translateY(-8px)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.2), 0 0 30px rgba(59, 130, 246, 0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.45), 0 0 50px rgba(59, 130, 246, 0.35)' },
        }
      }
    },
  },
  plugins: [],
}
