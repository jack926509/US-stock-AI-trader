import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifestPath = resolve(root, 'config/source-manifest.json');
const changesPath = resolve(root, 'config/source-changes.json');
const manifestBytes = readFileSync(manifestPath);
const manifestDigest = createHash('sha256').update(manifestBytes).digest('hex');
const EXPECTED_MANIFEST_SHA256 = 'c3b90a966a6590e87d95292f67dfb8e35a292ace5d5d38eacad5b23de3561137';
const manifest = JSON.parse(manifestBytes);
const tracking = JSON.parse(readFileSync(changesPath, 'utf8'));
const failures = [];

if (manifestDigest !== EXPECTED_MANIFEST_SHA256) failures.push('config/source-manifest.json differs from the immutable 344-file baseline');
if (tracking.version !== 1 || tracking.baseline !== 'config/source-manifest.json' || !Array.isArray(tracking.files)) failures.push('Invalid config/source-changes.json schema');

const ignoredDirectories = new Set(['node_modules', '.next', 'coverage', 'dist', 'build', '.turbo', '.local-data']);
const isGeneratedFile = (name) => name.endsWith('.tsbuildinfo') || name === 'next-env.d.ts' || name === '.DS_Store';
const gitBlobSha = (data) => createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
const toName = (path) => relative(root, path).split(sep).join('/');
const baseline = new Map();

for (const project of manifest.projects ?? []) {
  for (const file of project.files ?? []) {
    const name = `${project.directory}/${file.path}`;
    if (!name.startsWith('projects/') || baseline.has(name)) failures.push(`Invalid or duplicate baseline path: ${name}`);
    else baseline.set(name, file.sha);
  }
}
if (baseline.size !== 344) failures.push(`Baseline file count changed: expected 344, found ${baseline.size}`);

const changes = new Map();
for (const change of tracking.files ?? []) {
  if (!change || typeof change.path !== 'string' || changes.has(change.path)) {
    failures.push(`Invalid or duplicate change path: ${change?.path ?? '<missing>'}`);
    continue;
  }
  if (change.kind === 'modification') {
    if (!baseline.has(change.path) || change.baselineSha !== baseline.get(change.path) || !/^[0-9a-f]{40}$/.test(change.currentSha ?? '')) failures.push(`Invalid modification entry: ${change.path}`);
  } else if (change.kind === 'addition') {
    if (baseline.has(change.path) || change.baselineSha !== null || !change.path.startsWith('projects/') || !/^[0-9a-f]{40}$/.test(change.currentSha ?? '')) failures.push(`Invalid addition entry: ${change.path}`);
  } else failures.push(`Unknown change kind: ${change.path}`);
  changes.set(change.path, change);
}

const seenChanges = new Set();
for (const [name, baselineSha] of baseline) {
  const path = resolve(root, name);
  try {
    if (!lstatSync(path).isFile()) throw new Error('not a regular file');
    const currentSha = gitBlobSha(readFileSync(path));
    const change = changes.get(name);
    if (currentSha === baselineSha) {
      if (change) failures.push(`Stale change entry for baseline-identical file: ${name}`);
    } else if (!change || change.kind !== 'modification' || change.baselineSha !== baselineSha || change.currentSha !== currentSha) {
      failures.push(`Untracked content change: ${name}`);
    } else seenChanges.add(name);
  } catch {
    failures.push(`Missing or unreadable baseline file: ${name}`);
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile() && !isGeneratedFile(entry.name)) {
      const name = toName(path);
      if (baseline.has(name)) continue;
      const change = changes.get(name);
      const currentSha = gitBlobSha(readFileSync(path));
      if (!change || change.kind !== 'addition' || change.baselineSha !== null || change.currentSha !== currentSha) failures.push(`Untracked added source file: ${name}`);
      else seenChanges.add(name);
    } else if (entry.isSymbolicLink()) failures.push(`Untracked symbolic link: ${toName(path)}`);
  }
}
walk(resolve(root, 'projects'));

for (const name of changes.keys()) if (!seenChanges.has(name)) failures.push(`Change entry does not match a current changed file: ${name}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  const modified = [...changes.values()].filter((entry) => entry.kind === 'modification').length;
  const added = changes.size - modified;
  console.log(`PASS: immutable ${baseline.size}-file baseline verified; ${modified} modifications and ${added} additions explicitly tracked.`);
}
