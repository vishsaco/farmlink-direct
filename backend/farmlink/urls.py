"""FarmLink Direct URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
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
