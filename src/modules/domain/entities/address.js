import { ValidationError } from '../errors/validation.error.js';
import { PostalCode } from '../value-object/postal-code.js';

export class Address {
  constructor({ customerId, id, street, neighborhood, city, state, postalCode, country, complement, createdAt }) {
    this.customerId = customerId;
    this.id = id;
    this.street = street;
    this.neighborhood = neighborhood;
    this.city = city;
    this.state = state;
    this.postalCode = new PostalCode(postalCode);
    this.country = country;
    this.complement = complement;
    this.createdAt = createdAt ?? new Date().toISOString();
  }

  static create({ customerId, id, street, neighborhood, city, state, postalCode, country, complement, createdAt }) {
    if (!customerId) throw new ValidationError('ID do cliente é obrigatório');
    if (!id) throw new ValidationError('ID do endereço é obrigatório');
    if (!street) throw new ValidationError('Rua é obrigatória');
    if (!neighborhood) throw new ValidationError('Bairro é obrigatório');
    if (!city) throw new ValidationError('Cidade é obrigatória');
    if (!state) throw new ValidationError('Estado é obrigatório');
    if (!postalCode) throw new ValidationError('CEP é obrigatório');
    if (!country) throw new ValidationError('País é obrigatório');

    return new Address({ customerId, id, street, neighborhood, city, state, postalCode, country, complement, createdAt });
  }
}
