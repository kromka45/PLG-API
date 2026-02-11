from django.db import models


class PlayerRecord(models.Model):
    id = models.BigAutoField(primary_key=True)

    bohemia_id = models.CharField(max_length=64, db_index=True)

    class Meta:
        managed = False
        db_table = "player_records"