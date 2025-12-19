# Design System Charter

## Stack
- Tailwind CSS with CSS variables as tokens.
- Radix UI primitives for behavior.
- shadcn/ui as a base to customize or replace.
- Three.js for 3D visuals.

## Tokens
All tokens are defined in `app/globals.css` and mapped in `tailwind.config.ts`.

- Colors: `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--muted`, `--border`, `--ring`
- Radius: `--radius`
- Typography: `--font-sans`, `--font-display`
- Shadows: `shadow-soft`, `shadow-crisp`

## Rules
- Do not use component defaults from shadcn without restyling them.
- Prefer composition with Radix primitives over custom JS behaviors.
- Keep spacing and typography consistent with tokens.

## Components (baseline)
- Button: shadcn base with `default`, `outline`, `ghost` variants.
- Tabs: Radix Tabs with tokenized background and active states.
- Cards: rounded surfaces using `shadow-soft` and `border` tokens.
