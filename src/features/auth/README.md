# Authentication feature — V0.8

This feature contains the dedicated account experience:

- sign in with safe return-to routing;
- registration and preview email verification;
- non-enumerating recovery state;
- WebGL medical identity field and static fallback;
- already-authenticated handling.

State is provided by `app/providers/AuthProvider.tsx` through the `AuthService` contract. `services/local-auth.service.ts` is a browser-local demonstration adapter. It must be replaced before real student accounts or private data are introduced.

Production requirements include server-issued secure sessions, email ownership verification, expiring recovery tokens, rate limits, lockouts, CSRF defenses, server-side role/capability enforcement, audit records and privacy/account-lifecycle decisions.
