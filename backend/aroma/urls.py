from django.urls import path

from catalog.views import ProductDetail

from . import health

urlpatterns = [
    path("api/v1/products/<slug:slug>/", ProductDetail.as_view()),
    path("health/live/", health.live),
    path("health/ready/", health.ready),
]
