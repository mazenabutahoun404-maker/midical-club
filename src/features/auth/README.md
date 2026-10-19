# Authentication feature — V0.13.57

This feature contains the dedicated account experience:

- sign in with safe return-to routing;
- registration and preview email verification;
- non-enumerating recovery state;
- Living Anatomy: a deferred local WebGL heart sculpture and matching static poster;
- six validated registration milestones with light paths and arrival bursts;
- success-only, bounded sign-in welcome transition;
- already-authenticated handling.

State is provided by `app/providers/AuthProvider.tsx` through the `AuthService` contract. `services/local-auth.service.ts` is a browser-local demonstration adapter. It must be replaced before real student accounts or private data are introduced.

Production requirements include server-issued secure sessions, email ownership verification, expiring recovery tokens, rate limits, lockouts, CSRF defenses, server-side role/capability enforcement, audit records and privacy/account-lifecycle decisions.

The active layout uses `auth-lab.css` and `anatomy/AnatomyScene.tsx`. Earlier campus scene modules remain in source for compatibility but are not mounted in auth. Asset attribution and decorative-use limitations are in `assets/medical/NOTICE.md`.
