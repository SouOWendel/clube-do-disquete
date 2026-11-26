from rest_framework import serializers
from core.models import Resposta, Usuario


# formata os dados basicos do autor exibidos junto a cada resposta do topico
class AutorRespostaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'nome_usuario']


# serializa os dados de leitura de uma resposta vinculada a um topico
class RespostaLeituraSerializer(serializers.ModelSerializer):
    autor = AutorRespostaSerializer(read_only=True)
    id_topico = serializers.IntegerField(source='topico_id', read_only=True)
    autoria = serializers.SerializerMethodField()

    class Meta:
        model = Resposta
        fields = [
            'id_resposta',
            'id_topico',
            'corpo',
            'autor',
            'criado_em',
            'autoria'
        ]

    # indica se o usuario autenticado é o autor da resposta
    def get_autoria(self, obj):
        request = self.context.get('request')
        if not request or not getattr(request, 'user', None):
            return False
        return obj.autor_id == request.user.id_usuario


# valida os dados de entrada para criacao de uma nova resposta conforme a especificacao
class RespostaEscritaSerializer(serializers.Serializer):
    corpo = serializers.CharField(
        required=True,
        allow_blank=True,
        trim_whitespace=False
    )

    # remove espacos nas extremidades e garante que o texto nao esteja vazio nem ultrapasse 10000 caracteres
    def validate_corpo(self, value):
        texto = value.strip()
        if not texto:
            raise serializers.ValidationError('A resposta não pode estar vazia.')
        if len(texto) > 10000:
            raise serializers.ValidationError('A resposta deve ter no máximo 10.000 caracteres.')
        return texto