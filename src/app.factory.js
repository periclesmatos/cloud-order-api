import express from 'express';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { UuidGenerator } from './modules/shared/providers/uuid-generator.js';
import { CustomerDynamoDBRepository } from './modules/infra/database/dynamodb/customer.repository.js';
import { OrderDynamoDBRepository } from './modules/infra/database/dynamodb/order.repository.js';
import { ProductDynamoDBRepository } from './modules/infra/database/dynamodb/product.repositoy.js';
import { UserDynamoDBRepository } from './modules/infra/database/dynamodb/user.repository.js';
import { CustomerController } from './modules/presentation/http/controllers/customer.controller.js';
import { CustomerService } from './modules/application/service/customer.service.js';
import { OrderService } from './modules/application/service/order.service.js';
import { ProductController } from './modules/presentation/http/controllers/product.controller.js';
import { ProductService } from './modules/application/service/porduct.service.js';
import { OrderController } from './modules/presentation/http/controllers/order.controller.js';
import { AuthService } from './modules/application/service/auth.service.js';
import { AuthController } from './modules/presentation/http/controllers/auth.controller.js';
import { createHttpRoutes } from './modules/presentation/http/routes/index.js';
import { swaggerSpec } from './modules/presentation/http/docs/swagger.js';
import { httpErrorHandler } from './modules/presentation/http/middlewares/error-handler.js';
import { PasswordHasher } from './modules/shared/providers/password-hasher.js';
import { TokenService } from './modules/shared/providers/token-service.js';

export function createDependencies() {
  const uuidGenerator = new UuidGenerator();
  const passwordHasher = new PasswordHasher();
  const tokenService = new TokenService();

  const customerRepository = new CustomerDynamoDBRepository();
  const customerService = new CustomerService(customerRepository, uuidGenerator);
  const customerController = new CustomerController(customerService);

  const productRepository = new ProductDynamoDBRepository();
  const productService = new ProductService(productRepository, uuidGenerator);
  const productController = new ProductController(productService);

  const orderRepository = new OrderDynamoDBRepository();
  const orderService = new OrderService(orderRepository, customerRepository, productRepository, uuidGenerator);
  const orderController = new OrderController(orderService);

  const userRepository = new UserDynamoDBRepository();
  const authService = new AuthService(userRepository, customerRepository, uuidGenerator, passwordHasher, tokenService);
  const authController = new AuthController(authService);

  return {
    customerController,
    productController,
    orderController,
    authController,
  };
}

export function createApp(dependencies = createDependencies()) {
  const parsePositiveInteger = (value, fallback) => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  };

  const rateLimitWindowMs = parsePositiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
  const rateLimitMax = parsePositiveInteger(process.env.RATE_LIMIT_MAX, 100);
  const authRateLimitWindowMs = parsePositiveInteger(
    process.env.AUTH_RATE_LIMIT_WINDOW_MS,
    15 * 60 * 1000,
  );
  const authRateLimitMax = parsePositiveInteger(process.env.AUTH_RATE_LIMIT_MAX, 10);

  const globalRateLimiter = rateLimit({
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many requests. Please try again later.',
    },
  });

  const authRateLimiter = rateLimit({
    windowMs: authRateLimitWindowMs,
    max: authRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many authentication attempts. Please try again later.',
    },
  });

  const app = express();

  // CORS middleware
  app.use((req, res, next) => {
    const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    const requestHost = req.headers.host?.split(':')?.[0];
    const inferredOrigins = requestHost ? [`http://${requestHost}:8080`, `https://${requestHost}:8080`] : [];

    const allowedOrigins = [...configuredOrigins, ...inferredOrigins];

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  app.use(express.json());
  app.use(globalRateLimiter);
  app.use('/auth', authRateLimiter);
  app.use('/', swaggerUi.serve);
  app.get('/', swaggerUi.setup(swaggerSpec));
  app.use(createHttpRoutes(dependencies));
  app.use(httpErrorHandler);
  return app;
}
