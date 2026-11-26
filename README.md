# Clube do Disquete

O **Clube do Disquete** é um fórum de discussão desktop voltado para hardware, tecnologia, montagem de computadores e diagnóstico técnico. A aplicação combina uma identidade visual retrô, inspirada no Reddit clássico e em sistemas operacionais antigos, com janelas internas, abas de contexto e barra de endereço estilo diretório, além de atualizações dinâmicas em tempo real.

## Visão Geral do Sistema

- **Autenticação e Conta:** Cadastro tradicional (e-mail, nome de usuário, senha e aceite obrigatório dos termos de uso) ou acesso via Google, login com sessão JWT e fluxo de recuperação de senha.
- **Feed e Navegação:** Listagem de tópicos com título, categoria, contador de respostas (`RESP.`) e data de criação (`DD/MM`), com suporte a abas internas navegáveis e ordenação por **Recentes** ou **Em Alta**.
- **Categorias Fixas:** Filtragem por `TODAS` (visualização geral) ou pelas seis categorias temáticas do fórum: _Preços e promoções_, _Combos CPU + GPU_, _Montagem e upgrade_, _Conserto e diagnóstico_, _Placas de vídeo_ e _Processadores_.
- **Tópicos e Respostas em Tempo Real:** Criação, leitura, edição e exclusão de tópicos (restritas ao autor, com remoção em cascata das respostas), além de envio e exibição instantânea de respostas via comunicação híbrida entre API REST e Socket.IO.

## Stack Tecnológica

| Camada             | Tecnologia | Papel na Arquitetura                                                                           |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------- |
| **Desktop Shell**  | Electron   | Empacotamento desktop multiplataforma e gerenciamento da janela principal.                     |
| **Frontend**       | Angular    | Interface retrô, rotas, abas internas, formulários reativos, consumo REST e eventos Socket.IO. |
| **Backend**        | Django     | Regras de negócio, autenticação JWT, permissões de autoria, API REST e emissão de eventos.     |
| **Banco de Dados** | PostgreSQL | Persistência relacional de usuários, categorias, tópicos e respostas (`disquete_db`).          |
| **Cache**          | Redis      | Sessões, cache de consultas e mensageria Pub/Sub para o Socket.IO.                             |

## Estrutura do Projeto

```text
clube-do-disquete/
├── apps/
│   └── backend/
│       ├── config/                  # Configurações centrais do Django, DRF, CORS, JWT e e-mail
│       ├── core/                    # Models mapeados (managed = False), autenticação JWT e rotas base
│       ├── usuarios/                # Fluxos de cadastro, login JWT, Google e recuperação de senha
│       ├── .env.example             # Modelo de variáveis de ambiente da API
│       ├── manage.py                # Utilitário CLI do Django
│       └── requirements.txt         # Dependências Python do backend
├── database/
│   ├── 001_create_database.sql      # Criação do banco de dados disquete_db
│   └── 002_create_schema.sql        # Criação das tabelas, chaves, restrições e categorias iniciais
├── docs/
│   ├── auth-usuario.md             # Documentação dos endpoints e fluxos de autenticação
│   ├── database.md                  # Documentação geral da modelagem e funcionamento do banco
│   └── django-setup.md              # Documentação de arquitetura e execução do backend Django
├── .gitignore                       # Regras do Git para ignorar arquivos locais e temporários
└── README.md                        # Visão geral do projeto e estrutura de diretórios
```
