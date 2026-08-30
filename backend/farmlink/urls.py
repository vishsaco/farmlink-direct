"""FarmLink Direct URL Configuration with Health Check Endpoint"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({
        "status": "online",
        "service": "FarmLink Direct - B2B Fresh Produce API",
        "cluster": "Lucknow Regional Agri-Cluster",
        "version": "1.0.0",
        "endpoints": [
            "/api/auth/",
            "/api/lots/",
            "/api/orders/",
            "/api/forecasts/",
            "/api/routes/",
            "/api/fulfillment/"
        ]
    })

urlpatterns = [
    path("", health_check, name="root-health"),
    path("api/", health_check, name="api-health"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/lots/", include("lots.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/forecasts/", include("forecasts.urls")),
    path("api/routes/", include("routing.urls")),
    path("api/fulfillment/", include("fulfillment.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
