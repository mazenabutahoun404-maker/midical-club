# MedClub V0.8 — Identity & Access Experience

This is the complete source-only V0.8 release for an existing React + TypeScript + Vite + Tailwind CSS 4 project. It includes every V0.1–V0.7 feature plus the new account experience, protected personal workspace, profile editing, and navigation overflow repair.

## Integrate

1. Back up the current `src` directory.
2. Replace it with this complete `src` directory. Routes, providers, service contracts, messages, navigation and styles changed together.
3. Keep your current project configuration and dependencies. V0.8 adds no package dependency.
4. Run your normal type-check, automated tests and production build.
5. Test sign-in, registration, verification, sign-out and both navigation orientations on real devices before deployment.

## V0.8 outcome

| Area              | Implemented behavior                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| Auth world        | Dedicated, asymmetrical sign-in environment separated from the public and personal shells                           |
| Medical visual    | Raw WebGL cellular/DNA-inspired depth field with pointer response, graceful fallback and reduced-motion mode        |
| Account flow      | Sign in, registration, six-digit verification, non-enumerating recovery preview and sign-out                        |
| Route boundary    | All `/my/*` routes require a preview session and return users to their original destination after sign-in           |
| Profile           | Account-specific name, email, batch, year, focus length and bio editing                                             |
| Navigation repair | Public and personal rails contain their own scrolling, hide native scrollbars and show directional overflow shadows |
| Localization      | Complete English/Arabic auth copy, logical layout, RTL and accessible labels                                        |
| API boundary      | Typed `AuthService`, provider and replaceable browser-local adapter                                                 |

V0.1–V0.7 remain included: public/personal shells, collapsible/orientation-aware navigation, homepage, academics, courses, search, library, calendar, notifications, events, opportunities, community, Medical Journal, mentorship, contributions and the store/cart/order preview.

## Routes and preview account

| Route            | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `/auth/sign-in`  | Sign in and return to the requested personal route        |
| `/auth/register` | Create a browser-local preview account                    |
| `/auth/verify`   | Verify the pending account with the preview code          |
| `/auth/recover`  | Exercise the non-enumerating recovery response            |
| `/my/*`          | Protected personal workspace and account-specific profile |

Preview credentials:

- Email: `student@medclub.jo`
- Password: `MedClub2026!`
- Registration verification code: `260908`

These values are intentionally visible because this is a local product preview, not production authentication.

## Security boundary

The browser-local adapter demonstrates state transitions and the API contract only. A password digest in browser storage does **not** make client-side authentication secure. Do not use this adapter to protect real student data.

Production must replace it with server-backed identity and authorization, secure HttpOnly sessions or an approved identity platform, CSRF protection, verified email delivery with expiring tokens, throttling and lockouts, server-side validation, audited capability checks, privacy controls and account lifecycle policies. The university-email eligibility policy is still a product decision.

## Visual and motion behavior

The WebGL field is decorative: the form remains the primary task, the canvas is hidden from assistive technology, rendering pauses offscreen, device pixel ratio is capped, and unsupported/reduced-motion environments receive a static visual. The auth layout works without WebGL.

Both desktop navigation systems now use measured scroll cues. Native scrollbars are visually hidden while wheel, touch and keyboard scrolling remain available. Horizontal destinations stay clipped inside their rail instead of extending over the page.

## Verification and limitations

- TypeScript strict checking and the production build pass.
- The automated V0.2–V0.8 regression covers data relationships, routes, workflows, RTL, persistence, accessibility states and navigation containment.
- The host build still reports a main-chunk size warning; add deliberate vendor chunk groups in the integrating project.
- Automated DOM tests do not replace real WebGL, browser, mobile, keyboard or assistive-technology acceptance testing.
- No real email, server session, password recovery message, account database or administrator authorization exists yet.
- The earlier anonymous `VM### … reportAllChanges … startTime` exception is still attributable to injected preview/extension code, not a statement in this source. See `CONSOLE-TROUBLESHOOTING.md`.

Read `V0.8-CHECKLIST.md`, `V0.8-DESIGN.md`, `ARCHITECTURE.md` and `CONSOLE-TROUBLESHOOTING.md` before integration.
