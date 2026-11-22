import { execSync } from 'node:child_process';
import { copyFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const BASE_PATH = process.env.VITE_BASE_PATH || '/Reform-Australia-Website/';

function run(cmd, cwd = ROOT, env = process.env) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

// 1. Build with GitHub Pages base path
run('npm run build', ROOT, { ...process.env, VITE_BASE_PATH: BASE_PATH });

// 2. Create 404.html (for SPA deep-route support on GitHub Pages) and .nojekyll
copyFileSync(path.join(DIST, 'index.html'), path.join(DIST, '404.html'));
writeFileSync(path.join(DIST, '.nojekyll'), '');

// 3. Get remote origin URL
const remoteUrl = execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf8' }).trim();

// 4. Push dist/ to gh-pages branch
rmSync(path.join(DIST, '.git'), { recursive: true, force: true });
run('git init -b gh-pages', DIST);
run('git add -A', DIST);
run('git commit -m "Deploy static build to GitHub Pages"', DIST);
run(`git push -f "${remoteUrl}" gh-pages:gh-pages`, DIST);
rmSync(path.join(DIST, '.git'), { recursive: true, force: true });

console.log('\nSuccessfully deployed to gh-pages branch!');
