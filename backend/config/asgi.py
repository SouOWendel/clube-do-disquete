import os
import socketio
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# carrega o django antes de importar modulos que usam models e settings
aplicacao_django = get_asgi_application()

from core.tempo_real import sio  # noqa: E402

# atende o socket.io em /socket.io/ e repassa o resto (api rest) para o django
application = socketio.ASGIApp(sio, other_asgi_app=aplicacao_django)
