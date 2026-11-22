import os
from pathlib import Path
from dotenv import load_dotenv

# carrega as variaveis do arquivo .env localizado na raiz do backend
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

# define a chave secreta, o modo de depuracao e os hosts autorizados do Django
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-dev-key')
DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() == 'true'
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
    if host.strip()
]

# mantem apenas os aplicativos essenciais para a api sem estado, evitando a criacao de tabelas internas do Django no banco
INSTALLED_APPS = [
    'corsheaders',
    'rest_framework',
    'core',
]

# registra os middlewares de seguranca, cors e processamento comum das requisicoes
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = []

# configura a conexao com o banco PostgreSQL disquete_db criado via scripts sql
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'disquete_db'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# define o idioma e o fuso horario padrao da aplicacao
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# libera o acesso entre origens para o cliente desktop em Angular e Electron
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:4200').split(',')
    if origin.strip()
]
CORS_ALLOW_ALL_ORIGINS = DEBUG

# configura a api rest para operar exclusivamente com json e sem autenticacao por sessao
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'UNAUTHENTICATED_USER': None,
}

# define os parametros usados na geracao e validacao dos tokens jwt conforme a especificacao
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
JWT_ALGORITHM = 'HS256'
JWT_ACCESS_EXPIRES_MINUTES = int(os.getenv('JWT_ACCESS_EXPIRES_MINUTES', '1440'))