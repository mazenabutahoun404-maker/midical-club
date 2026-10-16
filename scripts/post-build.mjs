import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

if (fs.existsSync(distDir)) {
  // Prevent GitHub Pages Jekyll processing (which ignores files starting with _)
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
  console.log('[post-build] Created dist/.nojekyll');

  // SPA fallback for GitHub Pages when direct URLs/refreshes occur
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join(distDir, '404.html'));
    console.log('[post-build] Created dist/404.html (SPA fallback)');
  }
}
