import { logger } from '../../../shared/logger/console-logger.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { toHttpOrder, toHttpOrderSummary } from '../presenters/order.presenter.js';

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
    const response = toHttpOrder(order);
    logger.info('ORDER', 'GET BY ID SUCCESS', { id });
    return res.status(200).json(response);
  };

  getByCustomerId = async (req, res) => {
    const { customerId } = req.params;
    const filters = parseOrderFilters(req.query);
    logger.info('ORDER', 'GET BY CUSTOMER REQUEST', { customerId, ...filters });

    const orders = await this.orderService.listOrdersByCustomer(customerId, filters);
    const response = orders.map(toHttpOrder);
    logger.info('ORDER', 'GET BY CUSTOMER SUCCESS', { customerId, count: response.length });
    return res.status(200).json(response);
  };

  updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    logger.info('ORDER', 'UPDATE STATUS REQUEST', { id, status });

    const order = await this.orderService.updateOrderStatus(id, status);
    const response = toHttpOrder(order);
    logger.info('ORDER', 'UPDATE STATUS SUCCESS', { id, status: response.status });
    return res.status(200).json(response);
  };

  getAll = async (req, res) => {
    const customerId = req.query.customerId;
    const filters = parseOrderFilters(req.query);
    logger.info('ORDER', 'GET ALL REQUEST', { customerId, ...filters });

    const orders = await this.orderService.listOrders({ customerId, ...filters });
    const response = orders.map(toHttpOrderSummary);
    logger.info('ORDER', 'GET ALL SUCCESS', { customerId, count: response.length });
    return res.status(200).json(response);
  };
}
