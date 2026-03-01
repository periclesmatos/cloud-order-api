import { Address } from '../../domain/entities/address.js';
import { Customer } from '../../domain/entities/customer.js';
import { ValidationError } from '../../domain/errors/validation.error.js';
import { Phone } from '../../domain/value-object/phone.js';

export class CustomerService {
  constructor(customerRepository, uuidGenerator) {
    this.customerRepository = customerRepository;
    this.uuidGenerator = uuidGenerator;
  }

  async createCustomer(customer_data) {
    const { name, email, phone } = customer_data;
    const normalizedPhone = new Phone(phone).toString();
    const existingCustomerByPhone = await this.customerRepository.findByPhone(normalizedPhone);
    if (existingCustomerByPhone) {
      throw new ValidationError('Telefone já cadastrado para outro cliente');
    }
    const id = this.uuidGenerator.generate();
    const customer = Customer.create({ id, name, email, phone: normalizedPhone });
    const savedCustomer = await this.customerRepository.saveCustomer(customer);
    return savedCustomer;
  }

  async getCustomerById(customer_id) {
    const customer = await this.customerRepository.findById(customer_id);
    return customer;
  }

  async getCustomerByPhone(phone) {
    const normalizedPhone = new Phone(phone).toString();
    const customer = await this.customerRepository.findByPhone(normalizedPhone);
    return customer;
  }

  async updateCustomer(customer_id, update_data) {
    const customer = await this.customerRepository.findById(customer_id);
    if (!customer) {
      throw new ValidationError('Cliente não encontrado');
    }
    const previousPhone = customer.phone.toString();
    const { name, email, phone } = update_data;
    
    if (phone) {
      const normalizedPhone = new Phone(phone).toString();
      if (normalizedPhone !== customer.phone.toString()) {
        const existingCustomerByPhone = await this.customerRepository.findByPhone(normalizedPhone);
        if (existingCustomerByPhone && existingCustomerByPhone.id !== customer_id) {
          throw new ValidationError('Telefone já cadastrado para outro cliente');
        }
        customer.changePhone(normalizedPhone);
      }
    }
    if (name) customer.changeName(name);
    if (email) customer.changeEmail(email);

    const updatedCustomer = await this.customerRepository.update(customer, previousPhone);
    return updatedCustomer;
  }

  async deleteCustomer(customer_id) {
    const customer = await this.customerRepository.findById(customer_id);
    if (!customer) {
      throw new ValidationError('Cliente não encontrado');
    }
    await this.customerRepository.deleteCustomerCascade(customer_id);
  }

  async listCustomers() {
    const customers = await this.customerRepository.findAll();
    return customers;
  }

  async createAddress(customer_id, address_data) {
    const customer = await this.customerRepository.findById(customer_id);
    if (!customer) {
      throw new ValidationError('Cliente não encontrado');
    }

    const addressId = this.uuidGenerator.generate();
    const address = Address.create({
      id: addressId,
      customerId: customer_id,
      ...address_data,
    });

    return await this.customerRepository.saveAddress(address);
  }

  async updateAddress(customer_id, address_id, update_data) {
    const customer = await this.customerRepository.findById(customer_id);
    if (!customer) {
      throw new ValidationError('Cliente não encontrado');
    }

    const existingAddress = await this.customerRepository.findAddressById(customer_id, address_id);
    if (!existingAddress) {
      throw new ValidationError('Endereço não encontrado');
    }

    const updatedAddress = Address.create({
      id: existingAddress.id,
      customerId: existingAddress.customerId,
      street: update_data.street ?? existingAddress.street,
      neighborhood: update_data.neighborhood ?? existingAddress.neighborhood,
      city: update_data.city ?? existingAddress.city,
      state: update_data.state ?? existingAddress.state,
      postalCode: update_data.postalCode ?? existingAddress.postalCode,
      country: update_data.country ?? existingAddress.country,
      complement: update_data.complement ?? existingAddress.complement,
      createdAt: existingAddress.createdAt,
    });

    return await this.customerRepository.updateAddress(updatedAddress);
  }

  async deleteAddress(customer_id, address_id) {
    const customer = await this.customerRepository.findById(customer_id);
    if (!customer) {
      throw new ValidationError('Cliente não encontrado');
    }

    const existingAddress = await this.customerRepository.findAddressById(customer_id, address_id);
    if (!existingAddress) {
      throw new ValidationError('Endereço não encontrado');
    }

    await this.customerRepository.deleteAddress(customer_id, address_id);
  }
}
