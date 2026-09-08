import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from "./lib/logger.js";
import { webhookRouter } from "./routes/webhook.js";
import { internalRouter } from "./routes/internal.js";
import { apiRouter } from "./routes/api.js";

const app = express();
const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 8080);

const corsOrigin = process.env.DASHBOARD_ORIGIN ?? true;
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

app.use("/webhook", webhookRouter);
app.use("/internal", internalRouter);
app.use("/api", apiRouter);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "api server started");
});
