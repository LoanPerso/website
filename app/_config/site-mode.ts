// Central site-mode flags.
//
// Quickfund is winding down its acquisition funnel (no new credit during the
// buyout). Everything that powers the "wind-down" state reads from here, so the
// whole funnel can be re-enabled by flipping a single switch:
//   - `false` => simulator + application back online, banner hidden, sitemap restored.
//   - `true`  => acquisition closed (current state).
export const NEW_CREDIT_CLOSED = true;

// Contact address shown on the wind-down banner and the service-closed notice.
export const WIND_DOWN_CONTACT_EMAIL = "contact@quickfund.ee";
