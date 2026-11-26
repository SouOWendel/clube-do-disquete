from django.db import DatabaseError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Categoria


# verifica se a api esta ativa e se a conexao com o banco PostgreSQL esta funcionando corretamente
@api_view(['GET'])
def healthcheck(request):
    try:
        total_categorias = Categoria.objects.count()
        return Response(
            {
                'status': 'ok',
                'database': 'connected',
                'categorias_carregadas': total_categorias,
            },
            status=status.HTTP_200_OK,
        )
    except DatabaseError as exc:
        return Response(
            {
                'status': 'error',
                'database': 'disconnected',
                'detail': str(exc),
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )