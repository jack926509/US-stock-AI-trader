import { logger } from "./logger.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegram(text: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    logger.warn("telegram credentials missing, skipping send");
    return;
  }
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "Markdown" }),
  });
  if (!res.ok) {
    logger.error({ status: res.status, body: await res.text() }, "telegram send failed");
  }
}
