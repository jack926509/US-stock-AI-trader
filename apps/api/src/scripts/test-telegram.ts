import "dotenv/config";
import { sendTelegram } from "../lib/telegram.js";

const msg = `*[Phase 0 Smoke Test]*
美股 AI 自動化交易系統 Telegram 通道驗證成功 ✅
時間：${new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}`;

await sendTelegram(msg);
console.log("done");
