# Console report — V0.8

## What the supplied messages mean

| Console message                                | Finding                                                  |
| ---------------------------------------------- | -------------------------------------------------------- |
| [vite] connecting / connected                  | Normal development-server connection messages            |
| Download React DevTools                        | Informational development hint, not an application error |
| Blocked aria-hidden … button.phone-search      | Application modal focus issue addressed in V0.3          |
| VM906 … reportAllChanges … undefined.startTime | Origin not established; not claimed fixed                |

## Focus fix

The old search overlay used a controlled Radix dialog without its own trigger, together with custom requestAnimationFrame focus restoration. Background hiding could run while the triggering phone-search button still held focus, and focus could be restored before the overlay finished closing.

The shared Modal now uses the native HTML dialog element and showModal/close. The browser coordinates modality, background inertness, initial focus, Escape cancellation and opener restoration. Search, resource details, collection dialogs, study editing, mobile navigation and appearance all use this lifecycle. No global console filtering, aria-hidden removal loop, or accessibility-disable workaround is installed.

The route focus effect also checks whether focus moved after navigation started; it no longer overrides a newly opened menu/dialog.

Relevant primary documentation:

- [WAI: native HTML dialog technique](https://www.w3.org/WAI/WCAG22/Techniques/html/H102)
- [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [HTML dialog specification](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)

### Verify in your browser

1. Keep the Console visible and use the phone navigation search button.
2. Confirm the search input receives focus, Tab stays inside the modal, and background links cannot receive focus.
3. Press Escape. Focus should return to the opening search button.
4. Search for cardiac, open The cardiac cycle, then close details. Confirm a single modal is open at a time.
5. Repeat with the mobile menu, appearance switcher, collection editor and calendar editor.
6. Navigate between public and personal pages; verify route focus and no repeated aria-hidden warnings.

DOM tests exercise our open/close lifecycle with a native-dialog test double. They do not prove the real browser's top-layer or assistive-technology behavior.

## The `VM###` / `startTime` exception

`VM272`, `VM906` and similar names are runtime-generated script labels, not stable source filenames. The earlier supplied stack contains `reportAllChanges` inside an anonymous two-line script. That symbol is absent from the MedClub source and from the inspected React, React DOM, Framer Motion, Radix, cmdk, Vite and TanStack runtime package trees. This is therefore not a MedClub component exception. It is injected by the preview host, developer tooling or a browser extension.

Do not add global error suppression or random `startTime` checks to MedClub components. There is no corresponding failing statement in the supplied source to patch, and hiding it would also hide real failures.

Practical resolution:

1. Open the same localhost page in an Incognito/InPrivate window with extensions disabled.
2. If the exception disappears, re-enable extensions one at a time and update or remove the one that injects `reportAllChanges`.
3. If it remains only inside an embedded site preview, open the Vite localhost URL directly. The preview's monitoring layer is the source.
4. If it remains in a clean direct browser session, enable **Pause on uncaught exceptions**, click the `VM###:2` source link and inspect its source URL. A `chrome-extension://` URL identifies the extension; a preview-host URL identifies the host.
5. The two Vite connection messages and the React DevTools suggestion are informational, not errors.

If it remains in a clean direct session, inspect the integrating project's `index.html` and Vite plugins for extra monitoring code; setup files are not part of this source-only delivery. The script origin and the small function around `reportAllChanges`, with credentials or tokens removed, are the missing details required for a targeted patch.

[Chrome DevTools JavaScript debugging reference](https://developer.chrome.com/docs/devtools/javascript/reference)

This release cannot certify that an unidentified script outside the provided source has been fixed.
