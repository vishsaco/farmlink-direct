"""WSGI config for FarmLink Direct project."""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "farmlink.settings")
application = get_wsgi_application()


# ── Eager initialization — pre-warm caches during server boot ──
# This runs in a background thread so it doesn't block gunicorn's
# readiness, but ensures heavy imports and API caches are populated
# before the first user request arrives.
def _prewarm():
    """Pre-import heavy libraries and populate the live price cache."""
    import logging
    logger = logging.getLogger("farmlink.wsgi")
    try:
        import time
        t0 = time.time()

        # Pre-import heavy ML libraries (these take 2-5s to import cold)
        import numpy  # noqa: F401
        logger.info("Pre-warmed numpy")

        try:
            import sklearn  # noqa: F401
            logger.info("Pre-warmed sklearn")
        except ImportError:
            pass

        # Pre-populate the live price cache for all commodities
        from forecasts.engine import get_all_live_prices
        result = get_all_live_prices()
        commodity_count = result.get("commodity_count", 0)

        elapsed = round(time.time() - t0, 1)
        logger.info(
            f"WSGI pre-warm complete: {commodity_count} commodities cached in {elapsed}s"
        )
    except Exception as e:
        logger.warning(f"WSGI pre-warm failed (non-fatal): {e}")


import threading
threading.Thread(target=_prewarm, daemon=True, name="wsgi-prewarm").start()
