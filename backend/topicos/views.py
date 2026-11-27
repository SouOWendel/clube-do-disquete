from django.db.models import Count, F, Max
from django.db.models.functions import Coalesce
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.models import Categoria, Topico
from core.tempo_real import emitir_apos_commit
from .serializers import (
    CategoriaSerializer,
    TopicoDetalheSerializer,
    TopicoEscritaSerializer,
    TopicoListaSerializer
)


# monta a consulta base de topicos com dados relacionados de autor e categoria, contagem de respostas e data da ultima atividade
def _obter_queryset_topicos():
    return (
        Topico.objects.select_related('autor', 'categoria')
        .annotate(
            total_respostas=Count('respostas'),
            ultima_atividade=Coalesce(Max('respostas__criado_em'), F('criado_em')),
        )
    )


# verifica se o usuario autenticado é o criador do topico antes de permitir edicao ou exclusao
def _usuario_eh_autor(usuario, topico: Topico) -> bool:
    return topico.autor_id == usuario.id_usuario


# lista as seis categorias fixas cadastradas no banco para usuarios autenticados
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def categorias_lista(request):
    categorias = Categoria.objects.all().order_by('id_categoria')
    serializer = CategoriaSerializer(categorias, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# lista os topicos do feed com filtro por categoria e ordenacao ou cria um novo topico autenticado
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def topicos_colecao(request):
    if request.method == 'GET':
        queryset = _obter_queryset_topicos()

        categoria_param = request.query_params.get('categoria', '').strip()
        if categoria_param and categoria_param.lower() != 'todas':
            if categoria_param.isdigit():
                categoria_existe = Categoria.objects.filter(
                    id_categoria=int(categoria_param)
                ).exists()
                queryset = queryset.filter(categoria_id=int(categoria_param))
            else:
                categoria_existe = Categoria.objects.filter(
                    codigo__iexact=categoria_param
                ).exists()
                queryset = queryset.filter(categoria__codigo__iexact=categoria_param)

            if not categoria_existe:
                return Response(
                    {'detail': 'Categoria informada no filtro não foi encontrada.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        ordenar_param = request.query_params.get('ordenar', 'recentes').strip().lower()
        if ordenar_param in ('recentes', ''):
            queryset = queryset.order_by('-criado_em', '-id_topico')
        elif ordenar_param in ('em-alta', 'em_alta'):
            queryset = queryset.order_by('-total_respostas', '-ultima_atividade', '-id_topico')
        else:
            return Response(
                {'detail': 'Critério de ordenação inválido. Use recentes ou em-alta.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TopicoListaSerializer(
            queryset,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = TopicoEscritaSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    topico = serializer.save(autor=request.user)
    topico_completo = _obter_queryset_topicos().get(id_topico=topico.id_topico)
    # sem request no contexto o campo autoria sai falso; cada cliente compara o autor com o proprio usuario
    emitir_apos_commit('topico_criado', {'topico': TopicoListaSerializer(topico_completo).data})

    return Response(
        TopicoDetalheSerializer(topico_completo, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )


# consulta, atualiza ou exclui um topico especifico validando a permissao de autoria na escrita
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def topico_detalhe(request, id_topico: int):
    topico = _obter_queryset_topicos().filter(id_topico=id_topico).first()
    if not topico:
        return Response(
            {'detail': 'Tópico não encontrado.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == 'GET':
        serializer = TopicoDetalheSerializer(topico, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not _usuario_eh_autor(request.user, topico):
        return Response(
            {'detail': 'Você não tem permissão para editar ou excluir este tópico.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if request.method in ('PUT', 'PATCH'):
        serializer = TopicoEscritaSerializer(
            topico,
            data=request.data,
            partial=(request.method == 'PATCH')
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        topico_atualizado = _obter_queryset_topicos().get(id_topico=topico.id_topico)
        emitir_apos_commit(
            'topico_atualizado',
            {'topico': TopicoDetalheSerializer(topico_atualizado).data}
        )
        return Response(
            TopicoDetalheSerializer(topico_atualizado, context={'request': request}).data,
            status=status.HTTP_200_OK
        )

    topico.delete()
    # avisa quem esta com o topico aberto para voltar ao feed (RN06)
    emitir_apos_commit('topico_excluido', {'id_topico': id_topico})
    return Response(status=status.HTTP_204_NO_CONTENT)