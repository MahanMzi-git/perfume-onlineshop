from django.urls import path

from catalog.views import ProductDetail

from . import health
from .seller_auth import seller_login, seller_logout, seller_session

urlpatterns = [
    path("api/v1/seller/session/", seller_session),
    path("api/v1/seller/login/", seller_login),
    path("api/v1/seller/logout/", seller_logout),
    path("api/v1/products/<slug:slug>/", ProductDetail.as_view()),
    path("health/live/", health.live),
    path("health/ready/", health.ready),
]
