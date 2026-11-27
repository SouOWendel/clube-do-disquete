from django.db import models


# mapeia a tabela Usuario sem gerenciar sua estrutura (sem migrations), refletindo os campos de credencial local, acesso via Google e aceite obrigatorio dos termos
class Usuario(models.Model):
    id_usuario = models.BigAutoField(primary_key=True)
    email = models.CharField(max_length=255, unique=True)
    nome_usuario = models.CharField(max_length=150, unique=True)
    hash_senha = models.TextField(null=True, blank=True)
    identificador_google = models.CharField(max_length=255, unique=True, null=True, blank=True)
    termos_aceitos = models.BooleanField()
    criado_em = models.DateTimeField(auto_now_add=True)

    # retorna verdadeiro para permitir que as permissoes nativas do drf reconhecam o usuario autenticado via jwt
    @property
    def is_authenticated(self):
        return True

    # retorna falso pois esta instancia representa um usuario autenticado na base
    @property
    def is_anonymous(self):
        return False

    class Meta:
        managed = False
        db_table = 'usuarios'


# mapeia a tabela categorias sem gerenciar sua estrutura, representando as seis categorias fixas definidas na especificacao
class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    codigo = models.CharField(max_length=50, unique=True)
    nome = models.CharField(max_length=100, unique=True)

    class Meta:
        managed = False
        db_table = 'categorias'


# mapeia a tabela topicos com vinculo obrigatorio de autor e categoria e limite maximo de 140 caracteres no titulo conforme a especificacao
class Topico(models.Model):
    id_topico = models.BigAutoField(primary_key=True)
    autor = models.ForeignKey(
        Usuario,
        on_delete=models.RESTRICT,
        db_column='id_autor',
        related_name='topicos'
    )
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.RESTRICT,
        db_column='id_categoria',
        related_name='topicos'
    )
    titulo = models.CharField(max_length=140)
    corpo = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'topicos'


# mapeia a tabela respostas vinculada a um topico (com exclusao em cascata) e a um autor, respeitando o limite maximo de 10000 caracteres
class Resposta(models.Model):
    id_resposta = models.BigAutoField(primary_key=True)
    topico = models.ForeignKey(
        Topico,
        on_delete=models.CASCADE,
        db_column='id_topico',
        related_name='respostas'
    )
    autor = models.ForeignKey(
        Usuario,
        on_delete=models.RESTRICT,
        db_column='id_autor',
        related_name='respostas'
    )
    corpo = models.CharField(max_length=10000)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'respostas'