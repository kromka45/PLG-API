from rest_framework import serializers
from .models import PlayerRecord


class PlayerRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerRecord
        fields = ["external_player_id"]  # add other allowed fields here