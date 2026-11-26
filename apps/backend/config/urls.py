from django.urls import include, path

# centraliza as rotas da api sob o prefixo api, delegando os endpoints base ao aplicativo core, os fluxos de conta ao aplicativo usuarios e as rotas de categorias e topicos ao aplicativo topicos
urlpatterns = [
    path('api/', include('core.urls')),
    path('api/auth/', include('usuarios.urls')),
    path('api/', include('topicos.urls'))
]