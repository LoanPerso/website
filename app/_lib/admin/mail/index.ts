// Mailbox data layer (browser Supabase client + RLS) — accounts, folders,
// messages, compose and connectivity diagnostics. DB-backed mockup: no real
// SMTP/IMAP (see docs/DECISIONS.md). Split by responsibility, like ./application.
export * from "./accounts";
export * from "./folders";
export * from "./messages";
export * from "./compose";
export * from "./diagnostics";
export * from "./simulate";
