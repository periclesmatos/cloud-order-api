import { Address } from '../../../../domain/entities/address.js';
import { Customer } from '../../../../domain/entities/customer.js';

export function toCustomerItem(customer) {
  return {
    PK: `CUSTOMER#${customer.id}`,
    SK: 'PROFILE',
    type: 'CUSTOMER',
    customerId: customer.id,
    name: customer.name,
    email: customer.email.toString(),
    phone: customer.phone.toString(),
    createdAt: customer.createdAt,
    LKP_PK: `PHONE#${customer.phone.toString()}`,
    LKP_SK: `CUSTOMER#${customer.id}`,
  };
}

export function toCustomerAddressItem(address) {
  return {
    PK: `CUSTOMER#${address.customerId}`,
    SK: `ADDRESS#${address.id}`,
    type: 'CUSTOMER_ADDRESS',
    addressId: address.id,
    customerId: address.customerId,
    street: address.street,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode.toString(),
    country: address.country,
    complement: address.complement,
    createdAt: address.createdAt,
  };
}

export function toPhoneLockItem(customer) {
  return {
    PK: `PHONE#${customer.phone.toString()}`,
    SK: 'LOCK',
    type: 'PhoneLock',
    customerId: customer.id,
    createdAt: new Date().toISOString(),
  };
}

export function toDomainCustomer(item) {
  if (!item) return null;

  return Customer.create({
    id: item.customerId,
    name: item.name,
    email: item.email,
    phone: item.phone,
    createdAt: item.createdAt,
    addresses: [],
  });
}

export function toDomainAddress(item) {
  if (!item) return null;

  return Address.create({
    id: item.addressId ?? item.id,
    customerId: item.customerId,
    street: item.street,
    neighborhood: item.neighborhood,
    city: item.city,
    state: item.state,
    postalCode: item.postalCode,
    country: item.country,
    complement: item.complement,
    createdAt: item.createdAt,
  });
}
