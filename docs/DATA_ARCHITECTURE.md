# Data Architecture

## Separation of Concerns
- Supabase handles dynamic and transactional data.
- Firebase stores long-term or archival data.

## Data Flow
1. Client interacts with Next.js routes.
2. Server actions or API routes read/write to Supabase.
3. Long-term or archival updates sync to Firebase.

## Open Questions
- Define which tables/collections live in each system.
- Define the sync strategy between Supabase and Firebase.
