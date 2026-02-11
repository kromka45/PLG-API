from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.exceptions import ValidationError

from .models import PlayerRecord
from .serializers import PlayerRecordSerializer


class PlayerRecordViewSet(ReadOnlyModelViewSet):
    serializer_class = PlayerRecordSerializer

    def get_queryset(self):
        external_player_id = self.request.query_params.get("external_player_id")
        if not external_player_id:
            raise ValidationError(
                {"external_player_id": "This query parameter is required."}
            )

        # Exact match only:
        return PlayerRecord.objects.filter(external_player_id=external_player_id)