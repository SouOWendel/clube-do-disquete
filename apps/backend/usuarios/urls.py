from django.urls import path
from .views import (
    cadastro,
    login,
    login_google,
    logout,
    perfil_atual,
    recuperar_senha,
    redefinir_senha,
)

# registra as rotas de cadastro, login, acesso Google, recuperacao de senha e sessao do usuario
urlpatterns = [
    path('cadastro/', cadastro, name='auth-cadastro'),
    path('login/', login, name='auth-login'),
    path('google/', login_google, name='auth-google'),
    path('recuperar-senha/', recuperar_senha, name='auth-recuperar-senha'),
    path('redefinir-senha/', redefinir_senha, name='auth-redefinir-senha'),
    path('me/', perfil_atual, name='auth-perfil-atual'),
    path('logout/', logout, name='auth-logout')
]