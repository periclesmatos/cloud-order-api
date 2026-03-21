# Rotas da API (Estado Atual)

Este arquivo resume todas as rotas HTTP do projeto, com:
- dados obrigatórios e opcionais
- necessidade de token
- perfil autorizado
- formato de retorno

## Autenticação

### Como enviar token
- Header: `Authorization: Bearer <accessToken>`

### Perfis de token
- `USER` (admin)
- `CUSTOMER` (cliente)

## Padrão de erro
Quando ocorre erro, o retorno segue:

```json
{
  "error": "mensagem do erro"
}
```

Status comuns:
- `400` validação
- `401` não autenticado
- `403` sem permissão
- `404` não encontrado
- `500` erro interno

## Docs

### `GET /`
- Auth: `PUBLIC`
- Retorno: Swagger UI

## Auth

### `POST /auth/users/register`
- Auth: `PUBLIC`
- Body obrigatório:
  - `name` (string)
  - `email` (string, email válido)
  - `password` (string, mínimo 8, com maiúscula/minúscula/número)
- Body opcional: nenhum
- Retorno `201`:
```json
{
  "user": {
    "id": "user-1",
    "name": "Admin",
    "email": "admin@email.com",
    "role": "ADMIN"
  },
  "accessToken": "jwt",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### `POST /auth/users/login`
- Auth: `PUBLIC`
- Body obrigatório:
  - `email`
  - `password`
- Retorno `200`:
```json
{
  "actor": {
    "id": "user-1",
    "type": "USER"
  },
  "accessToken": "jwt",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### `POST /auth/customers/login`
- Auth: `PUBLIC`
- Body obrigatório:
  - `phone`
- Retorno `200`:
```json
{
  "actor": {
    "id": "cust-1",
    "type": "CUSTOMER"
  },
  "accessToken": "jwt",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

## Customers

### `POST /customers`
- Auth: `PUBLIC`
- Body obrigatório:
  - `name` (string)
  - `email` (string)
  - `phone` (string)
- Retorno `201`: objeto `Customer`

### `GET /customers/phone/:phone`
- Auth: `PUBLIC`
- Path obrigatório:
  - `phone` (string)
- Retorno `200`: objeto `Customer`

### `GET /customers/:id`
- Auth: `TOKEN`
- Permissão: `próprio CUSTOMER (id do token == :id)` ou `USER`
- Path obrigatório:
  - `id` (string)
- Retorno `200`: objeto `Customer`

### `PUT /customers/:id`
- Auth: `TOKEN`
- Permissão: `próprio CUSTOMER` ou `USER`
- Path obrigatório:
  - `id` (string)
- Body opcional (envie somente o que quer alterar):
  - `name` (string)
  - `email` (string)
  - `phone` (string)
- Retorno `200`: objeto `Customer` atualizado

### `DELETE /customers/:id`
- Auth: `TOKEN`
- Permissão: `próprio CUSTOMER` ou `USER`
- Path obrigatório:
  - `id` (string)
- Retorno `204` sem body

### `POST /customers/:id/addresses`
- Auth: `TOKEN`
- Permissão: `próprio CUSTOMER` ou `USER`
- Path obrigatório:
  - `id` (customerId)
- Body obrigatório:
  - `street`
  - `neighborhood`
  - `city`
  - `state`
  - `postalCode`
  - `country`
- Body opcional:
  - `complement`
- Retorno `201`: objeto `Address`

### `PUT /customers/:id/addresses/:addressId`
- Auth: `TOKEN`
- Permissão: `próprio CUSTOMER` ou `USER`
- Path obrigatório:
  - `id`
  - `addressId`
- Body opcional:
  - `street`, `neighborhood`, `city`, `state`, `postalCode`, `country`, `complement`
- Retorno `200`: objeto `Address` atualizado

### `DELETE /customers/:id/addresses/:addressId`
- Auth: `TOKEN`
- Permissão: `próprio CUSTOMER` ou `USER`
- Path obrigatório:
  - `id`
  - `addressId`
- Retorno `204` sem body

## Products

### `GET /products`
- Auth: `PUBLIC`
- Query opcional:
  - `name` (string) para busca por nome
  - `isActive` (`true`/`false`) filtro de status
- Retorno `200`: array de `Product`

### `GET /products/:id`
- Auth: `TOKEN`
- Permissão: qualquer `CUSTOMER` autenticado ou `USER`
- Path obrigatório:
  - `id`
- Retorno `200`: objeto `Product`

### `POST /products`
- Auth: `TOKEN`
- Permissão: `USER` apenas
- Body obrigatório:
  - `name` (string)
  - `price` (number)
  - `amount` (number/integer)
- Retorno `201`: objeto `Product`

### `PUT /products/:id`
- Auth: `TOKEN`
- Permissão: `USER` apenas
- Path obrigatório:
  - `id`
- Body opcional:
  - `name`
  - `price`
  - `amount`
- Retorno `200`: objeto `Product` atualizado

### `PATCH /products/:id/status`
- Auth: `TOKEN`
- Permissão: `USER` apenas
- Path obrigatório:
  - `id`
- Body obrigatório:
  - `isActive` (boolean)
- Retorno `200`: objeto `Product` atualizado

### `DELETE /products/:id`
- Auth: `TOKEN`
- Permissão: `USER` apenas
- Path obrigatório:
  - `id`
- Retorno `204` sem body

## Orders

### `POST /orders`
- Auth: `TOKEN`
- Permissão:
  - `CUSTOMER`: só pode criar com `customerId` igual ao próprio token
  - `USER`: pode criar para qualquer cliente
- Body obrigatório:
  - `customerId` (string)
  - `addressId` (string, deve ser endereço do cliente)
  - `items` (array com ao menos 1 item)
- Estrutura de item (obrigatório):
  - `productId` (string)
  - `quantity` (inteiro positivo)
- Retorno `201`: objeto `Order`

### `GET /orders`
- Auth: `TOKEN`
- Permissão:
  - `USER`: consulta geral
  - `CUSTOMER`: consulta somente próprios pedidos (forçado pelo backend)
- Query opcional:
  - `customerId` (somente para admin ou para o próprio customer)
  - `status` (`CREATED|SENT|COMPLETED|CANCELED`)
  - `dateFrom` (ISO/`YYYY-MM-DD`)
  - `dateTo` (ISO/`YYYY-MM-DD`)
- Retorno `200`: array de `OrderSummary`

### `GET /orders/:id`
- Auth: `TOKEN`
- Permissão:
  - `USER`: pode consultar qualquer pedido
  - `CUSTOMER`: só pedido cujo `order.customerId == token.sub`
- Path obrigatório:
  - `id`
- Retorno `200`: objeto `Order`

### `GET /orders/customer/:customerId`
- Auth: `TOKEN`
- Permissão:
  - `USER`: pode consultar qualquer cliente
  - `CUSTOMER`: apenas próprio `customerId`
- Path obrigatório:
  - `customerId`
- Query opcional:
  - `status`
  - `dateFrom`
  - `dateTo`
- Retorno `200`: array de `Order` (detalhado com itens)

### `PATCH /orders/:id/status`
- Auth: `TOKEN`
- Permissão: `USER` apenas
- Path obrigatório:
  - `id`
- Body obrigatório:
  - `status` (`CREATED|SENT|COMPLETED|CANCELED`)
- Regras importantes:
  - não permite cancelar pedido já `SENT` ou `COMPLETED`
  - cancelamento devolve estoque
- Retorno `200`: objeto `Order` atualizado

## Modelos de retorno (resumo)

### Customer
```json
{
  "id": "cust-1",
  "name": "Maria",
  "email": "maria@email.com",
  "phone": "+5585999999999",
  "createdAt": "2026-03-21T00:00:00.000Z",
  "addresses": []
}
```

### Address
```json
{
  "id": "addr-1",
  "customerId": "cust-1",
  "street": "Rua A",
  "neighborhood": "Centro",
  "city": "Fortaleza",
  "state": "CE",
  "postalCode": "60000-000",
  "country": "BR",
  "complement": "Apto 101",
  "createdAt": "2026-03-21T00:00:00.000Z"
}
```

### Product
```json
{
  "id": "prod-1",
  "name": "Teclado",
  "price": 299.9,
  "amount": 10,
  "isActive": true,
  "createdAt": "2026-03-21T00:00:00.000Z"
}
```

### Order
```json
{
  "id": "ord-1",
  "customerId": "cust-1",
  "addressId": "addr-1",
  "deliveryAddress": {
    "street": "Rua A",
    "neighborhood": "Centro",
    "city": "Fortaleza",
    "state": "CE",
    "postalCode": "60000-000",
    "country": "BR",
    "complement": null
  },
  "status": "CREATED",
  "totalAmount": 599.8,
  "totalItems": 2,
  "createdAt": "2026-03-21T00:00:00.000Z",
  "updatedAt": "2026-03-21T00:00:00.000Z",
  "items": [
    {
      "productId": "prod-1",
      "productName": "Teclado",
      "quantity": 2,
      "unitPrice": 299.9,
      "lineTotal": 599.8
    }
  ]
}
```
