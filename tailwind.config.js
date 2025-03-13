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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "cell-appear": {
          "0%": {
            transform: "scale(0) translateY(-50%)",
            opacity: "0",
            transformOrigin: "top center"
          },
          "70%": {
            transform: "scale(1.05) translateY(0)",
            opacity: "1",
            transformOrigin: "top center"
          },
          "100%": {
            transform: "scale(1) translateY(0)",
            opacity: "1",
            transformOrigin: "top center"
          }
        },
        "cell-win": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-7px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(7px)" }
        }
      },
      animation: {
        "cell-appear": "cell-appear 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "cell-win": "cell-win 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "shake": "shake 0.6s cubic-bezier(.36,.07,.19,.97) both"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} 