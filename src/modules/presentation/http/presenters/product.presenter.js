export function toHttpProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: typeof product.price === 'number' ? product.price : Number(product.price),
    amount: typeof product.amount === 'number' ? product.amount : Number(product.amount),
    description: product.description,
    isActive: product.isActive,
    createdAt: product.createdAt,
  };
}