"""Phase 0: 啟動 APScheduler 並輸出 hello world，驗證常駐流程可運作。
Phase 1 將擴充：拉 OHLCV、算指標、偵測 cross/divergence、POST 至 Node.js。
"""

import os

import structlog
from apscheduler.schedulers.blocking import BlockingScheduler
from dotenv import load_dotenv

load_dotenv()

log = structlog.get_logger()

INTERVAL_MIN = int(os.getenv("PYTHON_SCAN_INTERVAL_MIN", "5"))
NODE_INTERNAL_URL = os.getenv("NODE_INTERNAL_URL", "http://localhost:8080/internal/python-signal")


def scan_pool() -> None:
    """Phase 0 placeholder：每次觸發只記一條 log。"""
    log.info("scan_pool tick", interval_min=INTERVAL_MIN, target=NODE_INTERNAL_URL)


def main() -> None:
    log.info("engine starting", interval_min=INTERVAL_MIN)
    scheduler = BlockingScheduler(timezone="UTC")
    scheduler.add_job(scan_pool, "interval", minutes=INTERVAL_MIN, next_run_time=None)
    scan_pool()  # 立即跑一次，方便 smoke test
    scheduler.start()


if __name__ == "__main__":
    main()
