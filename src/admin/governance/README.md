# V0.12 governance boundary

V0.12 keeps three concepts deliberately separate:

- roles grant typed system capabilities;
- team memberships record organizational positions and volunteer hours;
- symbolic titles are display-only and never authorize an operation.

The preview adapter persists normalized data under `STORAGE_KEYS.governance`. It enforces the five-founder invariant, prevents founder suspension or permission reduction, rejects self-approval and requires two distinct approvals before a high-risk access change takes effect.

These local checks make the preview honest, but they are not a production security boundary. A real API and database must repeat every permission, founder-protection and approval invariant transactionally. The frontend may hide or disable a control for clarity; it must never be the only enforcement layer.

Routes are capability-gated through `CapabilityGate`:

- `/admin/governance`
- `/admin/users`
- `/admin/roles`
- `/admin/approvals`

The navigation elevates governance without crowding the mobile tab bar. Desktop uses grouped operations and access controls; mobile keeps four frequent destinations and moves the rest into a focused native-modal menu.
