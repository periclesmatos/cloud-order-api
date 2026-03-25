export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Cloud Order API',
    version: '1.0.0',
    description: 'Documentacao dos endpoints de clientes, enderecos e produtos.',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor atual',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Autenticacao e registro' },
    { name: 'Customers', description: 'Operacoes de cliente' },
    { name: 'Addresses', description: 'Operacoes de endereco' },
    { name: 'Products', description: 'Operacoes de produto' },
    { name: 'Orders', description: 'Operacoes de pedido' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Cliente nao encontrado' },
        },
      },
      Address: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'addr-1' },
          street: { type: 'string', example: 'Rua A' },
          number: { type: 'string', example: '100' },
          neighborhood: { type: 'string', example: 'Centro' },
          city: { type: 'string', example: 'Fortaleza' },
          state: { type: 'string', example: 'CE' },
          postalCode: { type: 'string', example: '60000-000' },
          complement: { type: 'string', nullable: true, example: 'Apto 101' },
          reference: { type: 'string', nullable: true, example: 'Proximo a praca' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'cust-1' },
          name: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email', example: 'maria@email.com' },
          phone: { type: 'string', example: '+5585999999999' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time', nullable: true },
          addresses: {
            type: 'array',
            items: { $ref: '#/components/schemas/Address' },
          },
        },
      },
      CreateCustomerInput: {
        type: 'object',
        required: ['name', 'email', 'phone'],
        properties: {
          name: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email', example: 'maria@email.com' },
          phone: { type: 'string', example: '85999999999' },
        },
      },
      UpdateCustomerInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email', example: 'maria@email.com' },
          phone: { type: 'string', example: '85999999999' },
        },
      },
      AddressInput: {
        type: 'object',
        required: ['street', 'number', 'neighborhood', 'city', 'state', 'postalCode'],
        properties: {
          street: { type: 'string', example: 'Rua A' },
          number: { type: 'string', example: '100' },
          neighborhood: { type: 'string', example: 'Centro' },
          city: { type: 'string', example: 'Fortaleza' },
          state: { type: 'string', example: 'CE' },
          postalCode: { type: 'string', example: '60000-000' },
          complement: { type: 'string', nullable: true, example: 'Apto 101' },
          reference: { type: 'string', nullable: true, example: 'Proximo a praca' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prod-1' },
          name: { type: 'string', example: 'Teclado Mecanico' },
          price: { type: 'number', example: 299.9 },
          amount: { type: 'number', example: 10 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateProductInput: {
        type: 'object',
        required: ['name', 'price', 'amount'],
        properties: {
          name: { type: 'string', example: 'Teclado Mecanico' },
          price: { type: 'number', example: 299.9 },
          amount: { type: 'number', example: 10 },
        },
      },
      UpdateProductInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Teclado Mecanico Pro' },
          price: { type: 'number', example: 349.9 },
          amount: { type: 'number', example: 8 },
        },
      },
      ProductStatusInput: {
        type: 'object',
        required: ['isActive'],
        properties: {
          isActive: { type: 'boolean', example: true },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-1' },
          name: { type: 'string', example: 'Administrador' },
          email: { type: 'string', format: 'email', example: 'admin@email.com' },
          role: { type: 'string', example: 'ADMIN' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Administrador' },
          email: { type: 'string', format: 'email', example: 'admin@email.com' },
          password: { type: 'string', format: 'password', example: 'A9!zT7#kL2' },
        },
      },
      UserLoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@email.com' },
          password: { type: 'string', format: 'password', example: 'A9!zT7#kL2' },
        },
      },
      CustomerLoginInput: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string', example: '85999999999' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          tokenType: { type: 'string', example: 'Bearer' },
          expiresIn: { type: 'integer', example: 3600 },
        },
      },
      MeResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr-1' },
          type: { type: 'string', enum: ['USER', 'CUSTOMER'] },
          name: { type: 'string', example: 'Administrador' },
          email: { type: 'string', format: 'email', example: 'admin@email.com', nullable: true },
          role: { type: 'string', example: 'ADMIN', nullable: true },
          phone: { type: 'string', example: '85999999999', nullable: true },
        },
      },
      OrderItemInput: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string', example: 'prod-1' },
          quantity: { type: 'integer', example: 2, minimum: 1 },
        },
      },
      CreateOrderInput: {
        type: 'object',
        required: ['customerId', 'addressId', 'items'],
        properties: {
          customerId: { type: 'string', example: 'cust-1' },
          addressId: { type: 'string', example: 'addr-1' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItemInput' },
          },
        },
      },
      OrderStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['CREATED', 'SENT', 'COMPLETED', 'CANCELED'],
            example: 'SENT',
          },
        },
      },
      DeliveryAddressSnapshot: {
        type: 'object',
        properties: {
          street: { type: 'string', example: 'Rua A' },
          neighborhood: { type: 'string', example: 'Centro' },
          city: { type: 'string', example: 'Fortaleza' },
          state: { type: 'string', example: 'CE' },
          postalCode: { type: 'string', example: '60000-000' },
          country: { type: 'string', example: 'BR' },
          complement: { type: 'string', nullable: true, example: 'Apto 101' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          productId: { type: 'string', example: 'prod-1' },
          productName: { type: 'string', example: 'Teclado Mecanico' },
          quantity: { type: 'integer', example: 2 },
          unitPrice: { type: 'number', example: 299.9 },
          lineTotal: { type: 'number', example: 599.8 },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ord-1' },
          customerId: { type: 'string', example: 'cust-1' },
          addressId: { type: 'string', example: 'addr-1' },
          deliveryAddress: { $ref: '#/components/schemas/DeliveryAddressSnapshot' },
          status: { type: 'string', example: 'CREATED' },
          totalAmount: { type: 'number', example: 799.8 },
          totalItems: { type: 'integer', example: 3 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/OrderItem' },
          },
        },
      },
      OrderSummary: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'ord-1' },
          customerId: { type: 'string', example: 'cust-1' },
          addressId: { type: 'string', example: 'addr-1' },
          deliveryAddress: { $ref: '#/components/schemas/DeliveryAddressSnapshot' },
          status: { type: 'string', example: 'CREATED' },
          totalAmount: { type: 'number', example: 799.8 },
          totalItems: { type: 'integer', example: 3 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    parameters: {
      customerId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID do cliente',
      },
      addressId: {
        name: 'addressId',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID do endereco',
      },
      phone: {
        name: 'phone',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'Telefone do cliente',
      },
      productId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: 'ID do produto',
      },
    },
  },
  paths: {
    '/customers': {
      post: {
        tags: ['Customers'],
        summary: 'Cria um cliente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCustomerInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Cliente criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Busca cliente por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/customerId' }],
        responses: {
          200: {
            description: 'Cliente encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
          404: {
            description: 'Cliente nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Customers'],
        summary: 'Atualiza cliente',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/customerId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCustomerInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Cliente atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Customers'],
        summary: 'Remove cliente',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/customerId' }],
        responses: {
          204: { description: 'Cliente removido' },
          404: {
            description: 'Cliente nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/customers/phone/{phone}': {
      get: {
        tags: ['Customers'],
        summary: 'Busca cliente por telefone',
        parameters: [{ $ref: '#/components/parameters/phone' }],
        responses: {
          200: {
            description: 'Cliente encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
          404: {
            description: 'Cliente nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/customers/{id}/addresses': {
      post: {
        tags: ['Addresses'],
        summary: 'Cria endereco para o cliente',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/customerId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddressInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Endereco criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Address' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Cliente nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/customers/{id}/addresses/{addressId}': {
      put: {
        tags: ['Addresses'],
        summary: 'Atualiza endereco do cliente',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/customerId' }, { $ref: '#/components/parameters/addressId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddressInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Endereco atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Address' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Cliente ou endereco nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Addresses'],
        summary: 'Remove endereco do cliente',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/customerId' }, { $ref: '#/components/parameters/addressId' }],
        responses: {
          204: { description: 'Endereco removido' },
          404: {
            description: 'Cliente ou endereco nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/products': {
      post: {
        tags: ['Products'],
        summary: 'Cria um produto',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Produto criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Products'],
        summary: 'Lista produtos ou busca por nome',
        parameters: [
          {
            name: 'name',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Nome do produto para filtro parcial',
          },
          {
            name: 'isActive',
            in: 'query',
            required: false,
            schema: { type: 'boolean' },
            description: 'Filtra produtos por status ativo (true) ou inativo (false)',
          },
        ],
        responses: {
          200: {
            description: 'Lista de produtos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Busca produto por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/productId' }],
        responses: {
          200: {
            description: 'Produto encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          404: {
            description: 'Produto nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Products'],
        summary: 'Atualiza produto',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/productId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProductInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Produto atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Produto nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Remove produto',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/productId' }],
        responses: {
          204: { description: 'Produto removido' },
          404: {
            description: 'Produto nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/products/{id}/status': {
      patch: {
        tags: ['Products'],
        summary: 'Atualiza status do produto',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/productId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductStatusInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Status do produto atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          404: {
            description: 'Produto nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Cria pedido com baixa de estoque transacional',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrderInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Pedido criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Cliente ou produto nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Lista pedidos (geral ou por cliente)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'customerId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filtra pedidos de um cliente',
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['CREATED', 'SENT', 'COMPLETED', 'CANCELED'] },
            description: 'Filtra por status do pedido',
          },
          {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date-time' },
            description: 'Data inicial de criação do pedido (ISO ou YYYY-MM-DD)',
          },
          {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date-time' },
            description: 'Data final de criação do pedido (ISO ou YYYY-MM-DD)',
          },
        ],
        responses: {
          200: {
            description: 'Lista de pedidos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/OrderSummary' },
                },
              },
            },
          },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Busca pedido por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Pedido encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
          404: {
            description: 'Pedido nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Atualiza status do pedido',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderStatusInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Status atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Pedido nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/orders/customer/{customerId}': {
      get: {
        tags: ['Orders'],
        summary: 'Lista pedidos por cliente (rota dedicada com GSI)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'customerId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['CREATED', 'SENT', 'COMPLETED', 'CANCELED'] },
            description: 'Filtra por status do pedido',
          },
          {
            name: 'dateFrom',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date-time' },
            description: 'Data inicial de criação do pedido (ISO ou YYYY-MM-DD)',
          },
          {
            name: 'dateTo',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'date-time' },
            description: 'Data final de criação do pedido (ISO ou YYYY-MM-DD)',
          },
        ],
        responses: {
          200: {
            description: 'Lista de pedidos do cliente',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Order' },
                },
              },
            },
          },
        },
      },
    },
    '/auth/users/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registra usuário administrador',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário registrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Erro de validação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/users/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica usuário administrador (email/senha)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserLoginInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Autenticação realizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/customers/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica cliente (telefone)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CustomerLoginInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Autenticação realizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          401: {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Busca dados do usuário autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Dados do usuário',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MeResponse' },
              },
            },
          },
          401: {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};
