# Integration dependencies

The source was compiled with the versions below. Keep your existing setup and add only missing packages. The archive intentionally excludes project configuration, node_modules and build output.

| Runtime package | Verified installed version |
| --- | --- |
| `@tanstack/react-query` | 5.102.8 |
| `class-variance-authority` | 0.7.1 |
| `clsx` | 2.1.1 |
| `cmdk` | 1.1.1 |
| `framer-motion` | 12.43.0 |
| `lucide-react` | 1.39.0 |
| `radix-ui` | 1.6.7 |
| `react` | 19.2.6 |
| `react-dom` | 19.2.6 |
| `react-router-dom` | 7.18.3 |
| `sonner` | 2.0.8 |
| `tailwind-merge` | 3.6.0 |

Required styling packages: `tailwindcss` 4, `tw-animate-css`, and either your existing Tailwind Vite integration or `@tailwindcss/postcss` 4. The verification build used TypeScript 5.9.3 and Vite 8.0.13.

For an existing React project missing these runtime dependencies:

```bash
npm install react-router-dom @tanstack/react-query framer-motion radix-ui lucide-react cmdk sonner clsx class-variance-authority tailwind-merge tw-animate-css
```

Configure Tailwind 4 once in the existing project. For a PostCSS setup, install `tailwindcss` and `@tailwindcss/postcss` and use:

```js
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

Do not keep a Tailwind 3 PostCSS configuration alongside this one. The stylesheet imports Tailwind itself; do not also import the Vite starter CSS. Keep TypeScript JSX mode `react-jsx`, DOM types and Vite client types enabled. No path alias is needed.

The source contains no external credentials, live API URL, downloadable course files or remote font dependency.

## Bundled fonts

Manrope (Latin, variable 200–800) and Noto Sans Arabic (Arabic, variable 100–900) are included as WOFF2 files with their SIL Open Font License notices. They are served from the source assets, with `font-display: swap`. No font package or external font provider is required in your existing project.
