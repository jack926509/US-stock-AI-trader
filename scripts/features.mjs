import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalog = JSON.parse(readFileSync(resolve(root, 'config/features.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(resolve(root, 'config/source-manifest.json'), 'utf8'));
const sourcePaths = new Set(manifest.projects.flatMap(p => p.files.map(f => `${p.directory}/${f.path}`)));
const errors = [];
console.log('功能保留對照（不是服務啟動或正式環境驗收）');
for (const feature of catalog.features) {
  if (!Object.hasOwn(catalog.statuses, feature.status)) errors.push(`Unknown status: ${feature.id}`);
  for (const path of feature.evidence) {
    if (!sourcePaths.has(path) || !existsSync(resolve(root, path))) errors.push(`Missing source: ${path}`);
  }
  console.log(`${feature.name}｜${catalog.statuses[feature.status]}`);
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${catalog.features.length} feature groups map to preserved source files. No application modules were executed.`);
}
