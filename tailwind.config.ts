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
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
