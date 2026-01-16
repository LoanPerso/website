import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./docs/**/*.{md,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1200px"
      }
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        border: "hsl(var(--border))",
        "deep-black": "hsl(var(--deep-black))",
        "dark-gold": "hsl(var(--dark-gold))",
        champagne: "hsl(var(--accent))",
        anthracite: "hsl(var(--primary))",
        success: "hsl(var(--success))",
        alert: "hsl(var(--alert))",
        error: "hsl(var(--error))",
        ring: "hsl(var(--ring))"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        soft: "0 12px 24px rgba(15, 23, 42, 0.08)",
        crisp: "0 8px 16px rgba(15, 23, 42, 0.06)"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia"],
        display: ["var(--font-serif)", "ui-serif", "Georgia"]
      },
      keyframes: {
        toss: {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-4px) rotate(10deg)" },
          "100%": { transform: "translateY(0) rotate(0deg)" }
        },
        slideRight: {
          "0%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(4px)" },
          "100%": { transform: "translateX(0)" }
        },
        grow: {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" }
        }
      },
      animation: {
        toss: "toss 0.6s ease-out",
        slideRight: "slideRight 0.6s ease-out",
        grow: "grow 0.6s ease-out forwards"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
