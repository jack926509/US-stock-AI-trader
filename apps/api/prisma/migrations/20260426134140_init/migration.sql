-- CreateTable
CREATE TABLE "signals" (
    "id" BIGSERIAL NOT NULL,
    "source" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "signal_type" TEXT NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_fingerprints" (
    "fingerprint" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signal_fingerprints_pkey" PRIMARY KEY ("fingerprint")
);

-- CreateTable
CREATE TABLE "claude_evaluations" (
    "id" BIGSERIAL NOT NULL,
    "signal_id" BIGINT NOT NULL,
    "model" TEXT NOT NULL,
    "smc_structure" JSONB NOT NULL,
    "confidence" INTEGER NOT NULL,
    "rationale" TEXT,
    "api_cost_usd" DECIMAL(10,6),
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claude_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_decisions" (
    "id" BIGSERIAL NOT NULL,
    "signal_id" BIGINT NOT NULL,
    "evaluation_id" BIGINT,
    "decision" TEXT NOT NULL,
    "reject_reason" TEXT,
    "position_qty" INTEGER,
    "entry_price" DECIMAL(12,4),
    "stop_loss" DECIMAL(12,4),
    "take_profit" DECIMAL(12,4),
    "rr_ratio" DECIMAL(6,2),
    "kelly_fraction" DECIMAL(6,4),
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" BIGSERIAL NOT NULL,
    "decision_id" BIGINT NOT NULL,
    "alpaca_order_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "order_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "filled_avg_price" DECIMAL(12,4),
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "filled_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" BIGSERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "entry_order_id" BIGINT NOT NULL,
    "exit_order_id" BIGINT,
    "qty" INTEGER NOT NULL,
    "entry_price" DECIMAL(12,4) NOT NULL,
    "exit_price" DECIMAL(12,4),
    "status" TEXT NOT NULL,
    "pnl_usd" DECIMAL(12,4),
    "opened_at" TIMESTAMP(3) NOT NULL,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_pnl" (
    "trade_date" DATE NOT NULL,
    "realized_pnl" DECIMAL(12,4) NOT NULL,
    "unrealized_pnl" DECIMAL(12,4) NOT NULL,
    "trades_count" INTEGER NOT NULL,
    "win_count" INTEGER NOT NULL,
    "loss_count" INTEGER NOT NULL,
    "account_equity" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "daily_pnl_pkey" PRIMARY KEY ("trade_date")
);

-- CreateIndex
CREATE INDEX "signals_symbol_received_at_idx" ON "signals"("symbol", "received_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "orders_alpaca_order_id_key" ON "orders"("alpaca_order_id");

-- CreateIndex
CREATE INDEX "positions_symbol_status_idx" ON "positions"("symbol", "status");

-- AddForeignKey
ALTER TABLE "claude_evaluations" ADD CONSTRAINT "claude_evaluations_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "signals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_decisions" ADD CONSTRAINT "trade_decisions_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "signals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_decisions" ADD CONSTRAINT "trade_decisions_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "claude_evaluations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "trade_decisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_entry_order_id_fkey" FOREIGN KEY ("entry_order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_exit_order_id_fkey" FOREIGN KEY ("exit_order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
