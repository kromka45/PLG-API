import json
import os
import time
from urllib.parse import urlencode, urljoin
from urllib.request import Request, urlopen

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LocalPlayerSerializer
from localapi.models import LocalPlayer


class PlayerCacheAPIView(APIView):
    """
    GET /api/?killer_bi_id=XYZ

    - reads cached payload from SQLite (if fresh)
    - otherwise fetches from EXTERNAL_API_BASE_URL (/players?killer_bi_id=XYZ) and caches into SQLite
    """

    def get(self, request):
        killer_bi_id = request.query_params.get("killer_bi_id")
        if not killer_bi_id:
            return Response({"detail": "killer_bi_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        ttl = int(os.environ.get("CACHE_TTL_SECONDS", "3600"))
        now = int(time.time())

        cached = LocalPlayer.objects.filter(killer_bi_id=killer_bi_id).first()
        if cached and cached.big_payload:
            synced_at_ts = int(cached.synced_at.timestamp())
            if now - synced_at_ts <= ttl:
                return Response(LocalPlayerSerializer(cached).data, status=status.HTTP_200_OK)

        base_url = os.environ.get("EXTERNAL_API_BASE_URL")
        if not base_url:
            return Response({"detail": "EXTERNAL_API_BASE_URL is not set"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        timeout = int(os.environ.get("EXTERNAL_API_TIMEOUT_SECONDS", "5"))

        query = urlencode({"killer_bi_id": killer_bi_id})
        external_url = urljoin(base_url.rstrip("/") + "/", "players") + "?" + query

        try:
            req = Request(external_url, headers={"Accept": "application/json"})
            with urlopen(req, timeout=timeout) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            return Response(
                {"detail": "Failed to fetch from external API", "error": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        obj, _created = LocalPlayer.objects.update_or_create(
            killer_bi_id=killer_bi_id,
            defaults={"big_payload": payload},
        )
        return Response(LocalPlayerSerializer(obj).data, status=status.HTTP_200_OK)