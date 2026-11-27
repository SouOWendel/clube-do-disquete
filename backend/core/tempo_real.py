import logging
import socketio
from asgiref.sync import sync_to_async
from django.conf import settings
from django.db import transaction
from core.models import Usuario
from usuarios.services import decodificar_token_acesso, token_acesso_revogado

logger = logging.getLogger(__name__)

# servidor socket.io montado junto do django em config/asgi.py.
# o redis distribui os eventos entre processos: as views do django publicam no redis
# e o servidor (em qualquer instancia) repassa para os clientes conectados (RN08)
sio = socketio.AsyncServer(
    async_mode='asgi',
    client_manager=(
        socketio.AsyncRedisManager(settings.REDIS_URL) if settings.REDIS_URL else None
    ),
    cors_allowed_origins='*' if settings.DEBUG else settings.CORS_ALLOWED_ORIGINS,
)

# emissor usado pelas views sincronas do django; so publica no redis, sem abrir conexoes de clientes
_emissor = (
    socketio.RedisManager(settings.REDIS_URL, write_only=True) if settings.REDIS_URL else None
)


# valida o token jwt do handshake com as mesmas regras da api rest (assinatura, expiracao e logout)
def _usuario_do_token(token: str) -> Usuario | None:
    try:
        payload = decodificar_token_acesso(token)
    except ValueError:
        return None
    if token_acesso_revogado(token):
        return None
    return Usuario.objects.filter(id_usuario=payload.get('sub')).first()


# aceita a conexao apenas com token valido enviado em auth.token, ja que o feed exige sessao (RN02)
@sio.event
async def connect(sid, environ, auth):
    token = (auth or {}).get('token') if isinstance(auth, dict) else None
    usuario = await sync_to_async(_usuario_do_token)(token) if token else None
    if not usuario:
        raise socketio.exceptions.ConnectionRefusedError('nao_autenticado')
    await sio.save_session(sid, {'id_usuario': usuario.id_usuario})


# publica o evento para todos os clientes conectados somente depois que a transacao for confirmada (RN08)
def emitir_apos_commit(evento: str, dados: dict) -> None:
    def _emitir():
        if _emissor is None:
            logger.warning('REDIS_URL vazio: evento %s nao foi enviado em tempo real.', evento)
            return
        try:
            _emissor.emit(evento, dados)
        except Exception:
            # a escrita ja foi confirmada; uma falha no tempo real nao pode desfazer a resposta http
            logger.exception('Falha ao publicar o evento %s no Redis.', evento)

    transaction.on_commit(_emitir)
