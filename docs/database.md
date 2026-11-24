# Banco de Dados

O banco PostgreSQL do **Clube do Disquete** chama-se `disquete_db`. O esquema `public` organiza contas de usuários, categorias, tópicos e respostas em quatro tabelas relacionais.

A modelagem do banco concentra-se estritamente na integridade estrutural dos dados: chaves primárias (`PRIMARY KEY`), chaves estrangeiras (`FOREIGN KEY`), obrigatoriedade de campos (`NOT NULL`), restrições de unicidade (`UNIQUE`) e limites de tamanho. Validações de formato (como remoção de espaços em branco, tamanho mínimo de senha antes do hash, combinação entre senha e login social) e a atualização do campo `atualizado_em` são responsabilidades da camada de aplicação em Django.

## Scripts SQL

1. `database/001_create_database.sql`: cria o banco `disquete_db`.
2. `database/002_create_schema.sql`: cria as tabelas, chaves, restrições e insere as seis categorias iniciais dentro de uma transação única. Deve ser executado conectado ao banco `disquete_db`.

## Estrutura das Tabelas

### `usuarios`

Armazena as contas registradas na plataforma.

* **Chave primária:** `id_usuario` (`BIGINT` auto-incremental).
* **Campos obrigatórios:** `email`, `nome_usuario`, `termos_aceitos` (`BOOLEAN`) e `criado_em`.
* **Campos opcionais:** `hash_senha` (para cadastro tradicional) e `identificador_google` (para autenticação via Google).
* **Unicidade:** `email`, `nome_usuario` e `identificador_google` possuem restrição `UNIQUE`.

### `categorias`

Armazena as seis categorias temáticas permitidas para classificação dos tópicos. A opção `TODAS` existe apenas como filtro de consulta na interface e não é persistida nessa tabela.

* **Chave primária:** `id_categoria` (`INT` auto-incremental).
* **Campos obrigatórios e únicos:** `codigo` e `nome` (`NOT NULL UNIQUE`).

| Código | Nome |
|---|---|
| `precos-e-promocoes` | Preços e promoções |
| `combos-cpu-gpu` | Combos CPU + GPU |
| `montagem-eupgrade` | Montagem e upgrade |
| `conserto-e-diagnostico` | Conserto e diagnóstico |
| `placas-de-video` | Placas de vídeo |
| `processadores` | Processadores |

### `topicos`

Armazena as postagens criadas pelos usuários no fórum.

* **Chave primária:** `id_topico` (`BIGINT` auto-incremental).
* **Chaves estrangeiras obrigatórias:** `id_autor` (referencia `usuarios.id_usuario`) e `id_categoria` (referencia `categorias.id_categoria`), ambas com `ON DELETE RESTRICT` para impedir a remoção de usuários ou categorias que possuam tópicos vinculados.
* **Campos obrigatórios e limites:** `titulo` (`VARCHAR(140) NOT NULL`, com limite mínimo de 8 e máximo de 140 caracteres), `corpo` (`VARCHAR NOT NULL`, com limite mínimo de 20 caracteres), `criado_em` e `atualizado_em`.

### `respostas`

Armazena os comentários vinculados a cada tópico.

* **Chave primária:** `id_resposta` (`BIGINT` auto-incremental).
* **Chaves estrangeiras obrigatórias:**
  * `id_topico` (referencia `topicos.id_topico` com `ON DELETE CASCADE`, garantindo que a exclusão de um tópico remova automaticamente todas as suas respostas).
  * `id_autor` (referencia `usuarios.id_usuario` com `ON DELETE RESTRICT`, preservando a integridade do histórico de autoria).
* **Campos obrigatórios e limites:** `corpo` (`VARCHAR(10000) NOT NULL`, respeitando o teto de 10.000 caracteres) e `criado_em`.

## Consultas do Feed

* **Feed `RECENTES` e filtro por categoria:** ordena os tópicos por `criado_em` decrescente, filtrando por `id_categoria` quando uma categoria específica for selecionada.
* **Feed `EM ALTA`:** agrupa `respostas` por `id_topico` em ordem decrescente da contagem de respostas, usando como desempate a data da última atividade (maior valor entre `topicos.criado_em` e `respostas.criado_em`).