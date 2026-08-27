/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F172A",
          fixed: "#dae2fd",
          "fixed-dim": "#bec6e0",
          container: "#1e293b",
          hover: "#1e293b",
        },
        on: {
          primary: "#ffffff",
          surface: "#0f172a",
          "surface-variant": "#475569",
        },
        surface: {
          DEFAULT: "#f8fafc",
          dim: "#f1f5f9",
          bright: "#ffffff",
          alt: "#f1f5f9",
          variant: "#e2e8f0",
        },
        "surface-container": {
          lowest: "#ffffff",
          low: "#f8fafc",
          DEFAULT: "#f1f5f9",
          high: "#e2e8f0",
          highest: "#cbd5e1",
        },
        outline: {
          DEFAULT: "#94a3b8",
          variant: "#cbd5e1",
        },
        success: {
          DEFAULT: "#10B981",
          container: "#d1fae5",
          text: "#065f46",
        },
        warning: {
          DEFAULT: "#F59E0B",
          container: "#fef3c7",
          text: "#92400e",
        },
        danger: {
          DEFAULT: "#EF4444",
          container: "#fee2e2",
          text: "#991b1b",
        },
        info: {
          DEFAULT: "#3B82F6",
          container: "#dbeafe",
          text: "#1e40af",
        },
        border: "hsl(var(--border, 214.3 31.8% 91.4%))",
        input: "hsl(var(--input, 214.3 31.8% 91.4%))",
        ring: "hsl(var(--ring, 222.2 84% 4.9%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 222.2 84% 4.9%))",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      spacing: {
        sidebar: '280px',
        topbar: '72px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        glow: '0 0 20px rgba(59, 130, 246, 0.5)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)' },
          '50%': { opacity: .8, boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
