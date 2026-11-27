from rest_framework import generics, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from core.models import Resposta, Topico
from core.tempo_real import emitir_apos_commit
from .serializers import RespostaEscritaSerializer, RespostaLeituraSerializer


# lista as respostas de um topico em ordem cronologica e permite publicar novas respostas
class RespostaListaCriacaoView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    # busca o topico pela chave primaria ou retorna erro 404 caso nao exista
    def obter_topico(self):
        id_topico = self.kwargs['id_topico']
        try:
            return Topico.objects.get(pk=id_topico)
        except Topico.DoesNotExist:
            raise NotFound('Tópico não encontrado.')

    # retorna todas as respostas vinculadas ao topico ordenadas da mais antiga para a mais recente
    def get_queryset(self):
        topico = self.obter_topico()
        return (
            Resposta.objects.select_related('autor')
            .filter(topico=topico)
            .order_by('criado_em', 'id_resposta')
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RespostaEscritaSerializer
        return RespostaLeituraSerializer

    # valida o corpo da mensagem, salva a resposta vinculada ao topico e ao usuario autenticado e retorna os dados criados
    def create(self, request, *args, **kwargs):
        topico = self.obter_topico()
        serializer_entrada = self.get_serializer(data=request.data)
        serializer_entrada.is_valid(raise_exception=True)

        resposta = Resposta.objects.create(
            topico=topico,
            autor=request.user,
            corpo=serializer_entrada.validated_data['corpo'],
        )

        serializer_saida = RespostaLeituraSerializer(
            resposta,
            context={'request': request},
        )
        # envia a resposta para quem esta no topico e o novo total para o contador RESP. do feed (RF15)
        emitir_apos_commit('resposta_criada', {
            'resposta': RespostaLeituraSerializer(resposta).data,
            'total_respostas': Resposta.objects.filter(topico=topico).count(),
        })
        return Response(serializer_saida.data, status=status.HTTP_201_CREATED)


# exclui uma resposta especifica de um topico validando a permissao de autoria
class RespostaExclusaoView(APIView):
    permission_classes = [IsAuthenticated]

    # verifica se o topico e a resposta existem, valida se o usuario autenticado é o autor e remove o registro
    def delete(self, request, id_topico: int, id_resposta: int):
        if not Topico.objects.filter(pk=id_topico).exists():
            raise NotFound('Tópico não encontrado.')

        resposta = Resposta.objects.filter(topico_id=id_topico, pk=id_resposta).first()
        if not resposta:
            raise NotFound('Resposta não encontrada.')

        if resposta.autor_id != request.user.id_usuario:
            raise PermissionDenied('Você não tem permissão para excluir esta resposta.')

        resposta.delete()
        emitir_apos_commit('resposta_excluida', {
            'id_topico': id_topico,
            'id_resposta': id_resposta,
            'total_respostas': Resposta.objects.filter(topico_id=id_topico).count(),
        })
        return Response(status=status.HTTP_204_NO_CONTENT)