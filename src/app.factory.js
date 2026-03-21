import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { UuidGenerator } from './modules/shared/providers/uuid-generator.js';
import { CustomerDynamoDBRepository } from './modules/infra/database/dynamodb/customer.repository.js';
import { ProductDynamoDBRepository } from './modules/infra/database/dynamodb/product.repositoy.js';
import { CustomerController } from './modules/presentation/http/controllers/customer.controller.js';
import { CustomerService } from './modules/application/service/customer.service.js';
import { ProductController } from './modules/presentation/http/controllers/product.controller.js';
import { ProductService } from './modules/application/service/porduct.service.js';
import { createHttpRoutes } from './modules/presentation/http/routes/index.js';
import { swaggerSpec } from './modules/presentation/http/docs/swagger.js';
import { httpErrorHandler } from './modules/presentation/http/middlewares/error-handler.js';

export function createDependencies() {
  const uuidGenerator = new UuidGenerator();

  const customerRepository = new CustomerDynamoDBRepository();
  const customerService = new CustomerService(customerRepository, uuidGenerator);
  const customerController = new CustomerController(customerService);

  const productRepository = new ProductDynamoDBRepository();
  const productService = new ProductService(productRepository, uuidGenerator);
  const productController = new ProductController(productService);

  return {
    customerController,
    productController,
  };
}

export function createApp(dependencies = createDependencies()) {
  const app = express();
  app.use(express.json());
  app.use('/', swaggerUi.serve);
  app.get('/', swaggerUi.setup(swaggerSpec));
  app.use(createHttpRoutes(dependencies));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(httpErrorHandler);
  return app;
}
