import os
import sys


# ponto de entrada utilitario do Django para executar tarefas administrativas da aplicacao, como iniciar o servidor local
def main():
    # define o modulo de configuracoes padrao do projeto e repassa os argumentos do terminal para a execucao dos comandos do Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()