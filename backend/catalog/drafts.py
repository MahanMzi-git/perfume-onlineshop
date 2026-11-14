from uuid import uuid4
import unicodedata

from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from rest_framework import generics, serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.renderers import JSONRenderer

from aroma.seller_auth import SellerCatalogPermission

from .models import Brand, FamilyNote, FragranceFamily, Product, ProductFamilyNote, ScentNote


def brand_key(name):
    return " ".join(unicodedata.normalize("NFKC", name).replace("ي", "ی").replace("ك", "ک").casefold().split())


class DraftSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    updatedAt = serializers.SerializerMethodField()
    brandName = serializers.CharField(required=False, allow_blank=True, max_length=180)

    noteIds = serializers.ListField(child=serializers.SlugField(max_length=50), required=False, write_only=True)

    familyId = serializers.SlugRelatedField(
        source="selected_family", slug_field="slug", queryset=FragranceFamily.objects.all(),
        required=False, allow_null=True,
    )

    class Meta:
        model = Product
        fields = ("id", "name", "brandName", "familyId", "noteIds", "status", "updatedAt")

    def to_representation(self, product):
        data = super().to_representation(product)
        data["brandName"] = product.brand.name if product.brand_id else ""
        family = next(iter(product.fragrance_families.all()), None)
        data["familyId"] = family.slug if family else None
        data["noteIds"] = sorted({link.family_note.note.slug for link in product.family_notes.all()})
        return data

    def get_id(self, product):
        return f"draft-{product.pk}"

    def get_status(self, product):
        return "پیش‌نویس"

    def get_updatedAt(self, product):
        return int(product.updated_at.timestamp() * 1000)

    def to_internal_value(self, data):
        if not hasattr(data, "keys") or not data or set(data) - {"name", "brandName", "familyId", "noteIds"}:
            raise serializers.ValidationError({"detail": "Send only draft fields."})
        if self.instance is None and ("name" not in data or "brandName" in data):
            raise serializers.ValidationError({"name": "Send a product name as text."})
        if "name" in data and not isinstance(data["name"], str):
            raise serializers.ValidationError({"name": "Send a product name as text."})
        if "brandName" in data and not isinstance(data["brandName"], str):
            raise serializers.ValidationError({"brandName": "Send a brand name as text."})
        if "brandName" in data and data["brandName"].strip() and len(data["brandName"].strip()) < 2:
            raise serializers.ValidationError({"brandName": "Brand name must have at least two characters."})
        if "familyId" in data and data["familyId"] is not None and (not isinstance(data["familyId"], str) or not data["familyId"]):
            raise serializers.ValidationError({"familyId": "Select a valid fragrance family."})
        if "noteIds" in data and (
            not isinstance(data["noteIds"], list) or any(not isinstance(note, str) for note in data["noteIds"])
        ):
            raise serializers.ValidationError({"noteIds": "Send a list of note IDs."})
        return super().to_internal_value(data)

    def validate(self, attrs):
        if "noteIds" not in attrs and "selected_family" not in attrs:
            return attrs
        if "selected_family" in attrs:
            family = attrs["selected_family"]
            families = [family] if family else []
        else:
            families = list(self.instance.fragrance_families.all()) if self.instance else []
        if "noteIds" in attrs:
            slugs = set(attrs.pop("noteIds"))
        else:
            slugs = {link.family_note.note.slug for link in self.instance.family_notes.all()} if self.instance else set()
        if len(slugs) > 4:
            raise serializers.ValidationError({"noteIds": "Select at most four notes."})
        compatible = {}
        for link in FamilyNote.objects.filter(family__in=families, note__slug__in=slugs).select_related("note").order_by("family_id"):
            compatible.setdefault(link.note.slug, link)
        if compatible.keys() != slugs:
            raise serializers.ValidationError({"noteIds": "Select notes associated with the chosen fragrance families."})
        attrs["note_links"] = list(compatible.values())
        return attrs

    def save_notes(self, product, links):
        product.family_notes.all().delete()
        ProductFamilyNote.objects.bulk_create([
            ProductFamilyNote(product=product, family_note=link) for link in links
        ])
        if hasattr(product, "_prefetched_objects_cache"):
            product._prefetched_objects_cache.pop("family_notes", None)

    @transaction.atomic
    def create(self, validated_data):
        family = validated_data.pop("selected_family", None)
        notes = validated_data.pop("note_links", [])
        product = Product.objects.create(slug=f"product-{uuid4().hex}", **validated_data)
        if family:
            product.fragrance_families.add(family)
        self.save_notes(product, notes)
        return product

    def update(self, instance, validated_data):
        fields = ["updated_at"]
        if "name" in validated_data:
            instance.name = validated_data["name"]
            fields.append("name")
        if "brandName" in validated_data:
            name = " ".join(validated_data["brandName"].split())
            key = brand_key(name)
            if len(key) > 180:
                raise serializers.ValidationError({"brandName": "Brand name is too long."})
            brand = Brand.objects.filter(key=key).first() if key else None
            if key and not brand:
                if not self.context["request"].user.has_perm("catalog.add_brand"):
                    raise PermissionDenied("Cannot create a brand.")
                brand, _ = Brand.objects.get_or_create(
                    key=key, defaults={"name": name, "slug": f"brand-{uuid4().hex}"}
                )
            instance.brand = brand
            fields.append("brand")
        instance.save(update_fields=fields)
        if "selected_family" in validated_data:
            family = validated_data["selected_family"]
            instance.fragrance_families.set([family] if family else [])
        if "note_links" in validated_data:
            self.save_notes(instance, validated_data["note_links"])
        return instance


@method_decorator(never_cache, name="dispatch")
class DraftView(generics.GenericAPIView):
    permission_classes = [SellerCatalogPermission]
    renderer_classes = [JSONRenderer]
    serializer_class = DraftSerializer
    queryset = Product.objects.filter(is_published=False).select_related("brand").prefetch_related("fragrance_families", "family_notes__family_note__note").order_by("-updated_at", "-pk")

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

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.method == "PATCH":
            return queryset.select_for_update(of=("self",))
        return queryset

    @transaction.atomic
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


@method_decorator(never_cache, name="dispatch")
class BrandList(generics.ListAPIView):
    permission_classes = [SellerCatalogPermission]
    renderer_classes = [JSONRenderer]
    seller_permission = "catalog.view_brand"
    queryset = Brand.objects.order_by("name")

    class BrandSerializer(serializers.ModelSerializer):
        class Meta:
            model = Brand
            fields = ("name",)

    serializer_class = BrandSerializer


class ScentNoteSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug")

    class Meta:
        model = ScentNote
        fields = ("id", "name")


class FragranceFamilySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="slug")

    notes = ScentNoteSerializer(many=True, read_only=True)

    class Meta:
        model = FragranceFamily
        fields = ("id", "name", "notes")


@method_decorator(never_cache, name="dispatch")
class FragranceFamilyList(generics.ListAPIView):
    permission_classes = [SellerCatalogPermission]
    renderer_classes = [JSONRenderer]
    seller_permission = "catalog.view_product"
    serializer_class = FragranceFamilySerializer
    queryset = FragranceFamily.objects.prefetch_related("notes").order_by("name")
