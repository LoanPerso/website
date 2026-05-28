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

## Admin Back Office UI
The `/admin` back office reuses the same tokens (Ivoire background, Anthracite text,
Champagne accent, small radius, serif headings) in a denser, data-oriented layout.

**Components (`app/_components/admin/`):**
| Component | Role |
|-----------|------|
| `admin-shell` | Fixed sidebar with **grouped sections** (CRM / Financement / Catalogue / Système), Champagne active state + responsive mobile drawer. |
| `page-header` | Serif title + description + actions. |
| `kpi-card` | Metric card with optional tone accent bar (success/warning/error). |
| `panel` / `EmptyState` | White rounded panel + empty placeholder. |
| `data-table` | Generic table (aligned columns, hover, clickable rows). |
| `bar-chart` | Two-series monthly bars (Champagne = disbursed, Anthracite = collected). |
| `status-badge` | `Badge`, `StatusBadge` (loan/client/installment/payment/application), `RiskBadge`. |
| `dialog` | `Modal` + `ConfirmDialog` (Radix dialog). |
| `form` | `Field`, `TextInput`, `Textarea`, `Select`, `FieldGrid`. |
| `toast` | `ToastProvider` / `useToast` (success/error/info). |
| `clients/score-gauge` | Radial 0-100 score gauge; arc colour maps to category (A success, B gold, C alert, D error). |
| `clients/*-panel` | CRM panels (scoring, KYC checklist, interaction timeline, tasks, contracts) — `Panel` + soft tinted badges, serif headings, 4px spacing. |

**CRM conventions:** score chips & gauges use category tones (A `#1F6B4E`, B Champagne,
C `#A36A2A`, D `#8F2E2E`); factor bars reuse the same scale; KYC/task/contract statuses use
soft tinted `StatusBadge`s; the timeline uses a left rule with iconed nodes.

**Conventions:** serif (`font-serif`) for titles & KPI values, sans for data; tones map to
functional colors (Success `#1F6B4E`, Alert `#A36A2A`, Error `#8F2E2E`); statuses use
soft tinted badges; currency in EUR via `formatCurrency` (FR locale).