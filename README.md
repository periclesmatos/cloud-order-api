# Cloud Order API

[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-blue)](https://expressjs.com/)
[![DynamoDB](https://img.shields.io/badge/DynamoDB-AWS-orange)](https://aws.amazon.com/dynamodb/)
[![Bcrypt](https://img.shields.io/badge/Bcrypt-3.0.3-red)](https://www.npmjs.com/package/bcryptjs)
[![Swagger](https://img.shields.io/badge/Swagger-6.2.8-brightgreen)](https://swagger.io/)
[![Vitest](https://img.shields.io/badge/Vitest-4.0.18-yellowgreen)](https://vitest.dev/)
[![Supertest](https://img.shields.io/badge/Supertest-7.2.2-lightgrey)](https://www.npmjs.com/package/supertest)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#licença)

## 📌 Visão Geral

A **Cloud Order API** é uma API RESTful desenvolvida para gerenciar pedidos, clientes e produtos. Este projeto foi criado com foco em boas práticas de engenharia de software, incluindo arquitetura limpa, segurança e testes automatizados.

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas, promovendo separação de responsabilidades e modularidade:

- **Controllers**: Lidam com requisições HTTP e retornam respostas apropriadas.
- **Services**: Contêm as regras de negócio, garantindo centralização da lógica.
- **Repositories**: Gerenciam o acesso ao banco de dados DynamoDB, abstraindo detalhes de implementação.
- **Middlewares**: Implementam funcionalidades transversais, como autenticação e tratamento de erros.

Essa abordagem facilita a manutenção e escalabilidade do projeto.

## 🔐 Autenticação e Segurança

- **Autenticação**: Implementada com tokens JWT, garantindo sessões seguras e controle de acesso.
- **Hash de Senhas**: Utiliza Bcrypt para armazenar senhas de forma segura.
- **Middleware de Autenticação**: `requireAuth` protege rotas sensíveis.
- **Boas Práticas**: Validação de senhas fortes e proteção contra ataques de força bruta.

## 📡 Padrão de API

- **Respostas Padronizadas**: Todas as respostas seguem um formato JSON consistente, com mensagens claras e códigos de status HTTP apropriados.
- **Rotas RESTful**: Organização das rotas seguindo os princípios REST, facilitando a integração com clientes externos.

## ⚠️ Tratamento de Erros

- **Middleware Global**: Centraliza o tratamento de erros, convertendo exceções em respostas HTTP apropriadas.
- **Benefícios**: Simplifica o código dos controllers e garante uma experiência consistente para os clientes da API.

## 🚀 Tecnologias Utilizadas

- **Node.js**: Plataforma para execução do JavaScript no backend.
- **Express**: Framework web minimalista e flexível.
- **DynamoDB**: Banco de dados NoSQL escalável e gerenciado pela AWS.
- **Bcrypt**: Biblioteca para hash de senhas.
- **Swagger**: Ferramenta para documentação interativa da API.
- **Vitest**: Framework de testes unitários.
- **Supertest**: Biblioteca para testes de integração de endpoints.

## 📄 Documentação da API

A documentação interativa da API está disponível via Swagger. Para acessá-la, inicie o servidor e acesse o endpoint `/api-docs`.

## 🧪 Testes

- **Unitários**: Testam funções e serviços isoladamente, garantindo a confiabilidade da lógica de negócio.
- **Integração**: Validam o funcionamento dos endpoints e a interação entre as camadas da aplicação.
- **Cobertura**: O projeto utiliza Vitest e Supertest para garantir alta cobertura de testes.

## 📡 Endpoints Principais

- **POST /auth/login**: Autenticação de usuários.
- **GET /customers**: Listagem de clientes.
- **POST /orders**: Criação de pedidos.

## ⚙️ Como Executar o Projeto

### Pré-requisitos

- Node.js 20+
- DynamoDB configurado

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
AWS_REGION=us-east-1
DDB_TABLE=cloud-order-table
AUTH_SECRET=super-secret-key
```

### Execução

```bash
npm run dev
```

### Testes

```bash
npm test
```

## 🧠 Decisões Técnicas

- **DynamoDB**: Escolhido pela escalabilidade e integração com a AWS.
- **Express**: Framework leve e flexível, ideal para APIs RESTful.
- **Arquitetura em Camadas**: Facilita a manutenção e evolução do projeto.
- **Segurança**: Uso de Bcrypt, JWT e rate limiting para proteger a aplicação.

## 🔒 Boas Práticas Aplicadas

- Separação de responsabilidades (SRP).
- Código limpo e organizado.
- Tratamento centralizado de erros.
- Testes automatizados para garantir qualidade.

## 📈 Melhorias Futuras

- Implementação de CI/CD.
- Containerização com Docker.
- Monitoramento e logging avançados.
- Estratégias de escalabilidade horizontal.

## 👨‍💻 Autor

Desenvolvido por [Seu Nome].
