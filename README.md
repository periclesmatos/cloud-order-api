# Cloud Order API

Back-end API para gestão de clientes, produtos e pedidos, com autenticação JWT, autorização por perfil, controle transacional de estoque e deploy em nuvem.

## Sumário
- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Setup Local](#setup-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Endpoints e Documentação](#endpoints-e-documentação)
- [Testes](#testes)
- [Segurança](#segurança)
- [CI/CD e Deploy](#cicd-e-deploy)
- [Operação em Produção](#operação-em-produção)
- [Banco de Dados (DynamoDB)](#banco-de-dados-dynamodb)

## Visão Geral
A API implementa:
- autenticação para `USER` (admin) e `CUSTOMER` (cliente);
- autorização por perfil e ownership;
- CRUD de clientes, produtos e pedidos;
- fluxo de status de pedidos com regras de negócio;
- persistência em DynamoDB com operações transacionais;
- observabilidade via logs de acesso e erro;
- pipeline CI/CD com build, testes e deploy automático.

Este repositório contém o back-end da aplicação.

## Arquitetura
Arquitetura em camadas:
- `domain`: entidades e value objects
- `application`: regras de negócio (services)
- `infra`: persistência DynamoDB e mappers
- `presentation/http`: controllers, rotas, middlewares e Swagger
- `shared`: providers (token, hash, UUID, logger)

Arquivos principais:
- App factory: [`src/app.factory.js`](src/app.factory.js)
- Bootstrap da aplicação: [`src/app.js`](src/app.js)
- Rotas HTTP: [`src/modules/presentation/http/routes/index.js`](src/modules/presentation/http/routes/index.js)

## Tecnologias
- Node.js 22+
- Express
- AWS SDK v3 (DynamoDB)
- JWT (`jsonwebtoken`)
- `bcryptjs`
- Vitest + Supertest
- Swagger UI
- Docker
- GitHub Actions

## Requisitos
- Node.js 22+
- npm 10+
- Docker e Docker Compose
- Tabela DynamoDB configurada

## Setup Local
1. Instalar dependências:
```bash
npm ci
```

2. Criar `.env` com base em `.env.example`.

3. Iniciar aplicação:
```bash
npm run dev
```

4. Acessar:
- API + Swagger: `http://localhost:3000/`

## Variáveis de Ambiente
Arquivo de referência: [`.env.example`](.env.example)

Principais variáveis:
- `PORT`
- `AWS_REGION`
- `DDB_TABLE`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `AUTH_RATE_LIMIT_WINDOW_MS`
- `AUTH_RATE_LIMIT_MAX`

Recomendação:
- nunca commitar credenciais reais;
- manter segredos apenas em variáveis de ambiente/secret manager.

## Endpoints e Documentação
- Swagger UI: `GET /`
- Referência de rotas: [`docs/ROTAS_API.md`](docs/ROTAS_API.md)

## Testes
Executar suíte completa:
```bash
npm run test
```

Executar por tipo:
```bash
npm run test:unit
npm run test:integration
```

## Segurança
Controles implementados:
- autenticação JWT;
- autorização por perfil e ownership;
- tratamento centralizado de erros HTTP;
- logs estruturados de acesso e erro;
- rate limit global e específico para autenticação.

Rate limit configurável em [`src/app.factory.js`](src/app.factory.js):
- Global:
  - `RATE_LIMIT_WINDOW_MS` (default `900000`)
  - `RATE_LIMIT_MAX` (default `100`)
- `/auth`:
  - `AUTH_RATE_LIMIT_WINDOW_MS` (default `900000`)
  - `AUTH_RATE_LIMIT_MAX` (default `10`)

## CI/CD e Deploy
Workflow principal: [`.github/workflows/ci-pr.yml`](.github/workflows/ci-pr.yml) e [`.github/workflows/deploy-production.yml`](.github/workflows/deploy-production.yml)

Fluxo:
- `pull_request` para `production`:
  - `npm ci`
  - `docker build -t cloud-order-api:ci .`
  - `npm run test`
- `push` em `production`:
  - deploy automático na EC2 via SSH
  - atualização para `origin/production`
  - `docker compose up -d --build`

Segredos necessários no GitHub:
- `EC2_SSH_KEY`
- `EC2_HOST`
- `EC2_USER`
- `APP_DIR`

Estratégia de branches:
- `alpha`: desenvolvimento
- `production`: produção

## Operação em Produção
Comandos úteis no servidor:
```bash
cd <APP_DIR>
git fetch origin
git checkout production
git reset --hard origin/production
docker compose up -d --build
docker compose ps
docker compose logs --tail=100
```

## Banco de Dados (DynamoDB)
Modelo com single-table e chaves compostas.

Índices utilizados:
- `type-index`
- `GSI_AllOrders`
- `GSI_OrderByCostumer`

Persistência é externa ao container (serviço gerenciado em nuvem).
