from rest_framework import serializers

from .models import Product, Variant


class VariantSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Variant
        fields = ("id", "sku", "volume_ml", "concentration", "price")


class ProductDetailSerializer(serializers.ModelSerializer):
    price_unit = serializers.ReadOnlyField(default="IRT")
    variants = VariantSerializer(source="active_variants", many=True, read_only=True)

    class Meta:
        model = Product
        fields = ("slug", "name", "price_unit", "variants")
