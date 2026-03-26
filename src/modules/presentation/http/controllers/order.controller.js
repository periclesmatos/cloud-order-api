import { logger } from '../../../shared/logger/console-logger.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { toHttpOrder, toHttpOrderSummary } from '../presenters/order.presenter.js';
import { ForbiddenError } from '../../../application/errors/forbidden.error.js';

const ALLOWED_STATUS = ['CREATED', 'SENT', 'COMPLETED', 'CANCELED'];

function normalizeDate(value, fieldName, endOfDay = false) {
  if (!value) return undefined;

  const hasExplicitTime = value.includes('T');
  const normalizedValue = !hasExplicitTime && endOfDay ? `${value}T23:59:59.999Z` : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} inválida`);
  }
  return date.toISOString();
}

function parseOrderFilters(query = {}) {
  const { status, dateFrom, dateTo } = query;

  if (status && !ALLOWED_STATUS.includes(status)) {
    throw new ValidationError('status inválido');
  }

  const parsedDateFrom = normalizeDate(dateFrom, 'dateFrom');
  const parsedDateTo = normalizeDate(dateTo, 'dateTo', true);

  if (parsedDateFrom && parsedDateTo && parsedDateFrom > parsedDateTo) {
    throw new ValidationError('dateFrom não pode ser maior que dateTo');
  }

  return {
    status,
    dateFrom: parsedDateFrom,
    dateTo: parsedDateTo,
  };
}

export class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }

  create = async (req, res) => {
    const { customerId, addressId, items } = req.body;
    const auth = req.auth;
    if (auth?.type === 'CUSTOMER' && auth.sub !== customerId) {
      throw new ForbiddenError('Cliente só pode criar pedido para si mesmo');
    }
    logger.info('ORDER', 'CREATE REQUEST', { customerId, addressId, itemsCount: items?.length ?? 0 });

    const order = await this.orderService.createOrder({ customerId, addressId, items });
    const response = toHttpOrder(order);
    logger.info('ORDER', 'CREATE SUCCESS', { id: response.id, customerId: response.customerId });
    return res.status(201).json(response);
  };

  getById = async (req, res) => {
    const { id } = req.params;
    logger.info('ORDER', 'GET BY ID REQUEST', { id });

    const order = await this.orderService.getOrderById(id);
    const auth = req.auth;
    if (auth?.type === 'CUSTOMER' && auth.sub !== order.customerId) {
      throw new ForbiddenError('Você não pode consultar pedido de outro cliente');
    }

    const response = toHttpOrder(order);
    logger.info('ORDER', 'GET BY ID SUCCESS', { id });
    return res.status(200).json(response);
  };

  getByCustomerId = async (req, res) => {
    const { customerId } = req.params;
    const auth = req.auth;
    if (auth?.type === 'CUSTOMER' && auth.sub !== customerId) {
      throw new ForbiddenError('Você não pode consultar pedidos de outro cliente');
    }

    const filters = parseOrderFilters(req.query);
    logger.info('ORDER', 'GET BY CUSTOMER REQUEST', { customerId, ...filters });

    const orders = await this.orderService.listOrdersByCustomer(customerId, filters);
    const response = orders.map(toHttpOrder);
    logger.info('ORDER', 'GET BY CUSTOMER SUCCESS', { customerId, count: response.length });
    return res.status(200).json(response);
  };

  getMe = async (req, res) => {
    const { sub: customerId } = req.auth;
    const filters = parseOrderFilters(req.query);
    logger.info('ORDER', 'GET ME REQUEST', { customerId, ...filters });

    const orders = await this.orderService.listOrdersByCustomer(customerId, filters);
    const response = orders.map(toHttpOrder);
    logger.info('ORDER', 'GET ME SUCCESS', { customerId, count: response.length });
    return res.status(200).json(response);
  };

  updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const auth = req.auth;

    logger.info('ORDER', 'UPDATE STATUS REQUEST', { id, status });

    // Se é cliente, aplica regras específicas
    if (auth?.type === 'CUSTOMER') {
      const order = await this.orderService.getOrderById(id);

      // Verifica se é dono do pedido
      if (order.customerId !== auth.sub) {
        throw new ForbiddenError('Você não pode atualizar pedido de outro cliente');
      }

      // Cliente só pode cancelar pedidos em status CREATED
      if (status === 'CANCELED' && order.status !== 'CREATED') {
        throw new ForbiddenError('Apenas pedidos criados podem ser cancelados por clientes');
      }

      // Cliente só pode cancelar, nenhum outro status
      if (status !== 'CANCELED') {
        throw new ForbiddenError('Clientes só podem cancelar pedidos');
      }
    }

    const order = await this.orderService.updateOrderStatus(id, status);
    const response = toHttpOrder(order);
    logger.info('ORDER', 'UPDATE STATUS SUCCESS', { id, status: response.status });
    return res.status(200).json(response);
  };

  getAll = async (req, res) => {
    const auth = req.auth;
    const requestedCustomerId = req.query.customerId;
    if (auth?.type === 'CUSTOMER' && requestedCustomerId && requestedCustomerId !== auth.sub) {
      throw new ForbiddenError('Você não pode filtrar pedidos de outro cliente');
    }

    const customerId = auth?.type === 'CUSTOMER' ? auth.sub : requestedCustomerId;
    const filters = parseOrderFilters(req.query);
    logger.info('ORDER', 'GET ALL REQUEST', { customerId, ...filters });

    const orders = await this.orderService.listOrders({ customerId, ...filters });
    const response = orders.map(toHttpOrderSummary);
    logger.info('ORDER', 'GET ALL SUCCESS', { customerId, count: response.length });
    return res.status(200).json(response);
  };
}
