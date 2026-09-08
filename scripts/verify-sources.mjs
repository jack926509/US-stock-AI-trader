import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, 'config/source-manifest.json'), 'utf8'));
const failures = [];
const expected = new Set();
let count = 0;
for (const project of manifest.projects) {
  for (const file of project.files) {
    const path = resolve(root, project.directory, file.path);
    const name = relative(root, path).split(sep).join('/');
    if (!name.startsWith('projects/') || expected.has(name)) {
      failures.push(`Invalid or duplicate path: ${name}`);
      continue;
    }
    expected.add(name);
    try {
      if (!lstatSync(path).isFile()) throw new Error('not a regular file');
      const data = readFileSync(path);
      const sha = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
      if (sha !== file.sha) failures.push(`Content changed: ${name}`);
      count++;
    } catch {
      failures.push(`Missing or unreadable: ${name}`);
    }
  }
}
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else {
      const name = relative(root, path).split(sep).join('/');
      if (!expected.has(name)) failures.push(`Unlisted file: ${name}`);
    }
  }
}
walk(resolve(root, 'projects'));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${manifest.projects.length} projects / ${count} files match pinned source Git blobs.`);
}
