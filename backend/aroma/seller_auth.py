import json
from datetime import timedelta
from ipaddress import ip_address
from math import ceil

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.http import HttpResponse, JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.crypto import salted_hmac
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET, require_POST
from rest_framework.permissions import BasePermission

from catalog.models import SellerLoginAttempt


WINDOW = timedelta(minutes=15)
ACCOUNT_LOCKOUT = timedelta(minutes=10)
ACCOUNT_LIMIT = 10
SOURCE_LIMIT = 50
LOCKOUT_COOKIE = "seller_lockout"


def seller_role(user):
    if not user or not user.is_authenticated or not user.is_active or not user.is_staff:
        return None
    if not user.has_perm("catalog.view_product"):
        return None
    return "seller" if user.has_perm("catalog.change_product") else "analyst"


class SellerCatalogPermission(BasePermission):
    """Require staff access and the permission declared by the catalog operation."""

    def has_permission(self, request, view):
        required = getattr(view, "seller_permission", None)
        return bool(required and seller_role(request.user) and request.user.has_perm(required))


def session_data(request):
    authenticated = request.user.is_authenticated
    return {
        "authenticated": authenticated,
        "role": seller_role(request.user),
        "csrfToken": get_token(request),
        "expiresAt": request.session.get_expiry_date().isoformat() if authenticated else None,
    }


def csrf_failure(request, reason=""):
    response = JsonResponse({"code": "csrf_failed"}, status=403)
    response["Cache-Control"] = "no-store"
    return response


def client_source(request):
    peer = request.META.get("REMOTE_ADDR", "")
    source = request.META.get("HTTP_X_REAL_IP", "") if peer in settings.SELLER_TRUSTED_PROXIES else peer
    try:
        return str(ip_address(source))
    except ValueError:
        return peer


def attempt_key(identity):
    return salted_hmac("aroma.seller.login", identity, algorithm="sha256").hexdigest()


def lockout_data(until, now):
    return {"lockedUntil": until.isoformat(), "serverTime": now.isoformat()}


@transaction.atomic
def check_credentials(request, username, password):
    attempts = []
    # Lock the source first so a throttled source cannot create more account rows.
    for identity, limit in (
        (f"source:{client_source(request)}", SOURCE_LIMIT),
        (f"account:{username.casefold()}", ACCOUNT_LIMIT),
    ):
        key = attempt_key(identity)
        bucket, _ = SellerLoginAttempt.objects.select_for_update().get_or_create(
            key=key, defaults={"expires_at": timezone.now() + WINDOW}
        )
        now = timezone.now()
        if bucket.expires_at > now and bucket.failures >= limit:
            return None, bucket.expires_at, key if limit == ACCOUNT_LIMIT else None
        attempts.append((bucket, limit))

    user = authenticate(request, username=username, password=password)
    if seller_role(user):
        return user, None, None

    now = timezone.now()
    locks = []
    account_key = None
    for bucket, limit in attempts:
        if bucket.expires_at <= now or bucket.failures == 0:
            bucket.failures = 0
            bucket.expires_at = now + WINDOW
        bucket.failures += 1
        if bucket.failures >= limit:
            if limit == ACCOUNT_LIMIT:
                bucket.expires_at = now + ACCOUNT_LOCKOUT
                account_key = bucket.key
            locks.append(bucket.expires_at)
        bucket.save(update_fields=["failures", "expires_at"])
    return None, max(locks, default=None), account_key


@never_cache
@require_GET
def seller_session(request):
    data = session_data(request)
    now = timezone.now()
    until = None
    if not data["role"]:
        account_key = request.get_signed_cookie(LOCKOUT_COOKIE, default=None, max_age=int(WINDOW.total_seconds()))
        source_key = attempt_key(f"source:{client_source(request)}")
        source = SellerLoginAttempt.objects.filter(key=source_key, failures__gte=SOURCE_LIMIT, expires_at__gt=now).first()
        account = SellerLoginAttempt.objects.filter(key=account_key, failures__gte=ACCOUNT_LIMIT, expires_at__gt=now).first() if account_key else None
        until = max((bucket.expires_at for bucket in (source, account) if bucket), default=None)
    data["lockout"] = lockout_data(until, now) if until else None
    return JsonResponse(data)


@never_cache
@require_POST
@csrf_protect
def seller_login(request):
    try:
        data = json.loads(request.body)
    except (ValueError, UnicodeError):
        data = None
    username = data.get("username") if isinstance(data, dict) else None
    password = data.get("password") if isinstance(data, dict) else None
    if not isinstance(username, str) or not isinstance(password, str):
        return JsonResponse({"code": "invalid_credentials"}, status=403)
    username = username.strip()
    if not (1 <= len(username) <= 150 and 1 <= len(password) <= 4096):
        return JsonResponse({"code": "invalid_credentials"}, status=403)

    user, until, account_key = check_credentials(request, username, password)
    if until:
        now = timezone.now()
        response = JsonResponse({"code": "login_throttled", "lockout": lockout_data(until, now)}, status=429)
        response["Retry-After"] = str(max(0, ceil((until - now).total_seconds())))
        if account_key:
            response.set_signed_cookie(
                LOCKOUT_COOKIE, account_key, max_age=int(WINDOW.total_seconds()),
                secure=settings.SESSION_COOKIE_SECURE, httponly=True, samesite="Lax",
            )
        return response
    if user is None:
        return JsonResponse({"code": "invalid_credentials"}, status=403)
    # Flush any previous identity, including an existing session for this same account.
    logout(request)
    login(request, user)
    request.session.set_expiry(timezone.now() + timedelta(seconds=settings.SESSION_COOKIE_AGE))
    response = JsonResponse(session_data(request))
    response.delete_cookie(LOCKOUT_COOKIE, samesite="Lax")
    return response


@never_cache
@require_POST
@csrf_protect
def seller_logout(request):
    logout(request)
    return HttpResponse(status=204)
