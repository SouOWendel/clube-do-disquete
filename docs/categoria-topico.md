# Categorias, Feed e Gerenciamento de Tópicos

O módulo de categorias, feed e tópicos do **Clube do Disquete** está implementado no aplicativo `topicos` (`apps/backend/topicos/`), reutilizando os models `Categoria` e `Topico` de `core/models.py` e a autenticação global `JWTAuthentication` de `core/authentication.py`.

## Regras de Negócio Aplicadas

- **Autenticação Obrigatória:** Todas as rotas de categorias e tópicos exigem o cabeçalho `Authorization: Bearer <token>` válido, retornando **HTTP `401 Unauthorized`** quando o token está ausente, expirado ou inválido.
- **Categorização Obrigatória:** A rota de categorias retorna as seis categorias fixas cadastradas no banco. Na criação ou edição de tópicos, a categoria pode ser informada pelo `codigo` (ex.: `placas-de-video`, `montagem-eupgrade`) ou pelo `id_categoria`, bloqueando a opção `TODAS` (que é exclusiva para filtro de leitura).
- **Ordenação do Feed:**
  - `ordenar=recentes` (padrão): ordena os tópicos por `criado_em` decrescente.
  - `ordenar=em-alta`: ordena os tópicos pela contagem total de respostas (`total_respostas`) decrescente, usando a data da última atividade (maior data entre `criado_em` do tópico e sua última resposta) como critério de desempate.
- **Limites de Caracteres:** O assunto (`titulo`) exige entre **8 e 140 caracteres** e a descrição (`corpo`) exige **no mínimo 20 caracteres**.
- **Propriedade para Edição e Exclusão:** Apenas o usuário criador (`autor`) pode editar (`PUT`/`PATCH`) ou excluir (`DELETE`) o próprio tópico. Tentativas feitas por outro usuário autenticado retornam **HTTP `403 Forbidden`**.
- **Exclusão em Cascata:** Ao excluir um tópico, todas as respostas vinculadas a ele são removidas automaticamente em cascata.

## Endpoints Disponíveis (`/api/`)

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/api/categorias/` | `Bearer <token>` | Lista as seis categorias fixas do fórum. |
| `GET` | `/api/topicos/` | `Bearer <token>` | Lista os tópicos do feed. Aceita `?categoria=<codigo>` (ou `todas`) e `?ordenar=recentes\|em-alta`. |
| `POST` | `/api/topicos/` | `Bearer <token>` | Cria um novo tópico vinculado ao usuário autenticado e retorna **HTTP `201`**. |
| `GET` | `/api/topicos/<id_topico>/` | `Bearer <token>` | Retorna os detalhes completos de um tópico específico. |
| `PUT` / `PATCH` | `/api/topicos/<id_topico>/` | `Bearer <token>` (Autor) | Atualiza `categoria`, `titulo` e/ou `corpo` do tópico. |
| `DELETE` | `/api/topicos/<id_topico>/` | `Bearer <token>` (Autor) | Exclui o tópico e suas respostas vinculadas, retornando **HTTP `204`**. |

## Como Testar Localmente (Windows PowerShell)

1. Inicie o servidor de desenvolvimento dentro de `apps/backend/` com o ambiente virtual ativado:
   ```powershell
   python manage.py runserver
   ```  

2. Em outro terminal PowerShell, autentique-se para obter o token JWT e configure o cabeçalho padrão:
   ```powershell
   $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method Post -ContentType "application/json" -Body '{"email":"teste@disquete.com","senha":"nova_senha123"}'
   $headers = @{ Authorization = "Bearer $($res.token)" }
   ```  

3. Liste as seis categorias fixas via `GET /api/categorias/`:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/categorias/" -Method Get -Headers $headers
   ```  

4. Crie um novo tópico via `POST /api/topicos/`:
   ```powershell
   $novoTopico = @{
       categoria = "placas-de-video"
       titulo = "Duvida sobre temperatura da RTX 3060 em jogos"
       corpo = "Minha placa de video esta batendo 82 graus em carga maxima. Esse valor eh normal ou devo trocar a pasta termica?"
   } | ConvertTo-Json
   $topico = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/topicos/" -Method Post -Headers $headers -ContentType "application/json; charset=utf-8" -Body $novoTopico
   ```  

5. Liste o feed geral e filtrado por categoria/ordenação via `GET /api/topicos/`:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/topicos/?categoria=placas-de-video&ordenar=recentes" -Method Get -Headers $headers
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/topicos/?ordenar=em-alta" -Method Get -Headers $headers
   ```  

6. Consulte os detalhes do tópico criado via `GET /api/topicos/<id_topico>/`:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/topicos/$($topico.id_topico)/" -Method Get -Headers $headers
   ```  

7. Edite o tópico via `PUT /api/topicos/<id_topico>/`:
   ```powershell
   $edicaoTopico = @{
       categoria = "conserto-e-diagnostico"
       titulo = "Temperatura alta na RTX 3060 após limpeza do gabinete"
       corpo = "Atualizando o relato: após limpar os filtros de poeira, a temperatura caiu para 76 graus em jogos pesados."
   } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/topicos/$($topico.id_topico)/" -Method Put -Headers $headers -ContentType "application/json; charset=utf-8" -Body $edicaoTopico
   ```  

8. Exclua o tópico via `DELETE /api/topicos/<id_topico>/`:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/topicos/$($topico.id_topico)/" -Method Delete -Headers $headers
   ```

### Resultados Esperados

- **Criação (`201 Created`) e Detalhes (`200 OK`):** Retornam o objeto completo do tópico com categoria, autor, contador de respostas e indicador de autoria (`eh_autor`):
  ```json
  {
      "id_topico": 1,
      "titulo": "Dúvida sobre temperatura da RTX 3060 em jogos",
      "corpo": "Minha placa de vídeo está batendo 82 graus em carga máxima. Esse valor é normal ou devo trocar a pasta térmica?",
      "categoria": {
          "id_categoria": 5,
          "codigo": "placas-de-video",
          "nome": "Placas de vídeo"
      },
      "autor": {
          "id_usuario": 1,
          "nome_usuario": "usuario_teste"
      },
      "total_respostas": 0,
      "criado_em": "2026-11-26T00:40:00-03:00",
      "atualizado_em": "2026-11-26T00:40:00-03:00",
      "autoria": true
  }
  ```
- **Edição ou Exclusão por Outro Usuário:** Qualquer tentativa de `PUT`, `PATCH` ou `DELETE` feita por um usuário autenticado diferente do autor retorna **HTTP `403 Forbidden`**.
- **Requisição sem Token JWT:** Qualquer chamada sem `Authorization: Bearer <token>` válido retorna **HTTP `401 Unauthorized`**.