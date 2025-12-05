import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spooky Theme Colors
        'ghost-green': '#39ff14',
        'toxic-purple': '#9d4edd',
        'blood-red': '#ff006e',
        'pumpkin-orange': '#fb5607',
        'bone-white': '#f8f9fa',
        'slime-green': '#06ffa5',
        'bg-darkest': '#0a0a0f',
        'bg-dark': '#1a1a2e',
        'bg-medium': '#2d1b4e',
        'text-primary': '#f8f9fa',
        'text-secondary': '#adb5bd',
      },
      fontFamily: {
        'creepster': ['Creepster', 'cursive'],
        'vt323': ['VT323', 'monospace'],
        'press-start': ['"Press Start 2P"', 'cursive'],
        'courier': ['"Courier Prime"', 'monospace'],
        'retro': ['VT323', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fog': 'fog 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flicker': 'flicker 0.5s ease-in-out infinite',
        'flicker-intense': 'flicker-intense 3s ease-in-out infinite',
        'ghost-trail': 'ghost-trail 0.5s ease-out',
        'scanline': 'scanline 8s linear infinite',
        'spin-ghost': 'spin-ghost 2s ease-in-out infinite',
        'float-skull': 'float-skull 4s ease-in-out infinite',
        'ghost-particle': 'ghost-particle 8s ease-in-out infinite',
        'drip': 'drip 2s ease-in infinite',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'slide-out-left': 'slide-out-left 0.4s ease-in',
        'cobweb-sway': 'cobweb-sway 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fog: {
          '0%, 100%': { 
            opacity: '0.1',
            transform: 'translateX(0)',
          },
          '50%': { 
            opacity: '0.3',
            transform: 'translateX(10px)',
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 15px rgba(57, 255, 20, 0.6)',
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(57, 255, 20, 0.9), 0 0 50px rgba(157, 78, 221, 0.5)',
          },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'ghost-trail': {
          '0%': {
            opacity: '0.8',
            transform: 'translateX(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'spin-ghost': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.1)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'float-skull': {
          '0%, 100%': { transform: 'translateY(0px) rotate(-5deg)' },
          '25%': { transform: 'translateY(-15px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' },
          '75%': { transform: 'translateY(-15px) rotate(0deg)' },
        },
        'ghost-particle': {
          '0%': { transform: 'translateY(100vh) translateX(0) scale(0)', opacity: '0' },
          '10%': { opacity: '0.5' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateY(-100px) translateX(50px) scale(1)', opacity: '0' },
        },
        drip: {
          '0%': { transform: 'translateY(0) scaleY(1)', opacity: '1' },
          '50%': { transform: 'translateY(20px) scaleY(1.5)', opacity: '0.8' },
          '100%': { transform: 'translateY(40px) scaleY(0.5)', opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        'cobweb-sway': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'flicker-intense': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '25%': { opacity: '0.4', filter: 'brightness(0.6)' },
          '50%': { opacity: '1', filter: 'brightness(1.2)' },
          '75%': { opacity: '0.6', filter: 'brightness(0.8)' },
        },
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(57, 255, 20, 0.6)',
        'glow-purple': '0 0 20px rgba(157, 78, 221, 0.5)',
        'glow-red': '0 0 20px rgba(255, 0, 110, 0.6)',
        'glow-intense': '0 0 30px rgba(57, 255, 20, 0.9), 0 0 50px rgba(157, 78, 221, 0.5)',
        'pixel-border': '0 0 15px rgba(57, 255, 20, 0.6), inset 0 0 10px rgba(157, 78, 221, 0.3)',
      },
      backgroundImage: {
        'gradient-spooky': 'linear-gradient(to bottom, #0a0a0f, #1a1a2e)',
        'gradient-card': 'linear-gradient(to bottom, #1a1a2e, #2d1b4e)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      screens: {
        'xs': '475px',
        // Default breakpoints are preserved
        // sm: 640px
        // md: 768px
        // lg: 1024px
        // xl: 1280px
        // 2xl: 1536px
      },
    },
  },
  plugins: [],
};

export default config;
