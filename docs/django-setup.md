# Setup e Arquitetura do Backend (Django)

O backend do **Clube do Disquete** é uma API REST _stateless_ desenvolvida em **Django** com **Django REST Framework (DRF)**, conectada ao banco PostgreSQL `disquete_db`.

## Decisões de Arquitetura

- **Abordagem _Database-First_ (`managed = False`):** Como a estrutura das tabelas é controlada manualmente pelos scripts da pasta `database/`, todos os models do Django possuem `managed = False`. O ORM executa apenas operações de manipulação de dados (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) e não gera nem aplica migrations.
- **Apps Nativos Enxutos:** Os módulos padrão de sessão, painel administrativo e autenticação baseada em cookies (`django.contrib.admin`, `django.contrib.auth`, `django.contrib.sessions`, `django.contrib.messages`) foram removidos do `INSTALLED_APPS`. Isso evita a criação de tabelas internas do framework dentro do `disquete_db` e mantém a API totalmente orientada a tokens JWT.
- **CORS:** Configurado via `django-cors-headers` para permitir requisições originadas do cliente desktop (Angular + Electron).

## Mapeamento dos Models (`core/models.py`)

| Model       | Tabela no PostgreSQL | Observações                                                                                                        |
| ----------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Usuario`   | `usuarios`           | Mapeia credenciais locais (`hash_senha`) e sociais (`identificador_google`), além de `termos_aceitos`.             |
| `Categoria` | `categorias`         | Mapeia as seis categorias temáticas fixas do fórum.                                                                |
| `Topico`    | `topicos`            | Relaciona autor e categoria (`ON DELETE RESTRICT`) e atualiza `atualizado_em` automaticamente via `auto_now=True`. |
| `Resposta`  | `respostas`          | Relaciona tópico (`ON DELETE CASCADE`) e autor (`ON DELETE RESTRICT`), respeitando o limite de 10.000 caracteres.  |

## Como Executar Localmente

1. Certifique-se de que o banco `disquete_db` já foi criado e populado com os scripts da pasta `database/`.
2. Acesse a pasta `backend/`, crie e ative um ambiente virtual:
   ```bash
   cd backend
   python -m venv .venv
   # Linux/macOS:
   source .venv/bin/activate
   # Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Crie o arquivo `.env` a partir de `.env.example`, gere chaves aleatórias para `DJANGO_SECRET_KEY` e `JWT_SECRET_KEY` e ajuste as credenciais do PostgreSQL:
   ```bash
   cp .env.example .env
   ```
5. Inicie o servidor de desenvolvimento (não é necessário rodar `migrate`):
   ```bash
   python manage.py runserver
   ```

## Como Testar e Resultado Esperado

Com o servidor em execução (`http://127.0.0.1:8000`), faça uma requisição `GET` para o endpoint de _healthcheck_ diretamente pelo navegador ou via terminal:

```bash
curl -i [http://127.0.0.1:8000/api/health/](http://127.0.0.1:8000/api/health/)
```

### Resultado Esperado (Sucesso)

A API deve responder com status **HTTP `200 OK`** e o seguinte corpo JSON, confirmando que o Django está ativo, conectado ao `disquete_db` e lendo as seis categorias iniciais cadastradas:

```json
{
  "status": "ok",
  "database": "connected",
  "categorias_carregadas": 6
}
```

### Cenário de Falha de Conexão

Caso o serviço do PostgreSQL esteja parado ou alguma credencial no `.env` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` ou `DB_PORT`) esteja incorreta, o endpoint retornará status **HTTP `503 Service Unavailable`** com o motivo da falha:

```json
{
  "status": "error",
  "database": "disconnected",
  "detail": "mensagem de erro retornada pelo PostgreSQL"
}
```
