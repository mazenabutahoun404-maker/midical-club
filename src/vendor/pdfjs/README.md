# PDF.js 6.4.299

Source: https://www.npmjs.com/package/pdfjs-dist/v/6.4.299
Upstream: https://github.com/mozilla/pdf.js
API: https://mozilla.github.io/pdf.js/api/

Legacy browser builds are retained byte-for-byte with the CMaps, standard fonts and rendering WASM/fallback files. LICENSE and upstream asset licenses accompany them. The app loads the renderer and worker only for a PDF study resource. Auxiliary rendering files are fetched by their local Vite asset URL as needed; no CDN is used.

`pdf.min.d.mts` is an application-written narrow type contract. `text-layer.css` copies only the upstream text-layer portion of the viewer stylesheet. The full viewer application and scripting sandbox are not included. PDF document JavaScript actions are never requested or executed by the application.

Updating this vendor requires matching the core and worker versions, retaining licenses, checking the BinaryDataFactory/TextLayer contracts, and rendering real test PDFs.
