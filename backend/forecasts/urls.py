from django.urls import path
from . import views

urlpatterns = [
    path("sync-mandi/", views.sync_mandi_view, name="sync-mandi"),
    path("config-key/", views.set_api_key_view, name="config-key"),
    path("<str:commodity>/", views.forecast_view, name="forecast-commodity"),
]
