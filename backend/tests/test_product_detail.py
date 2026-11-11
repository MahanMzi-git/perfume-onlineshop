from django.test import TestCase

from catalog.models import Product, Variant


class ProductDetailTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.product = Product.objects.create(
            slug="sample-perfume", name="Sample Perfume", is_published=True
        )
        for sku, volume, price, active in (
            ("S-60", 60, 1200000, True),
            ("S-100", 100, 1800000, True),
            ("S-30", 30, 700000, False),
        ):
            Variant.objects.create(
                product=cls.product, sku=sku, volume_ml=volume,
                concentration="EDP", price=price, is_active=active,
            )

    def test_published_product_returns_only_active_variants(self):
        response = self.client.get("/api/v1/products/sample-perfume/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Sample Perfume")
        self.assertEqual(data["price_unit"], "IRT")
        self.assertEqual(
            [(v["sku"], v["volume_ml"], v["price"]) for v in data["variants"]],
            [("S-60", 60, 1200000), ("S-100", 100, 1800000)],
        )
        self.assertTrue(all(isinstance(v["id"], str) for v in data["variants"]))

    def test_missing_and_unpublished_products_return_404(self):
        Product.objects.create(slug="draft", name="Draft")
        for slug in ("missing", "draft"):
            with self.subTest(slug=slug):
                self.assertEqual(self.client.get(f"/api/v1/products/{slug}/").status_code, 404)

    def test_no_active_variants_returns_empty_list(self):
        Variant.objects.filter(product=self.product).update(is_active=False)
        response = self.client.get("/api/v1/products/sample-perfume/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["variants"], [])

    def test_post_is_not_allowed(self):
        self.assertEqual(self.client.post("/api/v1/products/sample-perfume/").status_code, 405)
