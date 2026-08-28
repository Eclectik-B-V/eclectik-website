export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// H2 2026 positioning eyebrow — single source of truth.
// Naming decision gated on the 15 Jul landing-page test; swap here only.
export const POSITIONING_TAGLINE = "Independent AI transformation assurance";

// Short variant for narrow viewports, where the full tagline wraps out of its pill.
export const POSITIONING_TAGLINE_SHORT = "Independent assurance";
