# MedClub source architecture — V0.7

| Directory                    | Responsibility                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `app/router`                 | Lazy public/personal routes, transitions, titles and safe route focus             |
| `app/providers`              | Query, services, locale, appearance, workspace and overlay state                  |
| `app/layouts`                | Public and personal application frames                                            |
| `components/ui`              | Reusable primitives and native-dialog modal lifecycle                             |
| `components/navigation`      | Desktop rail/top navigation, phone dock and feature navigation                    |
| `components/cards`           | Academic, discovery, community, mentorship and product presentation               |
| `components/forms`           | Shared search and select controls                                                 |
| `components/feedback`        | Loading, retry, empty and error states                                            |
| `components/data-display`    | Headings, introductions and facts                                                 |
| `features`                   | Feature-owned screens, editors, selectors and store product visuals               |
| `data/mock`                  | Illustrative, typed records outside JSX                                           |
| `services`                   | API contracts, replaceable adapters, search index and browser-local preview state |
| `hooks`                      | Shared content queries, mutations and workspace paths                             |
| `types`                      | Content, student, workspace and commerce-preview contracts                        |
| `constants`                  | Configuration, routes and bilingual messages                                      |
| `styles`                     | Tokens, RTL/accessibility and cumulative feature layers                           |
| `admin` and reserved folders | Future scope; presence does not imply implementation                              |

## Content and service flow

Pages consume hooks or injected services. Only adapters import fixtures. The store uses its own local adapter because cart and order mutations are separate from general saved-item state.

`MedClubServices` can later replace the adapter with an HTTP implementation while pages retain the same typed contracts. Production services must return user-authorized data; route visibility and client-side IDs do not provide access control.

## Store domain

Products own bilingual content, category, materials, visual treatment and one or more variants. Each variant owns a stable SKU, option label, price in integer JOD fils and preview stock. Cart lines reference product and variant IDs. Orders snapshot names, selected options, SKUs and unit prices so historical totals do not silently change when the catalog changes.

The local adapter:

- isolates state per student;
- normalizes stored cart and order records;
- prevents invalid variants and quantities above preview stock;
- treats product/variant identity as one cart line;
- reserves a non-empty cart into an order snapshot;
- clears the cart after reservation;
- permits cancellation only while the preview order remains reserved.

These checks create coherent demo behavior but are not transaction-safe. A real backend must own prices, stock, reservation expiry, identity, order states and financial permissions atomically.

## Checkout boundary

The modeled V0.7 flow stops at `Cart → Reserve for collection → My Orders`. It does not model a successful payment. No card, bank or wallet fields exist, and the UI explicitly states that payment/delivery/refund rules are not finalized.

Later services may add checkout, coupons, fulfillment and refunds only after the club defines the operational process. Administrator and treasurer actions must be capability-based and audited on the server.

## Cross-feature integration

- Products join the bilingual global search index using names, descriptions, materials, option labels and SKUs.
- Public Store navigation retains the established collapsible desktop rail and mobile destination model.
- Cart quantity and personal order count appear in animated store tabs.
- Confirmed/ready order fixtures can generate personal notifications.
- My Orders stays inside the visually separate My MedClub workspace.
- Store routes use the existing medical transition system.
- Logical CSS, bilingual messages and reduced-motion fallbacks apply to all store screens.

## Existing platform contracts

V0.1–V0.6 architecture remains unchanged: API-ready academic relationships, one shared search panel, normalized workspace persistence, event registration, save-to-library behavior, native-dialog overlays, collapsible public/personal navigation, RTL, reduced motion, mentorship workflows and scientific-review safeguards.

Demo content uses ISO timestamps with explicit offsets. Date presentation uses `APP_TIMEZONE` (`Asia/Amman`). A production order service should own timezone conversion, reservation expiry and notification delivery.
