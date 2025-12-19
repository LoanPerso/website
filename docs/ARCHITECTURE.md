# Architecture

## Frontend
- Next.js App Router with route groups: `(public)` and `(admin)`.
- Shared UI in `app/_components`.
- Feature logic in `app/_modules`.
- Data clients and utilities in `app/_lib`.

## API
- Route handlers under `app/api/*`.

## External Services
- Supabase for dynamic data.
- Firebase for long-term data.
- Optional Three.js for interactive visuals.
