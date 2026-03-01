import { ValidationError } from '../../../domain/errors/validation.error.js';
import { logger } from '../../../shared/logger/console-logger.js';
import { toHttpAddress, toHttpCustomer } from '../presenters/customer.presenter.js';

export class CustomerController {
  constructor(customerService) {
    this.customerService = customerService;
  }

  create = async (req, res) => {
    try {
      const { name, email, phone } = req.body;
      logger.info('CUSTOMER', 'CREATE REQUEST', { name, email, phone });

      const customer = await this.customerService.createCustomer({ name, email, phone });
      const response = toHttpCustomer(customer);
      logger.info('CUSTOMER', 'CREATE SUCCESS', { response });

      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('CUSTOMER', 'CREATE VALIDATION ERROR', { error: error.message });
        return res.status(400).json({ error: error.message });
      }
      logger.error('CUSTOMER', 'CREATE ERROR', { error });
      return res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  };

  getById = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info('CUSTOMER', 'GET BY ID REQUEST', { id });

      const customer = await this.customerService.getCustomerById(id);
      if (!customer) {
        logger.warn('CUSTOMER', 'GET BY ID NOT FOUND', { id });
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      const response = toHttpCustomer(customer);
      logger.info('CUSTOMER', 'GET BY ID SUCCESS', { id, response });

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('CUSTOMER', 'GET BY ID VALIDATION ERROR', { error: error.message });
        return res.status(400).json({ error: error.message });
      }
      logger.error('CUSTOMER', 'GET BY ID ERROR', { error });
      return res.status(500).json({ error: 'Não foi possível buscar o cliente' });
    }
  };


  getByPhone = async (req, res) => {
    try {
      const phone = req.params.phone;
      logger.info('CUSTOMER', 'GET BY PHONE REQUEST', { phone });

      if (!phone) {
        logger.warn('CUSTOMER', 'GET BY PHONE MISSING PHONE PARAMETER');
        return res.status(400).json({ error: 'Telefone é obrigatório' });
      }

      const customer = await this.customerService.getCustomerByPhone(phone);
      if (!customer) {
        logger.warn('CUSTOMER', 'GET BY PHONE NOT FOUND', { phone });
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      const response = toHttpCustomer(customer);
      logger.info('CUSTOMER', 'GET BY PHONE SUCCESS', { phone, response });

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('CUSTOMER', 'GET BY PHONE VALIDATION ERROR', { error: error.message });
        return res.status(400).json({ error: error.message });
      }
      logger.error('CUSTOMER', 'GET BY PHONE ERROR', { error });
      return res.status(500).json({ error: 'Não foi possível buscar o cliente' });
    }
  };

  update = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
      logger.info('CUSTOMER', 'UPDATE REQUEST', { id, name, email, phone });

      const updatedCustomer = await this.customerService.updateCustomer(id, { name, email, phone });
      const response = toHttpCustomer(updatedCustomer);
      logger.info('CUSTOMER', 'UPDATE SUCCESS', { id, response });

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('CUSTOMER', 'UPDATE VALIDATION ERROR', { error: error.message });
        return res.status(400).json({ error: error.message });
      }
      logger.error('CUSTOMER', 'UPDATE ERROR', { error });
      return res.status(500).json({ error: 'Não foi possível atualizar o cliente' });
    }
  };

  delete = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info('CUSTOMER', 'DELETE REQUEST', { id });

      await this.customerService.deleteCustomer(id);
      logger.info('CUSTOMER', 'DELETE SUCCESS', { id });
      return res.status(204).send();
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('CUSTOMER', 'DELETE VALIDATION ERROR', { error: error.message });
        return res.status(404).json({ error: error.message });
      }
      logger.error('CUSTOMER', 'DELETE ERROR', { error });
      return res.status(500).json({ error: 'Não foi possível excluir o cliente' });
    }
  };

  createAddress = async (req, res) => {
    try {
      const { id } = req.params;
      logger.info('CUSTOMER', 'CREATE ADDRESS REQUEST', { customerId: id, body: req.body });

      const address = await this.customerService.createAddress(id, req.body);
      logger.info('CUSTOMER', 'CREATE ADDRESS SUCCESS', { customerId: id, addressId: address.id });
      return res.status(201).json(toHttpAddress(address));
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('CUSTOMER', 'CREATE ADDRESS VALIDATION ERROR', { error: error.message });
        const statusCode = error.message === 'Cliente não encontrado' ? 404 : 400;
        return res.status(statusCode).json({ error: error.message });
      }
      logger.error('CUSTOMER', 'CREATE ADDRESS ERROR', { error });
      return res.status(500).json({ error: 'Não foi possível criar o endereço' });
    }
  };

  updateAddress = async (req, res) => {
    try {
      const { id, addressId } = req.params;
      logger.info('CUSTOMER', 'UPDATE ADDRESS REQUEST', { customerId: id, addressId, body: req.body });

      const address = await this.customerService.updateAddress(id, addressId, req.body);
      logger.info('CUSTOMER', 'UPDATE ADDRESS SUCCESS', { customerId: id, addressId });
      return res.status(200).json(toHttpAddress(address));
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('CUSTOMER', 'UPDATE ADDRESS VALIDATION ERROR', { error: error.message });
        const statusCode = error.message === 'Cliente não encontrado' || error.message === 'Endereço não encontrado' ? 404 : 400;
        return res.status(statusCode).json({ error: error.message });
      }
      logger.error('CUSTOMER', 'UPDATE ADDRESS ERROR', { error });
      return res.status(500).json({ error: 'Não foi possível atualizar o endereço' });
    }
  };

  deleteAddress = async (req, res) => {
    try {
      const { id, addressId } = req.params;
      logger.info('CUSTOMER', 'DELETE ADDRESS REQUEST', { customerId: id, addressId });

      await this.customerService.deleteAddress(id, addressId);
      logger.info('CUSTOMER', 'DELETE ADDRESS SUCCESS', { customerId: id, addressId });
      return res.status(204).send();
    } catch (error) {
      if (error instanceof ValidationError) {
        logger.warn('CUSTOMER', 'DELETE ADDRESS VALIDATION ERROR', { error: error.message });
        const statusCode = error.message === 'Cliente não encontrado' || error.message === 'Endereço não encontrado' ? 404 : 400;
        return res.status(statusCode).json({ error: error.message });
      }
      logger.error('CUSTOMER', 'DELETE ADDRESS ERROR', { error });
      return res.status(500).json({ error: 'Não foi possível excluir o endereço' });
    }
  };
}
