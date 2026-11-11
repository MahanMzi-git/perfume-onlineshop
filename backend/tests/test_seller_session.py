from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.sessions.models import Session
from django.test import Client, TestCase, override_settings
from django.urls import path
from django.utils import timezone
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView

from aroma.seller_auth import SellerCatalogPermission
from aroma.urls import urlpatterns as app_urls


class TestManagementView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [SellerCatalogPermission]
    seller_permission = "catalog.change_product"

    def patch(self, request):
        return Response(status=204)


urlpatterns = [*app_urls, path("test-management/", TestManagementView.as_view())]


@override_settings(ROOT_URLCONF=__name__, SESSION_COOKIE_SECURE=False, CSRF_COOKIE_SECURE=False)
class SellerSessionTests(TestCase):
    session_url = "/api/v1/seller/session/"
    login_url = "/api/v1/seller/login/"
    logout_url = "/api/v1/seller/logout/"

    @classmethod
    def setUpTestData(cls):
        users = get_user_model().objects
        cls.password = "local-test-password-712"
        cls.seller = users.create_user("seller-test", password=cls.password, is_staff=True)
        cls.seller.user_permissions.add(*Permission.objects.filter(
            content_type__app_label="catalog", codename__in=["view_product", "change_product"]
        ))
        users.create_user("other-staff", password=cls.password, is_staff=True)
        users.create_user("inactive-staff", password=cls.password, is_staff=True, is_active=False)

    def setUp(self):
        self.browser = Client(enforce_csrf_checks=True)
        self.csrf = self.browser.get(self.session_url).json()["csrfToken"]

    def login(self, username="seller-test", password=None, csrf=None):
        return self.browser.post(
            self.login_url, {"username": username, "password": self.password if password is None else password},
            content_type="application/json", HTTP_X_CSRFTOKEN=self.csrf if csrf is None else csrf,
        )

    def test_login_rotates_session_and_csrf_and_logout_invalidates_session(self):
        previous = self.browser.session.session_key
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["role"], "seller")
        self.assertNotEqual(response.json()["csrfToken"], self.csrf)
        current = self.browser.session.session_key
        self.assertNotEqual(current, previous)
        self.assertFalse(Session.objects.filter(session_key=previous).exists())
        self.assertIn(self.browser.session.get_expiry_age(), range(28795, 28801))
        self.assertEqual(self.browser.get(self.session_url).json()["role"], "seller")
        self.assertNotContains(response, current)
        self.assertNotContains(response, self.password)
        self.assertTrue(response.cookies["sessionid"]["httponly"])
        self.assertEqual(response.cookies["sessionid"]["samesite"], "Lax")
        self.assertEqual(self.browser.post(self.logout_url, HTTP_X_CSRFTOKEN=self.csrf).status_code, 403)
        self.assertEqual(self.browser.post(
            self.logout_url, HTTP_X_CSRFTOKEN=response.json()["csrfToken"]
        ).status_code, 204)
        self.assertFalse(Session.objects.filter(session_key=current).exists())
        self.assertIsNone(self.browser.get(self.session_url).json()["role"])

    def test_denied_credentials_are_indistinguishable(self):
        responses = [
            self.login(password="incorrect"),
            self.login("other-staff"),
            self.login("inactive-staff"),
            self.login("unknown"),
        ]
        self.assertEqual({r.status_code for r in responses}, {403})
        self.assertEqual(len({r.content for r in responses}), 1)

    def test_login_requires_csrf_before_a_session_exists(self):
        self.assertEqual(self.login(csrf="").status_code, 403)
        self.assertEqual(self.login(csrf="incorrect").status_code, 403)
        wrong_origin = self.browser.post(
            self.login_url, {"username": "seller-test", "password": self.password},
            content_type="application/json", HTTP_X_CSRFTOKEN=self.csrf,
            HTTP_ORIGIN="https://other.example",
        )
        self.assertEqual(wrong_origin.status_code, 403)
        self.assertIsNone(self.browser.get(self.session_url).json()["role"])

    @override_settings(SESSION_COOKIE_SECURE=True, CSRF_COOKIE_SECURE=True)
    def test_secure_cookie_flags(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)
        for name in ("sessionid", "csrftoken"):
            cookie = response.cookies[name]
            self.assertTrue(cookie["secure"])
            self.assertTrue(cookie["httponly"])
            self.assertEqual(cookie["samesite"], "Lax")
            self.assertEqual(cookie["domain"], "")

    def test_expiry_and_permission_revocation_remove_access(self):
        self.assertEqual(self.login().status_code, 200)
        self.seller.user_permissions.clear()
        self.assertIsNone(self.browser.get(self.session_url).json()["role"])
        Session.objects.filter(session_key=self.browser.session.session_key).update(expire_date=timezone.now())
        self.assertFalse(self.browser.get(self.session_url).json()["authenticated"])

    def test_management_permission_requires_the_operation_grant(self):
        url = "/test-management/"
        self.assertEqual(self.browser.patch(url, HTTP_X_CSRFTOKEN=self.csrf).status_code, 403)
        analyst = get_user_model().objects.get(username="other-staff")
        analyst.user_permissions.add(Permission.objects.get(content_type__app_label="catalog", codename="view_product"))
        self.browser.force_login(analyst)
        self.assertEqual(self.browser.get(self.session_url).json()["role"], "analyst")
        self.assertEqual(self.browser.patch(url, HTTP_X_CSRFTOKEN=self.csrf).status_code, 403)
        token = self.login().json()["csrfToken"]
        self.assertEqual(self.browser.patch(url).status_code, 403)
        self.assertEqual(self.browser.patch(url, HTTP_X_CSRFTOKEN=token).status_code, 204)

    def test_tenth_failure_starts_full_lockout_and_browser_can_restore_it(self):
        from unittest.mock import patch
        from datetime import datetime, timedelta

        start = timezone.now()
        with patch("aroma.seller_auth.timezone.now", return_value=start):
            self.assertEqual(self.login(password="incorrect").status_code, 403)

        tenth = start + timedelta(minutes=6)
        with patch("aroma.seller_auth.timezone.now", return_value=tenth):
            for _ in range(8):
                self.assertEqual(self.login(password="incorrect").status_code, 403)
            response = self.login(password="incorrect")
            self.assertEqual(response.status_code, 429)
            self.assertEqual(response.headers["Retry-After"], "600")
            self.assertEqual(set(response.json()), {"code", "lockout"})
            lockout = response.json()["lockout"]
            self.assertEqual(datetime.fromisoformat(lockout["lockedUntil"]), tenth + timedelta(seconds=600))
            self.assertEqual(datetime.fromisoformat(lockout["serverTime"]), tenth)
            self.assertEqual(self.login().status_code, 429)

        reopened = Client(enforce_csrf_checks=True)
        reopened.cookies["seller_lockout"] = self.browser.cookies["seller_lockout"].value
        with patch("aroma.seller_auth.timezone.now", return_value=tenth + timedelta(minutes=5)):
            status = reopened.get(self.session_url).json()["lockout"]
            self.assertEqual(status["lockedUntil"], lockout["lockedUntil"])
            fresh = Client(enforce_csrf_checks=True)
            session = fresh.get(self.session_url, {"username": "seller-test"}).json()
            self.assertIsNone(session["lockout"])
            blocked = fresh.post(
                self.login_url, {"username": "seller-test", "password": self.password, "lockedUntil": None},
                content_type="application/json", HTTP_X_CSRFTOKEN=session["csrfToken"],
            )
            self.assertEqual(blocked.status_code, 429)
            self.assertEqual(blocked.headers["Retry-After"], "300")
            self.assertEqual(self.login(username="other-staff").status_code, 403)

        with patch("aroma.seller_auth.timezone.now", return_value=tenth + timedelta(seconds=600)):
            self.assertIsNone(reopened.get(self.session_url).json()["lockout"])
            self.assertEqual(self.login().status_code, 200)
