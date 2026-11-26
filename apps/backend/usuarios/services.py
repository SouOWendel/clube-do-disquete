import hashlib
import re
from datetime import datetime, timedelta, timezone
import jwt
from django.conf import settings
from django.core.mail import send_mail
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from core.models import Usuario


# gera um token jwt de acesso com os dados basicos e o prazo de expiracao do usuario autenticado
def gerar_token_acesso(usuario: Usuario) -> str:
    agora = datetime.now(timezone.utc)
    expiracao = agora + timedelta(minutes=settings.JWT_ACCESS_EXPIRES_MINUTES)
    payload = {
        'sub': str(usuario.id_usuario),
        'email': usuario.email,
        'nome_usuario': usuario.nome_usuario,
        'tipo': 'acesso',
        'iat': agora,
        'exp': expiracao
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# decodifica e valida a assinatura, a expiracao e o tipo do token jwt de acesso
def decodificar_token_acesso(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError as exc:
        raise ValueError('Token de acesso expirado.') from exc
    except jwt.InvalidTokenError as exc:
        raise ValueError('Token de acesso invalido.') from exc

    if payload.get('tipo') != 'acesso':
        raise ValueError('Tipo de token invalido para autenticacao.')

    return payload


# gera uma impressao curta do hash da senha atual para invalidar automaticamente o token de recuperacao apos o uso
def gerar_impressao_senha(hash_senha: str | None) -> str:
    base = (hash_senha or 'sem-senha').encode('utf-8')
    return hashlib.sha256(base).hexdigest()[:16]


# gera um token jwt temporario destinado exclusivamente ao fluxo de redefinicao de senha
def gerar_token_recuperacao(usuario: Usuario) -> str:
    agora = datetime.now(timezone.utc)
    expiracao = agora + timedelta(minutes=settings.JWT_RESET_EXPIRES_MINUTES)
    payload = {
        'sub': str(usuario.id_usuario),
        'tipo': 'recuperacao_senha',
        'senha_fp': gerar_impressao_senha(usuario.hash_senha),
        'iat': agora,
        'exp': expiracao
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


# valida o token de recuperacao e confere se a senha do usuario ainda nao foi alterada desde a emissao
def validar_token_recuperacao(token: str) -> Usuario:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError as exc:
        raise ValueError('Token de recuperacao expirado.') from exc
    except jwt.InvalidTokenError as exc:
        raise ValueError('Token de recuperacao invalido.') from exc

    if payload.get('tipo') != 'recuperacao_senha':
        raise ValueError('Tipo de token invalido para recuperacao de senha.')

    usuario = Usuario.objects.filter(id_usuario=payload.get('sub')).first()
    if not usuario:
        raise ValueError('Token de recuperacao invalido.')

    if payload.get('senha_fp') != gerar_impressao_senha(usuario.hash_senha):
        raise ValueError('Este token de recuperacao ja foi utilizado ou invalidado.')

    return usuario


# envia por email o link com o token temporario para o usuario cadastrar uma nova senha
def enviar_email_recuperacao(usuario: Usuario, token_recuperacao: str) -> None:
    link_redefinicao = f'{settings.FRONTEND_RESET_PASSWORD_URL}?token={token_recuperacao}'
    assunto = 'Clube do Disquete - Recuperacao de senha'
    mensagem = (
        f'Ola, {usuario.nome_usuario}!\n\n'
        'Recebemos uma solicitacao para redefinir a senha da sua conta no Clube do Disquete.\n'
        f'Acesse o link abaixo para cadastrar uma nova senha (valido por {settings.JWT_RESET_EXPIRES_MINUTES} minutos):\n\n'
        f'{link_redefinicao}\n\n'
        'Se você nao solicitou essa alteracao, ignore este e-mail.'
    )
    send_mail(
        subject=assunto,
        message=mensagem,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[usuario.email],
        fail_silently=False
    )


# valida o token de identidade emitido pelo Google e extrai os dados verificados da conta
def validar_token_google(token_google: str) -> dict:
    if not settings.GOOGLE_CLIENT_ID:
        raise ValueError('Integracao com Google nao configurada no servidor.')

    try:
        info = google_id_token.verify_oauth2_token(
            token_google,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception as exc:
        raise ValueError('Token do Google invalido ou expirado.') from exc

    if info.get('iss') not in ('accounts.google.com', 'https://accounts.google.com'):
        raise ValueError('Emissor do token do Google invalido.')

    if not info.get('email') or not info.get('email_verified'):
        raise ValueError('A conta Google nao possui um e-mail verificado.')

    return {
        'sub': info['sub'],
        'email': info['email'].strip().lower(),
        'nome': (info.get('name') or '').strip()
    }


# gera um nome de usuario valido e unico a partir do nome ou email da conta Google
def gerar_nome_usuario_unico(nome_base: str, email: str) -> str:
    origem = nome_base or email.split('@', 1)[0]
    limpo = re.sub(r'[^a-zA-Z0-9_.-]', '', origem.replace(' ', '_')).lower()
    if len(limpo) < 3:
        limpo = f'usuario_{limpo}' if limpo else 'usuario_disquete'

    prefixo = limpo[:24]
    candidato = prefixo
    contador = 1

    while Usuario.objects.filter(nome_usuario__iexact=candidato).exists():
        candidato = f'{prefixo}_{contador}'
        contador += 1

    return candidato