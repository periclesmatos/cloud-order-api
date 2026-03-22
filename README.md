# Cloud Order API

API REST para gestão de clientes, produtos e pedidos, com autenticação JWT, autorização por perfil, controle transacional de estoque e deploy em nuvem.

## Sumário
- [Resumo Executivo](#resumo-executivo)
- [Status do Projeto](#status-do-projeto)
- [Escopo Funcional](#escopo-funcional)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Setup Local](#setup-local)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Testes e Qualidade](#testes-e-qualidade)
- [Segurança](#segurança)
- [CI/CD e Deploy](#cicd-e-deploy)
- [Banco de Dados (DynamoDB)](#banco-de-dados-dynamodb)
- [Aderência ao Trabalho (Checklist)](#aderência-ao-trabalho-checklist)
- [Entregáveis Acadêmicos](#entregáveis-acadêmicos)

## Resumo Executivo
Este projeto implementa o back-end de um sistema de pedidos com:
- autenticação para `USER` (admin) e `CUSTOMER` (cliente);
- autorização por perfil e ownership;
- CRUD de clientes, produtos e pedidos;
- controle de status de pedidos com regras de negócio;
- controle transacional de estoque no DynamoDB;
- documentação da API via Swagger;
- pipeline CI/CD com build, testes e deploy automático em produção.

## Status do Projeto
- Back-end: concluído e em produção.
- CI/CD (produção): concluído.
- Front-end: pendente.
- Entregáveis finais (relatório + vídeo): pendente.

## Escopo Funcional
### Módulos principais
- Clientes: cadastro, consulta, atualização, remoção e endereços.
- Produtos: cadastro, listagem, consulta, atualização, remoção e ativação/desativação.
- Pedidos: criação, consulta por cliente/global e atualização de status.
- Auth: registro/login de admin e login de cliente.

### Regras de acesso (resumo)
- Público: login/registro e endpoints públicos de consulta definidos nas rotas.
- Autenticado: acesso conforme perfil.
- Admin (`USER`): operações administrativas.
- Cliente (`CUSTOMER`): acesso restrito aos próprios recursos.

## Arquitetura
Arquitetura em camadas:
- `domain`: entidades e value objects
- `application`: regras de negócio (services)
- `infra`: persistência DynamoDB e mappers
- `presentation/http`: rotas, controllers, middlewares e docs
- `shared`: providers e logger

Arquivos-chave:
- App factory: [`src/app.factory.js`](src/app.factory.js)
- Bootstrap: [`src/app.js`](src/app.js)
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

## Setup Local
1. Instalar dependências:
```bash
npm ci
```

2. Criar `.env` com base em `.env.example`.

3. Rodar aplicação:
```bash
npm run dev
```

4. Acessar:
- API/Swagger: `http://localhost:3000/`

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

Boas práticas:
- não commitar credenciais reais;
- rotacionar credenciais em caso de vazamento;
- usar segredos no ambiente de produção.

## Testes e Qualidade
Scripts:
```bash
npm run test
npm run test:unit
npm run test:integration
```

Stack de testes:
- Unitários e integração com Vitest + Supertest.

## Segurança
Controles implementados:
- autenticação JWT;
- autorização por perfil/ownership;
- tratamento centralizado de erros HTTP;
- logs de acesso e erro;
- rate limit global e específico para autenticação.

Rate limit configurável em [`src/app.factory.js`](src/app.factory.js):
- Global:
  - `RATE_LIMIT_WINDOW_MS` (default `900000`)
  - `RATE_LIMIT_MAX` (default `100`)
- `/auth`:
  - `AUTH_RATE_LIMIT_WINDOW_MS` (default `900000`)
  - `AUTH_RATE_LIMIT_MAX` (default `10`)

## CI/CD e Deploy
Workflow: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

Fluxo atual:
- `pull_request` para `production`:
  - checkout
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

## Banco de Dados (DynamoDB)
Modelo com single-table e chaves compostas.

Índices utilizados:
- `type-index`
- `GSI_AllOrders`
- `GSI_OrderByCostumer`

Persistência é externa ao container (serviço gerenciado em nuvem).

## Aderência ao Trabalho (Checklist)
Baseado em **Proposta de atividade – Desenvolvimento de Software em Nuvem**.

- Aplicação web com caso de uso elaborado: `OK` (sistema de pedidos com status/histórico).
- API RESTful documentada: `OK` (Swagger).
- Autenticação e autorização: `OK`.
- CRUD completo no back-end: `OK`.
- Validação de dados no back-end: `OK`.
- Logs de acesso e erro: `OK`.
- Back-end containerizado e em nuvem: `OK` (Docker + AWS EC2).
- Banco gerenciado e fora do container: `OK` (DynamoDB).
- CI/CD com build + testes + deploy: `OK`.
- Segurança e boas práticas: `OK` (env vars, proteção de rotas, erro centralizado, rate limit).
- Front-end em framework moderno com deploy em nuvem: `PENDENTE`.

## Entregáveis Acadêmicos
Para fechar 100% da atividade, ainda faltam:
- Front-end (React/Vue/Angular) com deploy (Vercel/Netlify/similar).
- Relatório técnico (até 6 páginas) com:
  - visão geral;
  - arquitetura em nuvem;
  - tecnologias/serviços;
  - estratégia de CI/CD;
  - papéis da equipe;
  - dificuldades e soluções.
- Vídeo (até 7 min) demonstrando arquitetura, funcionamento, deploy e pipeline/testes.
