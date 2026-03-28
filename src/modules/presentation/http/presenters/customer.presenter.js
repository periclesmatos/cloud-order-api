export function toHttpAddress(address) {
  return {
    id: address.id,
    customerId: address.customerId,
    street: address.street,
    neighborhood: address.neighborhood,
    city: address.city,
    state: address.state,
    postalCode: typeof address.postalCode === 'string' ? address.postalCode : address.postalCode?.toString?.(),
    complement: address.complement,
    createdAt: address.createdAt,
  };
}

export function toHttpCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: typeof customer.email === 'string' ? customer.email : customer.email?.toString?.(),
    phone: typeof customer.phone === 'string' ? customer.phone : customer.phone?.toString?.(),
    createdAt: customer.createdAt,
    addresses: (customer.addresses ?? []).map(toHttpAddress),
  };
}
