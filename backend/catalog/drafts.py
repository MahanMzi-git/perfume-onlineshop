from uuid import uuid4

from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from rest_framework import generics, serializers
from rest_framework.renderers import JSONRenderer

from aroma.seller_auth import SellerCatalogPermission

from .models import Product


class DraftSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    updatedAt = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ("id", "name", "status", "updatedAt")

    def get_id(self, product):
        return f"draft-{product.pk}"

    def get_status(self, product):
        return "پیش‌نویس"

    def get_updatedAt(self, product):
        return int(product.updated_at.timestamp() * 1000)

    def to_internal_value(self, data):
        if not hasattr(data, "keys") or set(data) != {"name"} or not isinstance(data["name"], str):
            raise serializers.ValidationError({"name": "Send a product name as text."})
        return super().to_internal_value(data)

    def create(self, validated_data):
        return Product.objects.create(slug=f"product-{uuid4().hex}", **validated_data)

    def update(self, instance, validated_data):
        instance.name = validated_data["name"]
        instance.save(update_fields=["name", "updated_at"])
        return instance


@method_decorator(never_cache, name="dispatch")
class DraftView(generics.GenericAPIView):
    permission_classes = [SellerCatalogPermission]
    renderer_classes = [JSONRenderer]
    serializer_class = DraftSerializer
    queryset = Product.objects.filter(is_published=False).order_by("-updated_at", "-pk")

    @property
    def seller_permission(self):
        return {
            "GET": "catalog.view_product",
            "HEAD": "catalog.view_product",
            "POST": "catalog.add_product",
            "PATCH": "catalog.change_product",
        }.get(self.request.method)


class DraftList(DraftView, generics.ListCreateAPIView):
    pass


class DraftDetail(DraftView, generics.RetrieveUpdateAPIView):
    http_method_names = ["get", "head", "patch"]
