from django.db import InterfaceError, OperationalError, connection
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    renderer_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
@renderer_classes([JSONRenderer])
def live(request):
    return Response({"status": "ok"})


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
@renderer_classes([JSONRenderer])
def ready(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except (OperationalError, InterfaceError):
        return Response({"status": "unavailable"}, status=503)
    return Response({"status": "ok"})
