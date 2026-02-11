from django.contrib import admin
from .models import LocalPlayer


@admin.register(LocalPlayer)
class LocalPlayerAdmin(admin.ModelAdmin):
    list_display = ("bohemia_id", "synced_at")
    search_fields = ("bohemia_id",)


