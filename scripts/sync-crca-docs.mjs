import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public', 'documents');
const SYNC_META_PATH = path.join(OUTPUT_DIR, 'sync-meta.json');

const OWNER = process.env.CRCA_DOCS_OWNER || 'Aussie-App-Studio';
const REPO = process.env.CRCA_DOCS_REPO || 'crca-forms-and-documents';
const BRANCH = process.env.CRCA_DOCS_BRANCH || 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const FORCE = process.argv.includes('--force');

const CONCURRENCY = 6;
const OPTIONAL_ASSETS = ['CRCA Book of Church Order 2022.docx'];

function encodeGitHubPath(relPath) {
  return relPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function buildRawUrl(relPath, ref = BRANCH) {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${ref}/${encodeGitHubPath(relPath)}`;
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfExists(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchLatestCommit() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/commits/${encodeURIComponent(BRANCH)}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'crca-website-sync',
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`Warning: GitHub commit check returned HTTP ${res.status}; continuing without commit SHA.`);
      return { commitSha: null, commitDate: null };
    }
    const data = await res.json();
    const commitSha = typeof data?.sha === 'string' ? data.sha : null;
    const commitDate =
      data?.commit?.committer?.date ?? data?.commit?.author?.date ?? null;
    return { commitSha, commitDate };
  } catch (err) {
    console.warn(`Warning: GitHub commit check failed (${err.message}); continuing without commit SHA.`);
    return { commitSha: null, commitDate: null };
  }
}

async function fetchBuffer(relPath, { optional = false, ref = BRANCH } = {}) {
  const url = buildRawUrl(relPath, ref);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'crca-website-sync' },
  });
  if (optional && res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch "${relPath}" (${url}): HTTP ${res.status} ${res.statusText}`);
  }
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

async function writeBufferIfChanged(destPath, buf) {
  await mkdir(path.dirname(destPath), { recursive: true });
  try {
    const existing = await readFile(destPath);
    if (existing.equals(buf)) {
      return false;
    }
  } catch {
    // File does not exist yet
  }
  await writeFile(destPath, buf);
  return true;
}

async function runWithConcurrency(tasks, limit) {
  const results = new Array(tasks.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < tasks.length) {
      const idx = nextIndex;
      nextIndex += 1;
      results[idx] = await tasks[idx]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function removeStaleFiles(dir, syncedSet, relPrefix = '') {
  let removedAny = false;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return false;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const childRemoved = await removeStaleFiles(fullPath, syncedSet, relPath);
      if (childRemoved) removedAny = true;
      const remaining = await readdir(fullPath);
      if (remaining.length === 0) {
        await rm(fullPath, { recursive: true, force: true });
      }
    } else {
      if (relPath === 'sync-meta.json') continue;
      if (!syncedSet.has(relPath)) {
        await rm(fullPath, { force: true });
        console.log(`Removed stale file: ${relPath}`);
        removedAny = true;
      }
    }
  }

  return removedAny;
}

async function main() {
  const sourceRepo = `${OWNER}/${REPO}`;
  console.log(`Checking ${sourceRepo} (${BRANCH})...`);

  const { commitSha, commitDate } = await fetchLatestCommit();
  const existingMeta = await readJsonIfExists(SYNC_META_PATH);
  const indexExists = await exists(path.join(OUTPUT_DIR, 'index.json'));

  if (
    !FORCE &&
    commitSha &&
    existingMeta &&
    existingMeta.sourceRepo === sourceRepo &&
    existingMeta.branch === BRANCH &&
    existingMeta.commitSha === commitSha &&
    indexExists
  ) {
    console.log(`Already up to date at commit ${commitSha.slice(0, 7)}.`);
    return;
  }

  const fetchRef = commitSha || BRANCH;

  // Fetch required core JSON files first
  const coreFiles = [
    'index.json',
    'search-index.json',
    'Church Order/crca-book-of-order-2022.json',
  ];

  const coreBuffers = new Map();
  for (const relPath of coreFiles) {
    coreBuffers.set(relPath, await fetchBuffer(relPath, { ref: fetchRef }));
  }

  const indexJson = JSON.parse(coreBuffers.get('index.json').toString('utf8'));
  const mdPaths = [];
  const pdfPathSet = new Set();

  for (const category of indexJson.categories || []) {
    for (const group of category.groups || []) {
      for (const item of group.items || []) {
        if (item.path) {
          mdPaths.push(item.path);
        }
        if (item.pdfPath && String(item.pdfPath).trim()) {
          pdfPathSet.add(String(item.pdfPath).trim());
        }
      }
    }
  }

  const requiredDownloads = [
    ...mdPaths.map((relPath) => ({ relPath, optional: false })),
    ...[...pdfPathSet].map((relPath) => ({ relPath, optional: false })),
    ...OPTIONAL_ASSETS.map((relPath) => ({ relPath, optional: true })),
  ];

  await mkdir(OUTPUT_DIR, { recursive: true });

  let anyFileChanged = false;
  const syncedSet = new Set();

  for (const [relPath, buf] of coreBuffers.entries()) {
    const normalized = relPath.replace(/\\/g, '/');
    syncedSet.add(normalized);
    const changed = await writeBufferIfChanged(path.join(OUTPUT_DIR, ...normalized.split('/')), buf);
    if (changed) anyFileChanged = true;
  }

  const tasks = requiredDownloads.map(({ relPath, optional }) => async () => {
    const normalized = relPath.replace(/\\/g, '/');
    const buf = await fetchBuffer(normalized, { optional, ref: fetchRef });
    if (buf === null) {
      console.log(`Skipped optional asset (not found): ${normalized}`);
      return;
    }
    syncedSet.add(normalized);
    const changed = await writeBufferIfChanged(path.join(OUTPUT_DIR, ...normalized.split('/')), buf);
    if (changed) anyFileChanged = true;
  });

  await runWithConcurrency(tasks, CONCURRENCY);

  const staleRemoved = await removeStaleFiles(OUTPUT_DIR, syncedSet);
  if (staleRemoved) anyFileChanged = true;

  const syncedAt =
    !commitSha && !anyFileChanged && existingMeta?.syncedAt
      ? existingMeta.syncedAt
      : new Date().toISOString();

  const meta = {
    sourceRepo,
    branch: BRANCH,
    commitSha,
    commitDate,
    generatedAt: indexJson.generatedAt || null,
    syncedAt,
    documentCount: typeof indexJson.documentCount === 'number' ? indexJson.documentCount : mdPaths.length,
  };

  const metaContent = JSON.stringify(meta, null, 2) + '\n';
  await writeBufferIfChanged(SYNC_META_PATH, Buffer.from(metaContent, 'utf8'));

  console.log(
    `Synced ${syncedSet.size} files (${meta.documentCount} documents)` +
      (commitSha ? ` at commit ${commitSha.slice(0, 7)}` : '') +
      '.'
  );
}

main().catch((err) => {
  console.error('CRCA document sync failed:', err);
  process.exit(1);
});
