# MedClub V0.13.4 — Campus prototype

This is a real mesh-based 3D prototype integrated into the exact V0.13.3 source.
It is NOT the exact supplied image rebuilt in Blender. Architecture, people,
vegetation, materials and lighting are simplified. No verified .blend file was
created because Blender could not run in the authoring environment.

## Install

Replace your complete `src/` directory with this archive's `src/` directory.
Keep your existing project configuration. Add the new dependencies:

```sh
npm install three@0.186.0
npm install --save-dev @types/three@0.183.1
```

The GLB and fallback images are inside `src/assets/campus` and are resolved
through Vite. No public-directory copy, CDN, or external 3D service is needed.
Do not discard your existing package.json or lockfile.

## What changes

- Home uses the full-width campus in its opening section, with six existing
  destinations linked from the corresponding buildings and accessible HTML links.
- Registration and verification show the same campus with shutters closed and
  people absent. Sign-in and recovery show the community campus.
- Desktop loads 3D only when the scene enters the viewport. Phones, data-saving
  connections and reduced-motion users start with the model's rendered preview
  and can explicitly open 3D.
- The active scene has restrained figure movement, pointer parallax, hover
  highlighting, left/right/center camera controls and a pause button.
- Canvas rendering stops offscreen and when the document is hidden. Pixel ratio
  is capped at 1.5, animation at 30 fps, and shadow maps are computed once.
- Failed WebGL/model loading keeps the preview and ordinary navigation usable.
- Interface labels have English and Arabic versions. Signs inside the model are
  English geometry; accessible Arabic navigation sits outside the canvas.

## Preserved baseline

Only two original production files changed: `features/homepage/sections/Hero.tsx`
and `app/layouts/AuthLayout.tsx`. All 362 other V0.13.3 files are byte-for-byte
unchanged; no original source files were deleted. The former particle-field
component remains in the source but is no longer mounted in the auth layout.

## What is not implemented

- Photorealistic reconstruction or exact matching of the reference image.
- A verified Blender project or verified execution of the supplied import script.
- Earned building upgrades, levels, per-account campus persistence or awards.
  These visuals are presentation states, not claimed measurements of activity.
- Skeletal character walking: figure movement is a restrained positional loop.
- Browser/device visual acceptance and measured real-device frame rate.

The suggested progression mapping is: learning → recorded study milestones;
media → approved publications; community → recorded participation; mentorship →
completed sessions; contribution → accepted work; journals → accepted editorial
or research work. Define and validate these events before displaying earned
upgrades. Do not reduce building quality because a student takes a break.

## Assets and verification

The model contains 19 named meshes, including all six buildings, separate
activity/shutter layers and the central stethoscope landmark. Its 67,644
triangles occupy 2,697,772 bytes as standard indexed GLB.

Khronos glTF validation: zero errors and warnings. The model also parsed with
the actual Three.js GLTFLoader used by the website. The active/dormant preview
images were rendered from its triangles using a CPU rasterizer; browser lighting
will differ. TypeScript and production build passed. Focused auth/navigation/PDF
and campus checks passed (11 tests). The complete inherited regression plus
new campus checks passed: 215/215, with no failures, skips or cancellations.
Browser visual QA and execution of the Blender script remain unverified.

The Three.js renderer remains a separately requested ~615 kB chunk (~155 kB
gzip). The existing shared entry is ~993 kB (~306 kB gzip); the bundle warning
remains. A small GLB is not proof of fast rendering on every device.

The companion 3D assets package includes the same GLB, a Blender import script,
the reproducible model generator, and both model previews.

Technical references: [Three.js](https://threejs.org/docs/) and
[Blender glTF importer/exporter](https://github.com/KhronosGroup/glTF-Blender-IO).
