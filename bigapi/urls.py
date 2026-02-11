from rest_framework.routers import DefaultRouter
from .views import PlayerSyncViewSet

router = DefaultRouter()
router.register(r"players", PlayerSyncViewSet, basename="players")

urlpatterns = router.urls