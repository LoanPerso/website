# Design System Charter (V1 - Minimal Luxury)

## Vision
**"Éditorial, confidentiel, premium, précis."**
A mix of minimal luxury and cinematic moments. High contrast, precise typography, structured white space.

## Palette (Warm Neutrals + Champagne Gold)

| Name           | Hex       | HSL (Approx)    | Token Usage           |
|----------------|-----------|-----------------|-----------------------|
| **Ivoire**     | `#F6F1E7` | `38 44% 94%`    | `--background`        |
| **Warm Beige** | `#E8DDCF` | `34 38% 86%`    | `--secondary` / Surface |
| **Warm Grey**  | `#8D847A` | `30 8% 51%`     | `--muted-foreground`  |
| **Anthracite** | `#161514` | `30 5% 9%`      | `--foreground` / `--primary` |
| **Deep Black** | `#0B0B0C` | `240 4% 5%`     | Cinematic Backgrounds |
| **Champagne**  | `#C8A96A` | `40 48% 60%`    | `--accent`            |
| **Dark Gold**  | `#A8874A` | `40 39% 47%`    | Hover / Active        |

**Functional Colors:**
- Success: `#1F6B4E`
- Alert: `#A36A2A`
- Error: `#8F2E2E`

## Typography

- **Headings (Serif):** *Fraunces* (or EB Garamond). Used for titles, hero text.
- **Body/UI (Sans):** *Inter* (or Manrope). Used for UI, long text, data.

**Rules:**
- Titles: Negative tracking on large sizes, tight line-height.
- Body: Comfortable size (16-18px), generous line-height.

## Layout & Composition
- **Marketing:** 12-column grid, generous margins.
- **UI Density:** Compact but using same spacing tokens (base 4px).
- **Radius:** Small (2-8px) for a "tailored" premium look. Not "bubbly".

## Stack
- Tailwind CSS with CSS variables.
- Radix UI primitives.
- Next.js Font (Google Fonts).
- GSAP / Three.js (optional for Hero).