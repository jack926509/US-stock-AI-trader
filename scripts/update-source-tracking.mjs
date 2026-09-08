import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const outputPath = resolve(root, 'config/source-changes.json');
const manifest = JSON.parse(readFileSync(resolve(root, 'config/source-manifest.json'), 'utf8'));
const ignoredDirectories = new Set(['node_modules', '.next', 'coverage', 'dist', 'build', '.turbo', '.local-data']);
const isGeneratedFile = (name) => name.endsWith('.tsbuildinfo') || name === 'next-env.d.ts' || name === '.DS_Store';
const gitBlobSha = (data) => createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
const toName = (path) => relative(root, path).split(sep).join('/');
const baseline = new Map(manifest.projects.flatMap((project) => project.files.map((file) => [`${project.directory}/${file.path}`, file.sha])));
const files = [];
const missing = [];

for (const [name, baselineSha] of baseline) {
  const path = resolve(root, name);
  try {
    if (!lstatSync(path).isFile()) throw new Error('not a regular file');
    const currentSha = gitBlobSha(readFileSync(path));
    if (currentSha !== baselineSha) files.push({ kind: 'modification', path: name, baselineSha, currentSha });
  } catch {
    missing.push(name);
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile() && !isGeneratedFile(entry.name)) {
      const name = toName(path);
      if (!baseline.has(name)) files.push({ kind: 'addition', path: name, baselineSha: null, currentSha: gitBlobSha(readFileSync(path)) });
    } else if (entry.isSymbolicLink()) missing.push(`${toName(path)} (symbolic link is not tracked)`);
  }
}
walk(resolve(root, 'projects'));

if (missing.length) {
  console.error(`Refusing to update tracking because baseline files are missing or unsupported entries exist:\n${missing.join('\n')}`);
  process.exit(1);
}
files.sort((a, b) => a.path.localeCompare(b.path));
const next = { version: 1, baseline: 'config/source-manifest.json', generatedAt: new Date().toISOString(), files };

if (!process.argv.includes('--write')) {
  console.log(JSON.stringify(next, null, 2));
  console.error('\nDry run only. Re-run with --write after the implementation is frozen and reviewed.');
} else {
  writeFileSync(outputPath, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Wrote ${relative(root, outputPath)} with ${files.length} explicit source changes.`);
}
