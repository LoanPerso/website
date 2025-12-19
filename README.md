# website

Base Next.js structure with Supabase, Firebase, Tailwind, and shadcn UI placeholders.

## Structure

- app/ : routes, layouts, modules, shared components
  - app/(public) : public pages
  - app/(admin) : admin area
  - app/_components : shared UI
  - app/_modules : feature logic
  - app/_lib : data clients and env
- docs/ : project documentation
- public/ : static assets

## Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. Install deps: `npm install`
3. Start dev server: `npm run dev`
