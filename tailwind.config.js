/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E67E22",
        secondary: "#27AE60", 
        accent: "#F39C12",
        success: "#27AE60",
        warning: "#F39C12",
        error: "#E74C3C",
        info: "#3498DB",
        surface: "#FFFFFF",
        background: "#F8F5F0"
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'card': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 16px rgba(0, 0, 0, 0.12)',
        'modal': '0 10px 25px rgba(0, 0, 0, 0.15)'
      },
      animation: {
        'pulse-success': 'pulseSuccess 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 0.5s ease-out',
        'slide-in': 'slideIn 0.25s ease-out'
      },
      keyframes: {
        pulseSuccess: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' }
        },
        bounceGentle: {
          '0%': { transform: 'scale(0.95) translateY(5px)' },
          '50%': { transform: 'scale(1.02) translateY(-2px)' },
          '100%': { transform: 'scale(1) translateY(0)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        }
      }
    },
  },
  plugins: [],
}