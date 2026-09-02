# MedClub V0.1 — personal workspace revision

This archive contains `src/` only for your existing React + TypeScript + Vite project. Start with this file; the feature-by-feature status is in `V0.1-CHECKLIST.md`.

## Integrate with your setup

1. Keep a copy of your current source, then use this `src/` directory in your project.
2. Keep your existing `package.json`, Vite configuration and HTML entry. The HTML must contain `<div id="root"></div>` and load `/src/main.tsx`.
3. Check the packages in `DEPENDENCIES.md`. This source uses Tailwind CSS **4**, React Router, TanStack Query, Framer Motion and Radix primitives. It will not compile unchanged against Tailwind 3.
4. Start your usual development command. `src/App.tsx` imports the complete stylesheet. If you keep your own entry file, import the default `App` from this folder.

Imports are relative: no `@/` alias or private project packages are required. The original uploaded logo is included under `assets/brand/medclub-logo.png`; no external images or font requests are needed.

`App` supplies BrowserRouter automatically. If it is already mounted inside a router, it reuses that router. Configure a matching Vite `base` and host fallback to `index.html` if deploying under a subpath or opening routes directly. This release is a client-rendered Vite app, not an SSR package.

## Navigation and appearance

The default on screens 768 px and wider is a **left sidebar**. Phones use a **horizontal bottom dock** with Home, Learn, Search, Saved and More. The sidebar stays on the left in both languages; Arabic text and content layouts use RTL.

Open **Appearance** to choose Vertical or Horizontal navigation for larger screens. Changes take effect immediately and persist on this device. The phone dock stays horizontal in either mode. These preferences are isolated in `app/providers/AppearanceProvider.tsx`, ready to be connected to future account settings.

The circular control on the sidebar edge **collapses or expands** it. Compact mode retains the icons, keyboard-accessible names and hover/focus tooltips. Its saved preference follows you between the public and personal spaces. Switching to horizontal navigation preserves that preference for the next time you use the sidebar.

## Your personal space

Choose **My profile** from the public header, sidebar or phone's More menu to enter `/my`. A short transition leads into a separate My MedClub layout with a darker russet sidebar and a quieter canvas. Public navigation and the public footer are replaced by personal destinations. The phone dock also changes to personal destinations.

| Route | Contents |
| --- | --- |
| `/my` | Personal home, own courses, valid saved-item count and recent saves |
| `/my/learning` | The sample student's courses, with search |
| `/my/learning/:slug` | Course materials inside the personal layout |
| `/my/library` | Saved resources, events and opportunities |
| `/my/focus` | Focus timer using the profile's sample session length |
| `/my/profile` | Read-only sample identity and academic profile |
| `/my/settings` | Desktop orientation, compact sidebar and language |

**Back to MedClub** is available in the header on every personal page and returns to `/`. Personal search searches the student's courses and their study materials; personal course links stay in the same layout. `/my/dashboard` redirects to `/my`. The old `/my` library entry is now the personal home; use `/my/library` for the saved collection.

The profile is an explicitly labeled preview. Sign-in, profile editing and server sync are future work. Layout separation does not provide authentication or access control. See `PERSONAL-WORKSPACE.md` for extension points.

The redesign uses bundled Manrope and Noto Sans Arabic fonts, larger headings, pill controls, rounded cards and an abstract brand composition. Font licenses are included under `assets/fonts`. Read `DESIGN-REVISION.md` for the exact changes.

## Where to change things

| Change | Location |
| --- | --- |
| Red/russet palette, typography, spacing, radii and motion tokens | `styles/tokens.css` |
| Global and responsive layout | `styles/foundation.css`, `styles/accessibility.css` |
| Compact navigation and personal layout | `styles/workspaces.css` |
| Arabic layout adjustments | `styles/rtl.css` |
| Homepage copy, section order/enabled state, navigation | `data/mock/site.ts` |
| Courses, resources, events, opportunities, journal | Separate files in `data/mock/` |
| Sample student identity and course selection | `data/mock/student.ts` |
| Interface translations | `constants/messages.ts` |
| Desktop orientation, collapse state and persistence | `app/providers/AppearanceProvider.tsx` |
| Time zone, locale and storage keys | `constants/config.ts` |
| Route definitions | `app/router/AppRouter.tsx` |
| API boundary | `services/contracts.ts` and `services/mock-services.ts` |

The full English/Arabic interface switches from the navbar and remembers its language on this device. Dates are ISO strings with explicit offsets; display formatting uses `Intl` in the configured `Asia/Amman` time zone.

## Replacing static data with APIs later

Components call query hooks in `hooks/useContent.ts`. Those hooks call a registry that implements `MedClubServices`. Only `services/mock-services.ts` imports the fixture data. Every service returns a Promise and fresh mock response objects, so components cannot mutate the original fixtures.

Implement the same interface in an HTTP adapter and supply it to the root:

```tsx
import App from './App';
import { apiServices } from './services/api-services'; // create this when endpoints exist

<App services={apiServices} />
```

Map server responses into the existing TypeScript models inside the adapter. Authentication, request validation, upload/download rights and backend permissions must be implemented with the real backend. There are no invented API endpoints or credentials in this release.

This revision adds `personal.getProfile(): Promise<StudentProfile>` to `MedClubServices`. If you already wrote an adapter against the previous source, implement that method too. Student data lives outside the UI, and `hooks/useContent.ts` exposes its query.

`site.sections` controls section visibility and ordering. Optional `startsAt` and `endsAt` are evaluated when the homepage renders: start is inclusive and end is exclusive. This is a frontend preview, not a server publishing or authorization mechanism. The hero is separately configured by `site.hero` and remains at the top.

## Scope

V0.1 is the foundation and complete public homepage, now with the requested separate personal workspace. A working sample course catalogue, resource detail/filter flow, local bookmarks, scoped search, profile preview, appearance settings and focus timer are included. They demonstrate the shared components and route structure; they do not constitute the full academic or authenticated student platform.

All records are clearly marked as illustrative. PDFs are not attached. Event registration, applications, account sync, store checkout, exams, CMS, administration and backend security are not implemented in V0.1. Reserved feature/admin directories include a `README.md` stating their status.

The next planned milestone is V0.2: academic structure, batches, clinical years, archives and configurable course content. V0.3 covers the full student workspace. Later modules are split into additional releases; there is no fixed total version count yet.
