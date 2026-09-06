# MedClub V0.7 — Store, Cart & Orders

Source-only release for an existing React + TypeScript + Vite + Tailwind CSS 4 setup. It contains the complete V0.1–V0.6 source plus the V0.7 store experience. Project scaffolding, dependencies, build output and secrets are intentionally excluded.

## Integrate

1. Back up the current `src` directory.
2. Replace it with this complete `src` directory. Routes, contracts, navigation, messages and styles changed together; do not copy only the store pages.
3. Keep the existing package and Vite/Tailwind configuration. V0.7 adds no dependency.
4. Run the project's normal type-check, tests and production build.
5. Test with existing browser storage intact. Earlier saves, registrations, collections, language, navigation and appearance preferences remain compatible.

## V0.7 outcome

| Area          | Implemented behavior                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Catalog       | Responsive product grid, category tabs, text/material search, stock filter and featured treatment  |
| Products      | Dedicated detail routes, variant selection, live stock limits, quantity controls and product notes |
| Cart          | Persistent per-student cart, SKU/variant identity, stock validation, updates, removal and subtotal |
| Reservation   | Explicit collection reservation confirmation that snapshots lines/prices and clears the cart       |
| Orders        | Dedicated My Orders screen, status path, collection details, totals and safe cancellation rules    |
| Discovery     | Product names, descriptions, materials, variants and SKUs join bilingual global search             |
| Personal UX   | Order destination in My MedClub plus ready-order notifications                                     |
| Experience    | Clinical-supply-shelf composition, scan-line hover effects, animated icons, RTL and reduced motion |
| Data boundary | Typed products/cart/orders and a replaceable service adapter prepared for a real API               |

V0.1–V0.6 remain included: the public/personal shells, collapsible navigation, homepage, academic journeys, course atlas, search, library, calendar, notifications, events, opportunities, community, Medical Journal, mentorship and scientific contributions.

## New routes

| Route                   | Screen                                             |
| ----------------------- | -------------------------------------------------- |
| `/store`                | Searchable and filterable product catalog          |
| `/store/products/:slug` | Product details, variants and add-to-cart controls |
| `/store/cart`           | Cart and collection-reservation preview            |
| `/my/orders`            | Personal reservation and order tracking            |

`/store/orders` redirects to `/my/orders` so order history remains inside the private-feeling My MedClub workspace.

## API readiness

The UI follows `UI → hooks/providers → MedClubServices → adapter`.

- `types/content.ts` defines products, variants, carts, order snapshots and status records.
- `services/contracts.ts` exposes store query and mutation interfaces without coupling screens to fetch calls.
- `services/local-store.service.ts` is the browser-local preview adapter.
- `data/mock/store.ts` contains explicitly illustrative catalog and order fixtures.
- Search and notifications consume the same store domain records instead of duplicating page data.

A production API must enforce authenticated identity, atomic stock/reservations, price authority, order status permissions, cancellation rules, audit history, notification delivery and administrator/treasurer access. React, route visibility and browser storage are not security boundaries.

## Payment and fulfillment boundary

V0.7 deliberately does **not** collect payment details, charge a customer or promise delivery. The current action reserves an illustrative cart for collection. Final payment, delivery and refund behavior must follow MedClub's future operational decision and workshop. Coupons, real inventory, financial reports, treasurer permissions and audit trails remain backend/admin work.

## Console note

`[vite] connecting`, `[vite] connected` and the React DevTools suggestion are normal development messages. The earlier `VM### … reportAllChanges … undefined.startTime` stack points to an anonymous injected script: `reportAllChanges` is absent from this source and the inspected runtime packages. Test the direct localhost page in a clean browser profile with extensions disabled; do not suppress global errors in the application. See `CONSOLE-TROUBLESHOOTING.md`.

## Honest limitations

- All products, prices, SKUs, materials, stock, collection details and supplier implications are illustrative.
- Cart, reservation and order data are stored locally for preview; no reservation reaches MedClub staff.
- Browser-side stock checks are not concurrency-safe. Real inventory and reservations require atomic server transactions.
- No payment fields, payment processor, coupon engine, shipping, delivery, refund or financial report is implemented.
- Product visuals are deliberate icon-led concepts, not photographs of verified merchandise.
- Authentication, store administration, production notifications, treasurer permissions and audit logs remain future server-backed milestones.
- The production build passes. Its host project should add vendor chunk groups to address the main-bundle size warning.
- Native-dialog, motion, responsive and assistive-technology behavior still need final real-browser/device acceptance after integration.

Read `V0.7-CHECKLIST.md`, `V0.7-DESIGN.md`, `ARCHITECTURE.md` and `CONSOLE-TROUBLESHOOTING.md` before integration.
