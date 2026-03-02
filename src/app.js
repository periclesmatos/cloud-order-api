import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { UuidGenerator } from './modules/shared/providers/uuid-generator.js';
import { CustomerDynamoDBRepository } from './modules/infra/database/dynamodb/customer.repository.js';
import { ProductDynamoDBRepository } from './modules/infra/database/dynamodb/product.repositoy.js';
import { CustomerService } from './modules/application/service/customer.service.js';
import { CustomerController } from './modules/presentation/http/controllers/customer.controller.js';
import { createHttpRoutes } from './modules/presentation/http/routes/index.js';
import { swaggerSpec } from './modules/presentation/http/docs/swagger.js';
import { logger } from './modules/shared/logger/console-logger.js';

const app = express();
app.use(express.json());

// Providers
const uuidGenerator       = new UuidGenerator();
// Customers
const customerRepository  = new CustomerDynamoDBRepository();
const customerService     = new CustomerService(customerRepository, uuidGenerator);
const customerController  = new CustomerController(customerService);
// Products
const productRepository   = new ProductDynamoDBRepository();
const productService      = new ProductService(productRepository, uuidGenerator);
const productController   = new ProductController(productService);
// Routes
app.use(createHttpRoutes({ customerController, productController }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => logger.info('App', `API rodando em http://localhost:${port}`));

export default app;
