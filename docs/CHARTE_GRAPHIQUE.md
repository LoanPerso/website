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

## Admin Back Office UI (V2 — neutral "tool" aesthetic)
The `/admin` back office is a dense, data-oriented product tool styled after **Stripe / Linear**:
grayscale-first, hairline borders, flat surfaces, one radius scale. It is **scoped to `.admin-theme`**
(in `globals.css`) so the public site keeps its "Minimal Luxury" charter untouched.

**Tokens (`.admin-theme`):** white canvas sitting on a faint gray app shell, cool near-black text,
`gray-200` hairline borders, classic UI font (`--font-ui`). The champagne accent is **neutralised inside
the tool**: `--accent` = slate, `--dark-gold` = ink (so links / active tab / dots / sliders all read
neutral, by token), slate focus ring. The gold survives **only** as `--brand-gold` (Tailwind `brand-gold`),
reserved for branding (the serif "Quickfund" wordmark + "Admin" pill). `--radius` = 8px.

**Dark mode (admin only):** toggled by the `dark` class on `<html>`, scoped to `/admin` routes — the
public site stays light. Dark tokens live in `.dark .admin-theme` (dark canvas/panels, light text,
brightened functional colours; brand gold brightened). The preference follows the OS and is stored
(anti-FOUC inline script); a sun/moon toggle sits in the sidebar footer + the mobile bar.

**Conventions:**
- **Radius:** cards `rounded-lg` (8px), controls & badges `rounded-md` (6px); `rounded-full` reserved for
  dots, gauges and progress bars. No `rounded-xl`.
- **Elevation:** cards are **flat** (hairline border, no shadow). Only true overlays use `shadow-overlay`
  (dialog, toast, mobile drawer, login / access-denied card).
- **Colour rule — chrome vs data:** chrome (badges, cards, banners, nav, chips) stays grayscale;
  functional colour (Success `#1F6B4E`, Alert `#A36A2A`, Error `#8F2E2E`) survives **only on semantic
  data** — ratio bars, tonal metrics, the score gauge, open-banking in/out flows, "checked" states and
  error feedback.
- **Badges:** neutral chip + a small leading **status dot** (`Badge` / `StatusBadge` / `RiskBadge`,
  `SoftBadge`, `ScoreChip`) — no filled colour pills.
- **No modals (Golden Rule 9):** forms, management and composition flows live on a **dedicated page**
  or an **inline panel**; confirmations are inline. `Modal`/`ConfirmDialog` are **legacy** — do not add
  new ones (e.g. mailbox compose = inline pane, account management = `/admin/mail/accounts` page).
- Sans-serif UI (`--font-ui`); serif only for the "Quickfund" wordmark. Currency in EUR via
  `formatCurrency` (FR locale); figures use `tabular-nums`.

**Components (`app/_components/admin/`):**
| Component | Role |
|-----------|------|
| `admin-shell` | Fixed sidebar, grouped sections (CRM / Communication / Financement / Catalogue / Système), neutral active state (gray surface + ink), `brand-gold` logo & "Admin" pill, responsive mobile drawer. **Collapsible** to an icon rail (persisted in `localStorage`); width exposed as the `--sidebar-w` CSS var that drives the `main` padding and any full-bleed page pinned to its right (mail, mailbox accounts). |
| `page-header` | Compact sans title + description + actions. |
| `kpi-card` | Flat metric card with an optional thin tonal accent bar (success/warning/error). |
| `panel` / `EmptyState` | Flat white panel (border only) + dashed empty placeholder. |
| `data-table` | Generic table (aligned columns, hover, clickable rows), flat bordered wrapper. |
| `bar-chart` | Two-series monthly bars in two grays (`foreground/35` = disbursed, `primary` = collected). |
| `status-badge` | `Badge`, `StatusBadge` (loan/client/installment/payment/application/document/task/contract), `RiskBadge`, `ScoreChip` — neutral chips with a tonal dot. |
| `dialog` / `toast` | `Modal` + `ConfirmDialog`, toasts — `rounded-lg` + `shadow-overlay`. |
| `form` | `Field`, `TextInput`, `Textarea`, `Select`, `FieldGrid` (slate focus ring). |
| `clients/score-gauge` | Radial 0-100 gauge; arc tone maps to category (A success, B ink, C alert, D error). |
| `clients/*-panel` | CRM panels (scoring, KYC checklist, interaction timeline, tasks, contracts) — `Panel` + dot badges. |
| `applications/*` | Banking-grade dossier (`/admin/applications/[id]`): tabbed panels (overview, financial, fraud, decision, pricing, contract, comms, tasks), workflow bar, edit dialog, shared `parts.tsx` primitives (`Metric`, `Bar`, `SoftBadge`, `KeyVal`, `VerdictBanner`). |
| `mail/*` | Messagerie (`/admin/mail`): **full-screen, no-modal** 3-pane client (fills the area right of the admin sidebar; no `PageHeader`; seamless panes with dividers, no cards) — `account-sidebar` (Composer button + account switch + folders with unread counts + Synchroniser/Gérer-les-comptes footer + SMTP/IMAP dots), `message-list` (search + Tous/Non lus/Suivis filter, unread dot, attachment/flag icons), `message-view` (headers + text body + reply/reply-all/forward/flag/delete/move/mark-unread + attachments + `message-thread` conversation list) with an inline **toggleable** `message-crm` editor (header button next to flag/delete; link to a client/application + change the application status, same-email suggestions), `compose-pane` (**inline** composer replacing the reader column — no modal). Account management is the dedicated **full-screen** page `/admin/mail/accounts` (master-detail: narrow sticky list + independent-scroll `account-form` — box CRUD + SMTP/IMAP smoke tests + diagnostics + **inline** delete confirm). **Mobile:** single-pane flow (folders → list → reader) with a back/compose nav bar, compose full-screen; on `lg` the three panes show side by side (pane wrappers use `display:contents`). Simulating the correspondent's reply is **kept out of this production-style reader** — it lives only in the sandbox. The discreet `/admin/mail/simulate` sandbox (flask icon on the accounts page) is a **faithful 2-pane mirror** of the live client (components in `mail/simulate/`): a `message-list`-style **conversation list** (search + sender/subject/preview + last-direction cue) and a **stacked-card reader** with **full bodies** (`listMessagesFullByIds`) plus a docked composer to **reply as the correspondent**; **"Nouveau mail"** opens an inline `compose-pane`-style form to inject a fresh inbound. Single-pane on mobile (list → detail, back bar), two columns on `lg`. Grayscale, no modal. |

**CRM conventions:** the score gauge & `ScoreChip` carry category as a dot/arc tone (A success, B ink,
C alert, D error); scoring factor bars reuse the functional scale; KYC/task/contract statuses use dot
`StatusBadge`s; the timeline uses a left rule with iconed nodes.

**Application dossier:** active tab marked by an **ink** underline; verdict banners and risk cues use a
neutral surface; tone is carried by the coloured title + the dot badge, with no left accent rail (go/clear = success, caution/review = alert, no_go/block =
error); ratio bars carry a vertical threshold marker (e.g. 33% DTI); what-if sliders are neutral. The
generated offer preview keeps a neutral "encadré" (no champagne box).
## Ergonomie tactile (mobile) — penser « app mobile »
Le back office doit se manipuler comme une application native, pas comme une page web.
Règles posées (cf. JOURNAL 2026-05-29) :
- **Hauteur d'écran :** utiliser `min-h-dvh` / `h-dvh` (jamais `100vh`/`min-h-screen`) pour les
  conteneurs pleine hauteur — `100vh` provoque un scroll vertical parasite sous la barre du navigateur mobile.
- **Survol vs tap :** `hoverOnlyWhenSupported` est activé (Tailwind) → les styles `hover:` ne touchent
  que les appareils à survol réel. Le retour de **pression** au tap passe par `active:` (le `Button`
  porte `active:scale-[0.97]`), jamais par `hover:`.
- **Champs de saisie :** police **≥ 16px sur mobile** (sinon Safari iOS zoome au focus) ; densité 13px
  réservée à `sm+`. Géré globalement dans `globals.css` pour `.admin-theme input/select/textarea`.
- **Feel natif :** `-webkit-tap-highlight-color: transparent` (pas de flash gris), `touch-manipulation`
  (pas de délai de tap), `select-none` sur les contrôles, verrou du scroll de fond quand un drawer est
  ouvert, `overscroll-contain` sur les zones scrollables internes.
- **Cibles tactiles :** viser ~44px sur mobile pour les actions principales (chantier en cours sur les
  boutons icône et liens d'action denses).
