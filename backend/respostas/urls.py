from django.urls import path
from .views import RespostaExclusaoView, RespostaListaCriacaoView

# define as rotas para listar, criar e excluir respostas dentro de um topico especifico
urlpatterns = [
    path(
        'topicos/<int:id_topico>/respostas/',
        RespostaListaCriacaoView.as_view(),
        name='topico-respostas'
    ),
    path(
        'topicos/<int:id_topico>/respostas/<int:id_resposta>/',
        RespostaExclusaoView.as_view(),
        name='topico-resposta-detalhe'
    )
]