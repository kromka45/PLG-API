from rest_framework.routers import DefaultRouter
from .views import PlayerRecordViewSet

router = DefaultRouter()
router.register(r"players", PlayerRecordViewSet, basename="players")

urlpatterns = router.urls