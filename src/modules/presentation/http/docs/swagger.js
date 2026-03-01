export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Cloud Order - Customer API',
    version: '1.0.0',
    description: 'Documentacao dos endpoints de clientes e enderecos.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Health', description: 'Status da API' },
    { name: 'Customers', description: 'Operacoes de cliente' },
    { name: 'Addresses', description: 'Operacoes de endereco' },
  ],
  components: {
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
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Verifica status da API',
        responses: {
          200: {
            description: 'Servidor ativo',
            content: {
              'text/plain': {
                schema: { type: 'string', example: 'SERVER IS RUNNING' },
              },
            },
          },
        },
      },
    },
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
        parameters: [
          { $ref: '#/components/parameters/customerId' },
          { $ref: '#/components/parameters/addressId' },
        ],
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
        parameters: [
          { $ref: '#/components/parameters/customerId' },
          { $ref: '#/components/parameters/addressId' },
        ],
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
  },
};
