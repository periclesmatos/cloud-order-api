# Cloud Order API

API para gestão de clientes, produtos e pedidos com controle de estoque transacional, autenticação JWT e autorização por perfil.

## Sumário
- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Módulos de Domínio](#módulos-de-domínio)
- [Regras de Acesso](#regras-de-acesso)
- [Documentação da API](#documentação-da-api)
- [DynamoDB e Índices](#dynamodb-e-índices)
- [Qualidade e Testes](#qualidade-e-testes)
- [Observações de Segurança](#observações-de-segurança)

## Visão Geral
Principais capacidades:
- Cadastro e gestão de clientes e endereços.
- Cadastro e gestão de produtos (ativar/desativar, atualização e remoção).
- Criação de pedidos com baixa de estoque em transação (evita concorrência).
- Alteração de status de pedido com regras de transição e estorno de estoque no cancelamento.
- Autenticação separada para:
  - `USER` (admin): e-mail + senha.
  - `CUSTOMER` (cliente): telefone.
- Autorização por perfil e por ownership (cliente só acessa seus próprios recursos).

## Stack
- Node.js (ESM)
- Express
- AWS SDK v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- JWT (`jsonwebtoken`)
- Hash de senha (`bcryptjs`)
- Testes: Vitest + Supertest
- Swagger UI para documentação

## Arquitetura
Organização por camadas/módulos:
- `domain`: entidades e value objects
- `application`: regras de negócio (services) e erros de aplicação
- `infra`: persistência DynamoDB e mappers
- `presentation/http`: controllers, rotas, middlewares, presenters e swagger
- `shared`: providers (UUID, token, password hasher, logger)

Composição de dependências centralizada em:
- [`src/app.factory.js`](src/app.factory.js)

Bootstrap da aplicação:
- [`src/app.js`](src/app.js)

## Módulos de Domínio
### Clientes
- Cadastro de cliente com unicidade por telefone.
- Gestão de endereços por cliente.

### Produtos
- Cadastro, atualização, ativação/desativação e exclusão.
- Filtros por nome e status ativo/inativo.

### Pedidos
- Criação com snapshot de endereço de entrega.
- Itens com validação de quantidade e cálculo de totais.
- Baixa de estoque com proteção de concorrência via transação.
- Fluxo de status:
  - `CREATED -> SENT -> COMPLETED`
  - `CREATED -> CANCELED`
- Cancelamento realiza estorno de estoque.

### Auth
- Usuário admin:
  - registro e login por `email/senha`
- Cliente:
  - login por `telefone`
- Emissão de JWT para autorização nas rotas protegidas.

## Regras de Acesso
Perfis:
- `USER` (admin)
- `CUSTOMER`

Matriz resumida:
- `POST /auth/users/register`: público
- `POST /auth/users/login`: público
- `POST /auth/customers/login`: público
- `POST /customers`: público
- `GET /customers/phone/:phone`: público
- `GET/PUT/DELETE /customers/:id`: próprio cliente ou admin
- Endereços do cliente: próprio cliente ou admin
- `GET /products`: público
- `GET /products/:id`: autenticado (`CUSTOMER` ou `USER`)
- CRUD/status de produtos: apenas admin
- Criação de pedido: autenticado
  - cliente só para si
  - admin para qualquer cliente
- Consultas de pedido: cliente só os próprios; admin geral
- Atualização de status de pedido: apenas admin

## Documentação da API
- Swagger UI: `GET /`
- Documento detalhado de rotas:
  - [`docs/ROTAS_API.md`](docs/ROTAS_API.md)

## DynamoDB e Índices
A aplicação usa single-table com chaves compostas (`PK`, `SK`) e índices para consultas.

Índices utilizados no código:
- `type-index`: listagem de clientes (`findAll` em customer repository)
- `GSI_AllOrders`: listagem global de pedidos
- `GSI_OrderByCostumer`: pedidos por cliente

Além disso, existem locks e padrões de chave para unicidade:
- lock de telefone para cliente
- lock de e-mail para usuário admin

## Qualidade e Testes
Status validado:
- Suíte completa executada com sucesso.
- Resultado: `24 files`, `140 tests` passando.

## Observações de Segurança
- Tokens JWT são assinados com `HS256`.
- Senhas de admin são armazenadas com `bcrypt`.
- Recomendado para produção:
  - usar segredo forte em `AUTH_SECRET`
  - adicionar expiração curta + refresh token
  - implementar OTP para login de cliente por telefone
  - rate limit em endpoints de autenticação
