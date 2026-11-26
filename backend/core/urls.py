from django.urls import path
from .views import healthcheck

# registra as rotas iniciais do aplicativo core, incluindo a verificacao de disponibilidade da api
urlpatterns = [
    path('health/', healthcheck, name='healthcheck'),
]