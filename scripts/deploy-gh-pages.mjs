import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function run(command, cwd = process.cwd()) {
  execSync(command, { cwd, stdio: 'inherit' });
}

function getRemoteUrl() {
  try {
    return execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
  } catch {
    return 'https://github.com/mazenabutahoun404-maker/midical-club.git';
  }
}

const distDir = path.resolve('dist');

if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.log('[deploy] Building project first...');
  run('npm run build');
}

const remoteUrl = getRemoteUrl();
console.log(`[deploy] Deploying dist to gh-pages on ${remoteUrl}...`);

const distGitDir = path.join(distDir, '.git');
if (fs.existsSync(distGitDir)) {
  fs.rmSync(distGitDir, { recursive: true, force: true });
}

try {
  run('git init', distDir);
  run('git checkout -B gh-pages', distDir);
  run('git add -A', distDir);
  run('git commit -m "Deploy to GitHub Pages"', distDir);
  run(`git push -f "${remoteUrl}" gh-pages`, distDir);
  console.log('Successfully deployed to gh-pages branch!');
} finally {
  if (fs.existsSync(distGitDir)) {
    fs.rmSync(distGitDir, { recursive: true, force: true });
  }
}
