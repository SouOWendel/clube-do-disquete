from rest_framework import serializers
from core.models import Categoria, Topico, Usuario


# serializa os dados de identificacao de uma categoria fixa do forum
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = [
            'id_categoria',
            'codigo',
            'nome'
        ]


# serializa os dados resumidos do autor de um topico sem expor informacoes sensiveis
class AutorResumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id_usuario',
            'nome_usuario'
        ]


# serializa os itens do feed de topicos com categoria, autor, contador de respostas e indicador de autoria
class TopicoListaSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    autor = AutorResumoSerializer(read_only=True)
    total_respostas = serializers.IntegerField(read_only=True, default=0)
    autoria = serializers.SerializerMethodField()

    class Meta:
        model = Topico
        fields = [
            'id_topico',
            'titulo',
            'categoria',
            'autor',
            'total_respostas',
            'criado_em',
            'atualizado_em',
            'autoria'
        ]

    def get_autoria(self, obj: Topico) -> bool:
        request = self.context.get('request')
        usuario = getattr(request, 'user', None)
        if not usuario:
            return False
        return obj.autor_id == usuario.id_usuario


# serializa os dados completos de um topico na tela de detalhes incluindo o texto descritivo
class TopicoDetalheSerializer(TopicoListaSerializer):
    class Meta(TopicoListaSerializer.Meta):
        fields = [
            'id_topico',
            'titulo',
            'corpo',
            'categoria',
            'autor',
            'total_respostas',
            'criado_em',
            'atualizado_em',
            'autoria'
        ]


# valida os dados de criacao e edicao de topicos aplicando limites de caracteres e categoria obrigatoria
class TopicoEscritaSerializer(serializers.Serializer):
    categoria = serializers.CharField()
    titulo = serializers.CharField()
    corpo = serializers.CharField()

    # valida a categoria por codigo ou identificador e impede o uso da opcao todas na gravacao
    def validate_categoria(self, value: str) -> Categoria:
        valor_limpo = str(value).strip()
        if not valor_limpo:
            raise serializers.ValidationError('A categoria é obrigatória.')
        if valor_limpo.lower() == 'todas':
            raise serializers.ValidationError(
                'A opção TODAS é exclusiva para filtragem e não pode ser vinculada a um tópico.'
            )
        if valor_limpo.isdigit():
            categoria = Categoria.objects.filter(id_categoria=int(valor_limpo)).first()
        else:
            categoria = Categoria.objects.filter(codigo__iexact=valor_limpo).first()
        if not categoria:
            raise serializers.ValidationError('Categoria inválida ou não encontrada.')
        return categoria

    # garante que o titulo tenha entre 8 e 140 caracteres apos remover espacos nas extremidades
    def validate_titulo(self, value: str) -> str:
        titulo_limpo = value.strip()
        if len(titulo_limpo) < 8:
            raise serializers.ValidationError('O assunto do tópico deve ter no mínimo 8 caracteres.')
        if len(titulo_limpo) > 140:
            raise serializers.ValidationError('O assunto do tópico deve ter no máximo 140 caracteres.')
        return titulo_limpo

    # garante que o corpo do topico tenha no minimo 20 caracteres apos remover espacos nas extremidades
    def validate_corpo(self, value: str) -> str:
        corpo_limpo = value.strip()
        if len(corpo_limpo) < 20:
            raise serializers.ValidationError(
                'A descrição do tópico deve ter no mínimo 20 caracteres.'
            )
        return corpo_limpo

    def create(self, validated_data: dict) -> Topico:
        return Topico.objects.create(
            autor=validated_data['autor'],
            categoria=validated_data['categoria'],
            titulo=validated_data['titulo'],
            corpo=validated_data['corpo']
        )

    def update(self, instance: Topico, validated_data: dict) -> Topico:
        instance.categoria = validated_data.get('categoria', instance.categoria)
        instance.titulo = validated_data.get('titulo', instance.titulo)
        instance.corpo = validated_data.get('corpo', instance.corpo)
        instance.save()
        return instance