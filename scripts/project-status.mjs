import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../config/source-manifest.json', import.meta.url), 'utf8'));
console.log('美股策略研究｜原始碼整併階段');
console.log('目前沒有啟動服務；AI 分析、通知、排程與下單均未由整合入口啟用。');
for (const project of manifest.projects) {
  console.log(`${project.directory} ← ${project.repository} (${project.files.length} files)`);
}
console.log('執行 npm run verify 檢查來源完整性；後續開發請先閱讀 README.md。');
