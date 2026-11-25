from django.urls import include, path

# centraliza as rotas da api sob o prefixo api, delegando os endpoints ao aplicativo core
urlpatterns = [
    path('api/', include('core.urls')),
]