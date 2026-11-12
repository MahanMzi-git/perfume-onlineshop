from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import Client, TestCase

from catalog.models import Product


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
