
from django.urls import re_path
from channels.routing import URLRouter
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/$', consumers.StartConsumer.as_asgi()),
    re_path(r'ws/golden_chest/(?P<game_id>\d+)/$', consumers.GameConsumer.as_asgi()),
]

# application = URLRouter(websocket_urlpatterns)
