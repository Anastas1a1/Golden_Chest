"""
ASGI config for golden_chest_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'golden_chest_backend.settings')
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from consumers import routing


asgi = get_asgi_application()

application = ProtocolTypeRouter({
    "http": asgi,
    "websocket": AuthMiddlewareStack(URLRouter(routing.websocket_urlpatterns)),
})