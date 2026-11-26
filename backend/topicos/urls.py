from django.urls import path
from .views import categorias_lista, topico_detalhe, topicos_colecao

# registra as rotas de listagem de categorias, feed e criacao de topicos, e operacoes individuais por identificador
urlpatterns = [
    path('categorias/', categorias_lista, name='categorias-lista'),
    path('topicos/', topicos_colecao, name='topicos-colecao'),
    path('topicos/<int:id_topico>/', topico_detalhe, name='topico-detalhe')
]