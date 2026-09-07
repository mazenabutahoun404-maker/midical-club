# Page builder

The V0.11 builder is a structured content editor inside the admin world.

## Routes

- `/admin/builder` lists page documents and creates or duplicates drafts.
- `/admin/builder/:pageId` opens the visual editor.

## Editor model

- `BuilderPageDocument` stores path, titles, status, theme, audience, SEO, schedule, revision and ordered blocks.
- `BuilderBlock` stores bilingual content, visibility, scheduling and typed data.
- `BuilderService` is the only persistence boundary. The current implementation is device-local and can be replaced by HTTP endpoints.
- The canvas supports native drag reordering plus visible keyboard-operable up/down controls.
- Autosave, undo and redo operate on complete structured snapshots.
- Publishing, scheduling and restoration append milestone versions.

Local image selection is a preview convenience. It is intentionally limited to 1.5 MB and stored as a data URL. Production must use authenticated object storage, content-type validation, malware scanning, quotas and expiring delivery URLs.

The editor never injects user HTML. The preview renders known block types as React components. A future rich-text adapter must sanitize content on both write and render.
