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
├── frontend/                        # App desktop: Electron + Angular
│   ├── src/main.ts                  # Processo principal do Electron (janela e carregamento da interface)
│   ├── renderer/                    # Interface em Angular + Tailwind
│   ├── forge.config.mts             # Empacotamento e instaladores (Electron Forge)
│   ├── vite.main.config.mts         # Build do processo principal (Vite)
│   └── package.json                 # Scripts de desenvolvimento, lint e empacotamento
├── backend/
│   ├── config/                      # Configurações centrais do Django, DRF, CORS, JWT e e-mail; asgi.py junta a API e o Socket.IO
│   ├── core/                        # Models mapeados (managed = False), autenticação JWT, rotas base e tempo real (Socket.IO)
│   ├── respostas/                   # Listagem, criação e exclusão de respostas dos tópicos
│   ├── topicos/                     # Listagem de categorias e operações de feed e tópicos
│   ├── usuarios/                    # Fluxos de cadastro, login JWT, Google e recuperação de senha
│   ├── .env.example                 # Modelo de variáveis de ambiente da API
│   ├── manage.py                    # Utilitário CLI do Django
│   └── requirements.txt             # Dependências Python do backend
├── database/
│   ├── 001_create_database.sql      # Criação do banco de dados disquete_db
│   └── 002_create_schema.sql        # Criação das tabelas, chaves, restrições e categorias iniciais
├── docs/
│   ├── auth-usuario.md              # Documentação dos endpoints e fluxos de autenticação
│   ├── categoria-topico.md          # Documentação dos endpoints de categorias, feed e tópicos
│   ├── database.md                  # Documentação geral da modelagem e funcionamento do banco
│   ├── django-setup.md              # Documentação de arquitetura e execução do backend Django
│   └── tempo-real.md                # Socket.IO: arquitetura, autenticação e eventos de tempo real
├── .gitignore                       # Regras do Git para ignorar arquivos locais e temporários
└── README.md                        # Visão geral do projeto e estrutura de diretórios
```

## Como Rodar

### Pré-requisitos

- Docker (com Docker Compose), para o PostgreSQL e o Redis.
- Python 3.10 ou mais recente, para o backend Django.
- Node.js 22 ou 24 (exigência do Angular), para o frontend e o Electron.

### 1. Banco de dados e Redis

Na raiz do projeto:

```bash
docker compose up -d
```

Sobe o PostgreSQL (`disquete_db`, com o schema e as categorias aplicados na primeira vez) na porta 5432 e o Redis na porta 6379. O Redis guarda os tokens revogados no logout e distribui os eventos de tempo real. Sem Docker, execute os scripts de `database/` na ordem (veja [docs/database.md](docs/database.md)) e aponte `REDIS_URL` para um Redis local.

### 2. Backend (API + Socket.IO)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows (PowerShell): .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
```

No `.env`, preencha `DJANGO_SECRET_KEY` e `JWT_SECRET_KEY` com valores aleatórios e use `DB_PASSWORD=postgres` (a senha do `docker-compose.yml`). Para gerar uma chave:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

Depois inicie o servidor (não é preciso rodar `migrate`):

```bash
python manage.py runserver
```

A API e o Socket.IO ficam em `http://127.0.0.1:8000`. Para conferir, `http://127.0.0.1:8000/api/health/` deve responder `{"status": "ok", "database": "connected", "categorias_carregadas": 6}`. Mais detalhes em [docs/django-setup.md](docs/django-setup.md).

### 3. Frontend (desktop)

Em outro terminal:

```bash
cd frontend
npm install   # também instala as dependências do Angular em renderer/
npm start     # sobe o Angular (porta 4200) e abre o Electron
```

Na primeira vez, crie uma conta em **Criar agora**. Os e-mails de recuperação de senha não são enviados de verdade em desenvolvimento: o link aparece no terminal do Django.

> Se você rodar `npm install` com o `npm start` ligado, reinicie o `npm start`. Senão o Vite pode carregar duas cópias do Angular e a tela quebra com o erro `NG0203`.

## Testar com Dois Usuários ao Mesmo Tempo

Cada Electron guarda a sessão (o token de login) na sua pasta de perfil. Duas janelas do mesmo perfil dividem o mesmo login, então para ter dois usuários é preciso abrir um segundo Electron com outra pasta de perfil.

1. Com o backend e o `npm start` rodando (passos 2 e 3), o primeiro Electron já está aberto. Entre com o primeiro usuário.
2. Em outro terminal, abra o segundo Electron com um perfil separado:

   ```bash
   cd frontend
   npx electron . --user-data-dir=/tmp/clube-do-disquete-usuario-2
   ```

   No Windows (PowerShell):

   ```powershell
   cd frontend
   npx electron . --user-data-dir="$env:TEMP\clube-do-disquete-usuario-2"
   ```

   Ele usa o Angular que o `npm start` já subiu na porta 4200, então não é preciso rodar outro `npm start`. Mantenha a mesma pasta para continuar logado nas próximas vezes; para um terceiro usuário, use outra pasta.

3. No segundo Electron, crie outra conta (ou entre com ela).
4. Coloque as duas janelas lado a lado e teste o tempo real (detalhes em [docs/tempo-real.md](docs/tempo-real.md)):
   - **Novo tópico:** publique num Electron; no outro, ele aparece no feed com o selo `NOVO`, sem recarregar.
   - **Respostas:** abra o mesmo tópico nos dois e responda num deles; a resposta entra no outro e o contador `RESPOSTAS (N)` sobe. No feed, o `RESP.` também atualiza.
   - **Edição:** edite o tópico pelo autor; o outro vê o título e o texto novos.
   - **Exclusão:** exclua o tópico pelo autor; quem estava com ele aberto vê "Este tópico foi excluído pelo autor." e volta ao feed.
   - **Permissões:** os botões **EDITAR** e **EXCLUIR** só aparecem para o autor.

Também dá para usar o navegador como segundo usuário, abrindo `http://localhost:4200` (no navegador o login fica no perfil dele, separado do Electron).

## Documentação

- **Autenticação e Usuários:** contratos das rotas de conta e sessão em [docs/auth-usuario.md](docs/auth-usuario.md).
- **Categorias, Feed e Tópicos:** endpoints de categorias, listagem do feed e CRUD de tópicos em [docs/categoria-topico.md](docs/categoria-topico.md).
- **Tempo Real:** eventos Socket.IO de tópicos e respostas em [docs/tempo-real.md](docs/tempo-real.md).
