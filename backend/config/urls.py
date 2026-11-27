from django.urls import include, path

# centraliza o roteamento da api rest sob o prefixo api delegando cada dominio ao seu aplicativo
urlpatterns = [
    path('api/', include('core.urls')),
    path('api/auth/', include('usuarios.urls')),
    path('api/', include('topicos.urls')),
    path('api/', include('respostas.urls'))
]