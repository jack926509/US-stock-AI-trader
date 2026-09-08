import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../config/source-manifest.json', import.meta.url), 'utf8'));
console.log('美股策略研究｜本機看板實作階段');
console.log('根目錄 dev/start 可啟動 127.0.0.1 本機看板；此命令只顯示狀態，不會啟動服務。');
console.log('共用行情、自選股、市場總覽、個股研究與規則策略已接到本機入口；外部行情 live 驗證尚未完成。');
console.log('AI API 固定回應 410；通知、排程與下單沒有由整合入口啟用。');
for (const project of manifest.projects) {
  console.log(`${project.directory} ← ${project.repository} (${project.files.length} files)`);
}
console.log('執行 npm run verify 檢查 immutable baseline 與明列變更；詳情請閱讀 README.md 與 docs/LOCAL-DASHBOARD-IMPLEMENTATION.md。');
