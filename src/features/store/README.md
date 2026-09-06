# Store feature — V0.7

## Screens

- `StorePage.tsx`: catalog, category tabs, query/material matching and stock filtering.
- `ProductPage.tsx`: product details, variants, quantity and add-to-cart behavior.
- `CartPage.tsx`: cart editing and explicit collection-reservation confirmation.
- `MyOrdersPage.tsx`: personal order state, progress, collection details and cancellation.
- `ProductVisual.tsx`: reusable icon-led visual language that does not pretend mock photography is real merchandise.

## Data flow

Screens use `useStoreProducts`, `useStoreProduct` and `useStoreWorkspace`. Those hooks call the injected `MedClubServices.store` contract. The current implementation delegates to `local-store.service.ts`; a future implementation can call an authenticated API without changing page component responsibilities.

Product/catalog fixtures live in `data/mock/store.ts`, not inside JSX. Money is stored as integer JOD fils and formatted only at the presentation layer. Order lines snapshot display and price data for stable history.

## Production boundary

Local storage is preview state, not a commerce or security system. Production must move identity, prices, stock, reservations, expiry, cancellation, checkout, fulfillment, refunds, reports, permissions, audit history and notifications to server-owned services.

V0.7 collects no payment details. The reservation action only demonstrates the approved UX boundary while payment, delivery and refund operations remain undecided.
