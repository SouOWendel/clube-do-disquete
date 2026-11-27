# Tempo Real (Socket.IO)

O feed e a página de tópico se atualizam sozinhos quando alguém cria, edita ou exclui um tópico ou uma resposta (RF09, RF15 e RN06).

## Como Funciona

1. O cliente faz a escrita pela API REST (`POST`, `PUT` ou `DELETE`), como antes.
2. O Django valida, grava no PostgreSQL e, **só depois do commit** (`transaction.on_commit`), publica o evento no Redis (RN08).
3. O servidor Socket.IO lê o evento do Redis e o entrega a todos os clientes conectados.

Nenhuma escrita passa pelo socket: ele só avisa o que mudou.

- **Servidor:** `backend/core/tempo_real.py`, montado junto da API em `backend/config/asgi.py` com o `python-socketio`. O `daphne` em `INSTALLED_APPS` faz o `python manage.py runserver` servir a aplicação ASGI, então o comando de execução não muda.
- **Redis:** `AsyncRedisManager` no servidor e `RedisManager(write_only=True)` nas views. Com isso, vários processos ou instâncias do Django podem emitir e entregar eventos. Sem `REDIS_URL`, os eventos não são enviados (fica um aviso no log).
- **Cliente:** `frontend/renderer/src/app/core/tempo-real/tempo-real.ts` abre a conexão quando há sessão e fecha no logout.

## Autenticação

O cliente envia o JWT no handshake (`io(url, { auth: { token } })`). O servidor aplica as mesmas regras da API: assinatura, expiração e token revogado no logout. Sem token válido, a conexão é recusada com `connect_error` e a mensagem `nao_autenticado`.

## Eventos

Todos os eventos vão para todos os clientes autenticados. Cada tela filtra o que lhe interessa (por exemplo, a página do tópico compara o `id_topico`). O campo `autoria` chega sempre `false`, porque o mesmo dado vai para todos. O cliente compara `autor.id_usuario` com o próprio usuário.

| Evento              | Quando                        | Dados                                         |
| ------------------- | ----------------------------- | --------------------------------------------- |
| `topico_criado`     | `POST /api/topicos/`          | `{ topico }` (mesmo formato do feed)          |
| `topico_atualizado` | `PUT/PATCH /api/topicos/:id/` | `{ topico }` (mesmo formato do detalhe)       |
| `topico_excluido`   | `DELETE /api/topicos/:id/`    | `{ id_topico }`                               |
| `resposta_criada`   | `POST .../respostas/`         | `{ resposta, total_respostas }`               |
| `resposta_excluida` | `DELETE .../respostas/:id/`   | `{ id_topico, id_resposta, total_respostas }` |

## Comportamento na Interface

- **Feed:** qualquer evento recarrega a lista (com 200 ms de espera para juntar rajadas), respeitando a categoria, a ordem `EM ALTA` e o contador `RESP.`. Tópicos recebidos ganham o selo `NOVO`.
- **Página do tópico:** respostas novas entram na hora (sem duplicar a que o próprio usuário enviou), respostas excluídas somem, edições do tópico aparecem sem recarregar e, se o tópico for excluído, o usuário vê o aviso "Este tópico foi excluído pelo autor." e volta ao feed.

## Como Testar

Com `docker compose up -d`, o backend e o frontend rodando, abra o app com um usuário e, em outro navegador ou com outro usuário, crie um tópico ou responda: a primeira tela deve atualizar sem recarregar.
