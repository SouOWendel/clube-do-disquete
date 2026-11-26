from django.urls import include, path

# centraliza as rotas da api sob o prefixo api
urlpatterns = [
    path('api/', include('core.urls')),
    path('api/auth/', include('usuarios.urls'))
]