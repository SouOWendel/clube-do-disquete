# Clube do Disquete

O **Clube do Disquete** é um fórum de discussão desktop voltado para hardware, tecnologia, montagem de computadores e diagnóstico técnico. A aplicação combina uma identidade visual retrô, inspirada no Reddit clássico e em sistemas operacionais antigos, com janelas internas, abas de contexto e barra de endereço estilo diretório, além de atualizações dinâmicas em tempo real.

## Visão Geral do Sistema

* **Autenticação e Conta:** Cadastro tradicional (e-mail, nome de usuário, senha e aceite obrigatório dos termos de uso) ou acesso via Google, login com sessão JWT e fluxo de recuperação de senha.
* **Feed e Navegação:** Listagem de tópicos com título, categoria, contador de respostas (`RESP.`) e data de criação (`DD/MM`), com suporte a abas internas navegáveis e ordenação por **Recentes** ou **Em Alta**.
* **Categorias Fixas:** Filtragem por `TODAS` (visualização geral) ou pelas seis categorias temáticas do fórum: *Preços e promoções*, *Combos CPU + GPU*, *Montagem e upgrade*, *Conserto e diagnóstico*, *Placas de vídeo* e *Processadores*.
* **Tópicos e Respostas em Tempo Real:** Criação, leitura, edição e exclusão de tópicos (restritas ao autor, com remoção em cascata das respostas), além de envio e exibição instantânea de respostas via comunicação híbrida entre API REST e Socket.IO.

## Stack Tecnológica

| Camada | Tecnologia | Papel na Arquitetura |
|---|---|---|
| **Desktop Shell** | Electron | Empacotamento desktop multiplataforma e gerenciamento da janela principal. |
| **Frontend** | Angular | Interface retrô, rotas, abas internas, formulários reativos, consumo REST e eventos Socket.IO. |
| **Backend** | Django | Regras de negócio, autenticação JWT, permissões de autoria, API REST e emissão de eventos. |
| **Banco de Dados** | PostgreSQL | Persistência relacional de usuários, categorias, tópicos e respostas (`disquete_db`). |
| **Cache** | Redis | Sessões, cache de consultas e mensageria Pub/Sub para o Socket.IO. |

## Estrutura do Projeto

## Estrutura do Projeto

```text
clube-do-disquete/
├── apps/
│   └── backend/
│       ├── config/                  # configuracoes centrais do Django, drf, cors e jwt
│       │   ├── settings.py          # configuracao do banco PostgreSQL, aplicativos, cors e parametros jwt
│       │   └── urls.py              # roteamento principal da api sob o prefixo api
│       ├── core/                    # nucleo de dominio e mapeamento das tabelas do banco
│       │   ├── __init__.py          # marca o diretorio core como pacote Python
│       │   ├── models.py            # mapeamento das tabelas sem geracao de migrations
│       │   ├── urls.py              # registro das rotas do aplicativo core
│       │   └── views.py             # endpoint de verificacao de saude da api e conexao com o banco
│       ├── manage.py                # utilitario administrativo do Django
│       └── requirements.txt         # dependencias Python do backend
├── database/
│   ├── 001_create_database.sql      # criacao do banco de dados disquete_db
│   └── 002_create_schema.sql        # criacao das tabelas, chaves, restricoes e categorias iniciais
├── docs/
│   ├── database.md                  # documentacao geral da modelagem e funcionamento do banco
│   └── django-setup.md              # documentacao de arquitetura e execucao do backend Django
└── README.md                        # visao geral do projeto e estrutura de diretorios
```