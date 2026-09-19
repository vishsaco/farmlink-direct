"""
Render Free-Tier Keep-Alive Script
===================================
Pings the FarmLink Direct backend every 14 minutes to prevent
Render's free tier from spinning down the service (cold starts).

Usage:
  - Deployed as a Render cron job (see render.yaml)
  - Or run locally: python keep_alive.py
"""

import urllib.request
import json
import time
import sys

BACKEND_URL = "https://farmlink-direct.onrender.com/"
TIMEOUT_SECONDS = 30


def ping_backend():
    """Send a lightweight GET request to the health check endpoint."""
    try:
        t0 = time.time()
        req = urllib.request.Request(
            BACKEND_URL,
            headers={"User-Agent": "FarmLink-KeepAlive/1.0"},
        )
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as response:
            data = json.loads(response.read().decode("utf-8"))
            latency_ms = round((time.time() - t0) * 1000)
            status = data.get("status", "unknown")
            print(f"[keep-alive] OK — status={status}, latency={latency_ms}ms")
            return True
    except Exception as e:
        print(f"[keep-alive] FAILED — {e}", file=sys.stderr)
        return False


if __name__ == "__main__":
    ping_backend()
