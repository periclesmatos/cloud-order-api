import 'dotenv/config';
import express from 'express';
import { CustomerService } from './modules/application/service/customer.service.js';
import { CustomerDynamoDBRepository } from './modules/infra/database/dynamodb/customer.repository.js';
import { UuidGenerator } from './modules/shared/providers/uuid-generator.js';
import { logger } from './modules/shared/logger/console-logger.js';
import { CustomerController } from './modules/presentation/http/controllers/customer.controller.js';
import { createHttpRoutes } from './modules/presentation/http/routes/index.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './modules/presentation/http/docs/swagger.js';

const app = express();
app.use(express.json());

// Providers
const uuidGenerator       = new UuidGenerator();
// Customers
const customerRepository  = new CustomerDynamoDBRepository();
const customerService     = new CustomerService(customerRepository, uuidGenerator);
const customerController  = new CustomerController(customerService);


app.use(createHttpRoutes({ customerController }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info('App', `API rodando em http://localhost:${port}`));

export default app;
