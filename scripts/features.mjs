import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(readFileSync(resolve(root, 'config/features.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(root, 'config/source-manifest.json'), 'utf8'));
const tracking = JSON.parse(readFileSync(resolve(root, 'config/source-changes.json'), 'utf8'));
const baselinePaths = new Set(manifest.projects.flatMap((project) => project.files.map((file) => `${project.directory}/${file.path}`)));
const addedPaths = new Set(tracking.files.filter((file) => file.kind === 'addition').map((file) => file.path));
const knownPaths = new Set([...baselinePaths, ...addedPaths]);
const errors = [];

if (catalog.version !== 2 || !Array.isArray(catalog.features)) errors.push('Invalid feature catalog schema');
console.log('功能對照（本機可用不代表外部行情已完成 live 驗證）');
for (const feature of catalog.features) {
  if (!Object.hasOwn(catalog.statuses, feature.status)) errors.push(`Unknown status: ${feature.id}`);
  if (!Array.isArray(feature.evidence) || feature.evidence.length === 0) errors.push(`No evidence: ${feature.id}`);
  for (const path of feature.evidence ?? []) {
    if (!knownPaths.has(path)) errors.push(`Evidence is absent from baseline/change tracking: ${path}`);
    else if (!existsSync(resolve(root, path))) errors.push(`Missing evidence file: ${path}`);
  }
  console.log(`${feature.name}｜${catalog.statuses[feature.status]}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${catalog.features.length} feature groups have tracked evidence files. No application modules were executed.`);
}
