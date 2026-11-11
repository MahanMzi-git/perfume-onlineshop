from django.db.models import Prefetch
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer

from .models import Product, Variant
from .serializers import ProductDetailSerializer


class ProductDetail(RetrieveAPIView):
    lookup_field = "slug"
    authentication_classes = []
    permission_classes = [AllowAny]
    renderer_classes = [JSONRenderer]
    serializer_class = ProductDetailSerializer
    queryset = Product.objects.filter(is_published=True).prefetch_related(
        Prefetch(
            "variants",
            queryset=Variant.objects.filter(is_active=True).order_by("volume_ml", "concentration", "pk"),
            to_attr="active_variants",
        )
    )
