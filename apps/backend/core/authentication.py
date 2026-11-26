from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from core.models import Usuario
from usuarios.services import decodificar_token_acesso


# extrai e valida o token bearer jwt do cabecalho authorization para identificar o usuario da requisicao
class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        cabecalho_auth = request.headers.get('Authorization', '').strip()

        # ignora requisicoes sem cabecalho authorization para permitir o acesso a rotas publicas
        if not cabecalho_auth:
            return None

        if not cabecalho_auth.startswith('Bearer '):
            raise AuthenticationFailed('Formato de autorização inválido. Utilize Bearer <token>.')

        token = cabecalho_auth.split(' ', 1)[1].strip()
        if not token:
            raise AuthenticationFailed('Token de autenticação não informado.')

        try:
            payload = decodificar_token_acesso(token)
        except ValueError as exc:
            raise AuthenticationFailed(str(exc)) from exc

        id_usuario = payload.get('sub')
        usuario = Usuario.objects.filter(id_usuario=id_usuario).first()
        if not usuario:
            raise AuthenticationFailed('Usuário associado ao token não foi encontrado.')

        return (usuario, token)

    # retorna o esquema bearer para que o drf responda com status 401 quando a autenticacao falhar
    def authenticate_header(self, request):
        return 'Bearer'