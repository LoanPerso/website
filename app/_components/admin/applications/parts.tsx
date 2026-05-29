"use client";

// Application-dossier visual bits now live in the shared primitives module so the
// rest of the admin (loans, contracts, payments, collections…) can reuse them.
// Re-exported here to keep existing application-panel imports working unchanged.
export {
  Metric,
  Bar,
  SoftBadge,
  KeyVal,
  GroupTitle,
  VerdictBanner,
  TONE_TEXT,
  TONE_BAR,
  type Tone,
} from "@/_components/admin/primitives";
