from django.db import models


class SellerLoginAttempt(models.Model):
    key = models.CharField(max_length=64, primary_key=True)
    failures = models.PositiveSmallIntegerField(default=0)
    expires_at = models.DateTimeField(db_index=True)


class Product(models.Model):
    slug = models.SlugField(max_length=180, unique=True)
    name = models.CharField(max_length=180)
    is_published = models.BooleanField(default=False)


class Variant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    sku = models.CharField(max_length=80, unique=True)
    volume_ml = models.PositiveIntegerField()
    concentration = models.CharField(max_length=24)
    price = models.PositiveBigIntegerField(help_text="Whole tomans")
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(volume_ml__gt=0), name="variant_volume_positive"),
            models.CheckConstraint(
                condition=models.Q(price__range=(1, 9_007_199_254_740_991)),
                name="variant_price_safe_integer",
            ),
        ]
