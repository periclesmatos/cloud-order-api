import { NotFoundError } from '../../../application/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { logger } from '../../../shared/logger/console-logger.js';
import { toHttpAddress, toHttpCustomer } from '../presenters/customer.presenter.js';

export class CustomerController {
  constructor(customerService) {
    this.customerService = customerService;
  }

  create = async (req, res) => {
    const { name, email, phone } = req.body;
    logger.info('CUSTOMER', 'CREATE REQUEST', { name, email, phone });

    const customer = await this.customerService.createCustomer({ name, email, phone });
    const response = toHttpCustomer(customer);
    logger.info('CUSTOMER', 'CREATE SUCCESS', { response });

    return res.status(201).json(response);
  };

  getById = async (req, res) => {
    const { id } = req.params;
    logger.info('CUSTOMER', 'GET BY ID REQUEST', { id });

    const customer = await this.customerService.getCustomerById(id);
    if (!customer) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const response = toHttpCustomer(customer);
    logger.info('CUSTOMER', 'GET BY ID SUCCESS', { id, response });

    return res.status(200).json(response);
  };

  getByPhone = async (req, res) => {
    const phone = req.params.phone;
    logger.info('CUSTOMER', 'GET BY PHONE REQUEST', { phone });

    if (!phone) {
      throw new ValidationError('Telefone é obrigatório');
    }

    const customer = await this.customerService.getCustomerByPhone(phone);
    if (!customer) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const response = toHttpCustomer(customer);
    logger.info('CUSTOMER', 'GET BY PHONE SUCCESS', { phone, response });

    return res.status(200).json(response);
  };

  getMe = async (req, res) => {
    const { sub: customerId } = req.auth;
    logger.info('CUSTOMER', 'GET ME REQUEST', { customerId });

    const customer = await this.customerService.getCustomerById(customerId);
    if (!customer) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const response = toHttpCustomer(customer);
    logger.info('CUSTOMER', 'GET ME SUCCESS', { customerId, response });

    return res.status(200).json(response);
  };

  update = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    logger.info('CUSTOMER', 'UPDATE REQUEST', { id, name, email, phone });

    const updatedCustomer = await this.customerService.updateCustomer(id, { name, email, phone });
    const response = toHttpCustomer(updatedCustomer);
    logger.info('CUSTOMER', 'UPDATE SUCCESS', { id, response });

    return res.status(200).json(response);
  };

  delete = async (req, res) => {
    const { id } = req.params;
    logger.info('CUSTOMER', 'DELETE REQUEST', { id });

    await this.customerService.deleteCustomer(id);
    logger.info('CUSTOMER', 'DELETE SUCCESS', { id });
    return res.status(204).send();
  };

  createAddress = async (req, res) => {
    const { id } = req.params;
    logger.info('CUSTOMER', 'CREATE ADDRESS REQUEST', { customerId: id, body: req.body });

    const address = await this.customerService.createAddress(id, req.body);
    logger.info('CUSTOMER', 'CREATE ADDRESS SUCCESS', { customerId: id, addressId: address.id });
    return res.status(201).json(toHttpAddress(address));
  };

  updateAddress = async (req, res) => {
    const { id, addressId } = req.params;
    logger.info('CUSTOMER', 'UPDATE ADDRESS REQUEST', { customerId: id, addressId, body: req.body });

    const address = await this.customerService.updateAddress(id, addressId, req.body);
    logger.info('CUSTOMER', 'UPDATE ADDRESS SUCCESS', { customerId: id, addressId });
    return res.status(200).json(toHttpAddress(address));
  };

  deleteAddress = async (req, res) => {
    const { id, addressId } = req.params;
    logger.info('CUSTOMER', 'DELETE ADDRESS REQUEST', { customerId: id, addressId });

    await this.customerService.deleteAddress(id, addressId);
    logger.info('CUSTOMER', 'DELETE ADDRESS SUCCESS', { customerId: id, addressId });
    return res.status(204).send();
  };
}
