# Autenticação e Gerenciamento de Usuários

O módulo de autenticação do **Clube do Disquete** está implementado no aplicativo `usuarios` (`apps/backend/usuarios/`) com autenticação global via `core/authentication.py` (`JWTAuthentication`).

## Regras de Negócio Aplicadas

* **Política de Senha e Termos:** O cadastro tradicional exige senha com no mínimo 8 caracteres (armazenada com hash via `django.contrib.auth.hashers.make_password`), confirmação de senha idêntica (`confirmacao_senha`) e aceite explícito dos termos (`termos_aceitos: true`).
* **Sessão JWT *Stateless*:** O login e o cadastro retornam um token JWT (`HS256`).
* **Acesso Social com Google:** Valida o `id_token` emitido pelo Google via `google-auth`, vincula automaticamente contas existentes com o mesmo e-mail e exige `termos_aceitos: true` no primeiro cadastro.
* **Recuperação de Senha:** Emite um token JWT temporário (`tipo: recuperacao_senha`, validade padrão de 30 minutos) atrelado a uma impressão do `hash_senha` atual, invalidando o token automaticamente assim que a senha é alterada, sem exigir tabelas extras no banco.

## Endpoints Disponíveis (`/api/auth/`)

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/cadastro/` | Pública | Cria uma conta tradicional e retorna `{ token, usuario }`. |
| `POST` | `/api/auth/login/` | Pública | Autentica por `email` e `senha` e retorna `{ token, usuario }`. |
| `POST` | `/api/auth/google/` | Pública | Valida `id_token` (ou `credential`) do Google e retorna `{ token, usuario }`. |
| `POST` | `/api/auth/recuperar-senha/` | Pública | Inicia a recuperação de senha por e-mail sem expor se a conta existe. |
| `POST` | `/api/auth/redefinir-senha/` | Pública | Valida o token temporário e atualiza a senha do usuário. |
| `GET` | `/api/auth/me/` | `Bearer <token>` | Retorna o perfil do usuário autenticado. |
| `POST` | `/api/auth/logout/` | `Bearer <token>` | Confirma o encerramento da sessão no cliente. |

## Como Testar Localmente (Windows PowerShell)

1. Com o ambiente virtual ativado dentro de `apps/backend/`, instale as novas dependências:
   ```powershell
   pip install -r requirements.txt
   ```
2. Copie as novas variáveis de `.env.example` (`JWT_RESET_EXPIRES_MINUTES`, `GOOGLE_CLIENT_ID`, `EMAIL_BACKEND`, `DEFAULT_FROM_EMAIL`, `FRONTEND_RESET_PASSWORD_URL`) para o seu `.env` local.
3. Inicie o servidor de desenvolvimento:
   ```powershell
   python manage.py runserver
   ```
4. Em outro terminal PowerShell, crie um usuário de teste via `POST /api/auth/cadastro/`:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/cadastro/" -Method Post -ContentType "application/json" -Body '{"email":"teste@disquete.com","nome_usuario":"usuario_teste","senha":"senha123","confirmacao_senha":"senha123","termos_aceitos":true}'
   ```
5. Faça login via `POST /api/auth/login/` e armazene a resposta na variável `$res` (evitando que o PowerShell corte o token com `...` na exibição do terminal):
   ```powershell
   $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method Post -ContentType "application/json" -Body '{"email":"teste@disquete.com","senha":"senha123"}'
   ```
6. Utilize `$res.token` para consultar os dados da sessão atual em `GET /api/auth/me/`:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/me/" -Method Get -Headers @{ Authorization = "Bearer $($res.token)" }
   ```
7. Teste a recuperação e redefinição de senha armazenando a resposta em `$rec` (com `DEBUG=True`, o link aparece no terminal do Django e o `token_recuperacao` retorna no objeto):
   ```powershell
   $rec = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/recuperar-senha/" -Method Post -ContentType "application/json" -Body '{"email":"teste@disquete.com"}'
   ```
   Em seguida, envie `$rec.token_recuperacao` para `POST /api/auth/redefinir-senha/`:
   ```powershell
   $bodyReset = @{ token = $rec.token_recuperacao; nova_senha = "nova_senha123"; confirmacao_senha = "nova_senha123" } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/redefinir-senha/" -Method Post -ContentType "application/json" -Body $bodyReset
   ```
8. Teste o encerramento de sessão em `POST /api/auth/logout/`:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/logout/" -Method Post -Headers @{ Authorization = "Bearer $($res.token)" }
   ```

### Resultados Esperados

* **Cadastro (`201 Created`) e Login (`200 OK`):** Retornam o token JWT e os dados públicos do perfil sem expor `hash_senha`:
  ```json
  {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "usuario": {
          "id_usuario": 1,
          "email": "teste@disquete.com",
          "nome_usuario": "usuario_teste",
          "termos_aceitos": true,
          "possui_senha": true,
          "google_vinculado": false,
          "criado_em": "2026-11-25T23:30:00-03:00"
      }
  }
  ```
* **Falha de Autenticação ou Token Ausente/Inválido:** Qualquer rota protegida (`/api/auth/me/`, `/api/auth/logout/`) chamada sem cabeçalho `Authorization: Bearer <token>` válido retorna **HTTP `401 Unauthorized`**.
* **Reutilização do Token de Recuperação:** Após concluir `POST /api/auth/redefinir-senha/`, uma segunda tentativa com o mesmo token retorna **HTTP `400 Bad Request`** informando que o token já foi utilizado ou invalidado.