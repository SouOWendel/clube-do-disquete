from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.models import Usuario
from .serializers import (
    CadastroSerializer,
    LoginGoogleSerializer,
    LoginSerializer,
    RecuperarSenhaSerializer,
    RedefinirSenhaSerializer,
    UsuarioPerfilSerializer
)
from .services import (
    decodificar_token_acesso,
    enviar_email_recuperacao,
    gerar_nome_usuario_unico,
    gerar_token_acesso,
    gerar_token_recuperacao,
    revogar_token_acesso,
    validar_token_google,
    validar_token_recuperacao
)


# registra um novo usuario com credenciais locais, salva o hash da senha e retorna o token jwt
@api_view(['POST'])
def cadastro(request):
    serializer = CadastroSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        with transaction.atomic():
            usuario = serializer.save()
    except IntegrityError:
        return Response(
            {'detail': 'E-mail ou nome de usuário já cadastrado.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    token = gerar_token_acesso(usuario)
    return Response(
        {
            'token': token,
            'usuario': UsuarioPerfilSerializer(usuario).data,
        },
        status=status.HTTP_201_CREATED
    )


# autentica um usuario existente por email e senha e retorna o token jwt da sessao
@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    senha = serializer.validated_data['senha']

    usuario = Usuario.objects.filter(email__iexact=email).first()
    if not usuario:
        return Response(
            {'detail': 'E-mail ou senha inválidos.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not usuario.hash_senha:
        return Response(
            {'detail': 'Esta conta utiliza acesso via Google. Entre com o Google ou redefina sua senha.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not check_password(senha, usuario.hash_senha):
        return Response(
            {'detail': 'E-mail ou senha inválidos.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    token = gerar_token_acesso(usuario)
    return Response(
        {
            'token': token,
            'usuario': UsuarioPerfilSerializer(usuario).data
        },
        status=status.HTTP_200_OK
    )


# autentica ou cria uma conta utilizando o token de identidade do Google
@api_view(['POST'])
def login_google(request):
    serializer = LoginGoogleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        dados_google = validar_token_google(serializer.validated_data['token_google'])
    except ValueError as exc:
        return Response(
            {'detail': str(exc)},
            status=status.HTTP_401_UNAUTHORIZED
        )

    google_sub = dados_google['sub']
    email = dados_google['email']

    usuario = Usuario.objects.filter(identificador_google=google_sub).first()
    if usuario:
        token = gerar_token_acesso(usuario)
        return Response(
            {
                'token': token,
                'usuario': UsuarioPerfilSerializer(usuario).data
            },
            status=status.HTTP_200_OK
        )

    usuario_por_email = Usuario.objects.filter(email__iexact=email).first()
    if usuario_por_email:
        usuario_por_email.identificador_google = google_sub
        usuario_por_email.save(update_fields=['identificador_google'])
        token = gerar_token_acesso(usuario_por_email)
        return Response(
            {
                'token': token,
                'usuario': UsuarioPerfilSerializer(usuario_por_email).data
            },
            status=status.HTTP_200_OK
        )

    if not serializer.validated_data.get('termos_aceitos'):
        return Response(
            {
                'detail': 'O aceite dos termos de uso é obrigatório para concluir o primeiro acesso com Google.',
                'requer_aceite_termos': True
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    nome_usuario = serializer.validated_data.get('nome_usuario') or gerar_nome_usuario_unico(
        dados_google['nome'],
        email
    )

    try:
        with transaction.atomic():
            novo_usuario = Usuario.objects.create(
                email=email,
                nome_usuario=nome_usuario,
                identificador_google=google_sub,
                termos_aceitos=True
            )
    except IntegrityError:
        return Response(
            {'detail': 'Não foi possível concluir o cadastro com Google. Tente novamente.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    token = gerar_token_acesso(novo_usuario)
    return Response(
        {
            'token': token,
            'usuario': UsuarioPerfilSerializer(novo_usuario).data,
        },
        status=status.HTTP_201_CREATED
    )


# inicia o fluxo de recuperacao de senha enviando um token temporario por email sem expor se a conta existe
@api_view(['POST'])
def recuperar_senha(request):
    serializer = RecuperarSenhaSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data['email']
    usuario = Usuario.objects.filter(email__iexact=email).first()

    resposta = {
        'detail': 'Se o e-mail estiver cadastrado, enviaremos as instruções para redefinição de senha.'
    }

    if usuario:
        token_recuperacao = gerar_token_recuperacao(usuario)
        enviar_email_recuperacao(usuario, token_recuperacao)
        if settings.DEBUG:
            resposta['token_recuperacao'] = token_recuperacao

    return Response(resposta, status=status.HTTP_200_OK)


# conclui a redefinicao de senha apos validar o token temporario de recuperacao
@api_view(['POST'])
def redefinir_senha(request):
    serializer = RedefinirSenhaSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        usuario = validar_token_recuperacao(serializer.validated_data['token'])
    except ValueError as exc:
        return Response(
            {'detail': str(exc)},
            status=status.HTTP_400_BAD_REQUEST
        )

    usuario.hash_senha = make_password(serializer.validated_data['nova_senha'])
    usuario.save(update_fields=['hash_senha'])

    return Response(
        {'detail': 'Senha redefinida com sucesso.'},
        status=status.HTTP_200_OK
    )


# retorna os dados do usuario atualmente autenticado pelo token jwt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_atual(request):
    return Response(
        UsuarioPerfilSerializer(request.user).data,
        status=status.HTTP_200_OK
    )


# encerra a sessao revogando o token jwt usado na requisicao ate a sua expiracao natural
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    revogar_token_acesso(request.auth, decodificar_token_acesso(request.auth))
    return Response(
        {'detail': 'Sessão encerrada com sucesso.'},
        status=status.HTTP_200_OK
    )