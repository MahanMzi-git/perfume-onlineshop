from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import Client, TestCase

from catalog.models import Brand, Product


class SellerDraftTests(TestCase):
    url = "/api/v1/seller/products/"

    def setUp(self):
        self.browser = Client(enforce_csrf_checks=True)
        self.user = get_user_model().objects.create_user("draft-staff", is_staff=True)
        self.user.user_permissions.add(Permission.objects.get(codename="view_product", content_type__app_label="catalog"))

    def grant(self, codename):
        self.user.user_permissions.add(Permission.objects.get(codename=codename, content_type__app_label="catalog"))

    def sign_in(self):
        self.browser.force_login(self.user)
        return self.browser.get("/api/v1/seller/session/").json()["csrfToken"]

    def write(self, method, url, data, token):
        return getattr(self.browser, method)(url, data, content_type="application/json", HTTP_X_CSRFTOKEN=token)

    def test_draft_round_trip_stays_private(self):
        self.grant("add_product")
        self.grant("change_product")
        csrf = self.sign_in()
        created = self.write("post", self.url, {"name": "  عطر آزمایشی  "}, csrf)
        self.assertEqual(created.status_code, 201)
        draft = created.json()
        self.assertEqual(draft["name"], "عطر آزمایشی")
        self.assertIsInstance(draft["updatedAt"], int)
        detail = self.url + draft["id"] + "/"
        original_slug = Product.objects.get().slug
        updated = self.write("patch", detail, {"name": "نام تازه"}, csrf)
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(self.browser.get(detail).json()["name"], "نام تازه")
        self.assertEqual(self.browser.get(self.url).json(), [updated.json()])
        self.assertEqual(Product.objects.get().slug, original_slug)
        self.assertEqual(Client().get(f"/api/v1/products/{original_slug}/").status_code, 404)

    def test_permission_validation_and_csrf(self):
        self.assertEqual(self.browser.get(self.url).status_code, 403)
        draft = Product.objects.create(name="Draft", slug="draft")
        detail = self.url + f"draft-{draft.pk}/"
        csrf = self.sign_in()
        self.assertEqual(self.browser.get(detail).status_code, 200)
        self.assertEqual(self.write("post", self.url, {"name": "Denied"}, csrf).status_code, 403)
        self.assertEqual(self.write("patch", detail, {"name": "Denied"}, csrf).status_code, 403)
        self.grant("add_product")
        self.assertEqual(self.write("post", self.url, {"name": "No token"}, "").status_code, 403)
        for data in ({"name": " "}, {"name": "x" * 181}, {"name": "Draft", "is_published": True}):
            self.assertEqual(self.write("post", self.url, data, csrf).status_code, 400)
        Product.objects.filter(pk=draft.pk).update(is_published=True)
        self.assertEqual(self.browser.get(detail).status_code, 404)
        self.assertEqual(self.browser.get(self.url).json(), [])

    def test_brand_link_and_creation_require_separate_permission(self):
        self.grant("add_product")
        self.grant("change_product")
        csrf = self.sign_in()
        created = self.write("post", self.url, {"name": "Sample"}, csrf)
        detail = self.url + created.json()["id"] + "/"
        self.assertEqual(self.write("patch", detail, {"brandName": "  Acme  "}, csrf).status_code, 403)
        self.assertFalse(Brand.objects.exists())
        self.assertEqual(Product.objects.get().name, "Sample")

        self.grant("add_brand")
        linked = self.write("patch", detail, {"brandName": "  Acme  "}, csrf)
        self.assertEqual(linked.status_code, 200)
        self.assertEqual(linked.json()["brandName"], "Acme")
        self.assertEqual(Brand.objects.count(), 1)
        self.assertEqual(Product.objects.get().brand.name, "Acme")

        self.user.user_permissions.remove(Permission.objects.get(codename="add_brand", content_type__app_label="catalog"))
        self.user = get_user_model().objects.get(pk=self.user.pk)
        reused = self.write("patch", detail, {"brandName": "acme"}, csrf)
        self.assertEqual(reused.status_code, 200)
        self.assertEqual(reused.json()["brandName"], "Acme")
        self.assertEqual(Brand.objects.count(), 1)
        self.assertEqual(self.browser.get(self.url).json()[0]["brandName"], "Acme")
        self.assertEqual(self.write("patch", detail, {"brandName": ""}, csrf).json()["brandName"], "")

    def test_brand_validation_and_private_listing(self):
        self.grant("add_brand")
        csrf = self.sign_in()
        self.assertEqual(self.browser.get("/api/v1/seller/brands/").status_code, 403)
        self.grant("view_brand")
        self.assertEqual(self.browser.get("/api/v1/seller/brands/").json(), [])
        session = self.browser.get("/api/v1/seller/session/").json()
        self.assertTrue(session["draftPermissions"]["createBrand"])
        self.assertTrue(session["draftPermissions"]["viewBrand"])
        self.grant("add_product")
        detail = self.url + self.write("post", self.url, {"name": "Sample"}, csrf).json()["id"] + "/"
        self.grant("change_product")
        for invalid in ({"brandName": "x"}, {"brandName": "x" * 181}, {"brandName": 5}, {"brandName": "Acme", "is_published": True}):
            self.assertEqual(self.write("patch", detail, invalid, csrf).status_code, 400)
        self.assertFalse(Brand.objects.exists())
        self.assertEqual(self.write("patch", detail, {"brandName": "Acme"}, csrf).status_code, 200)
        self.assertEqual(self.browser.get("/api/v1/seller/brands/").json(), [{"name": "Acme"}])
        self.assertEqual(Client().get("/api/v1/seller/brands/").status_code, 403)

    def test_fragrance_family_round_trip(self):
        from catalog.models import FragranceFamily

        self.grant("add_product")
        self.grant("change_product")
        csrf = self.sign_in()
        options = self.browser.get("/api/v1/seller/fragrance-families/")
        self.assertEqual(options.status_code, 200)
        self.assertEqual(len(options.json()), 13)
        invalid = self.write("post", self.url, {"name": "Sample", "familyId": "missing"}, csrf)
        self.assertEqual(invalid.status_code, 400)
        self.assertFalse(Product.objects.exists())
        created = self.write("post", self.url, {"name": "Sample", "familyId": "woody"}, csrf)
        self.assertEqual(created.status_code, 201, created.content)
        detail = self.url + created.json()["id"] + "/"
        self.assertEqual(self.browser.get(detail).json()["familyId"], "woody")
        updated = self.write("patch", detail, {"familyId": "floral"}, csrf)
        self.assertEqual(updated.status_code, 200, updated.content)
        self.assertEqual(updated.json()["familyId"], "floral")
        self.assertEqual(self.browser.get(detail).json()["familyId"], "floral")
        self.assertEqual(self.write("patch", detail, {"familyId": False}, csrf).status_code, 400)
        product = Product.objects.get()
        self.assertEqual(list(product.fragrance_families.values_list("slug", flat=True)), ["floral"])
        self.assertEqual(Client().get(f"/api/v1/products/{product.slug}/").status_code, 404)
        product.fragrance_families.add(FragranceFamily.objects.get(slug="woody"))
        self.write("patch", detail, {"name": "Renamed"}, csrf)
        self.assertEqual(product.fragrance_families.count(), 2)
        self.assertIsNone(self.write("patch", detail, {"familyId": None}, csrf).json()["familyId"])
        self.assertFalse(product.fragrance_families.exists())
