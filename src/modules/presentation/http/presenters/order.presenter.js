export function toHttpOrderItem(item) {
  return {
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    lineTotal: item.getLineTotal(),
  };
}

export function toHttpOrder(order) {
  return {
    id: order.id,
    customerId: order.customerId,
    addressId: order.addressId,
    deliveryAddress: order.deliveryAddress,
    status: order.status,
    totalAmount: order.getTotalAmount(),
    totalItems: order.getTotalItems(),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map(toHttpOrderItem),
  };
}

export function toHttpOrderSummary(orderSummary) {
  return {
    id: orderSummary.id,
    customerId: orderSummary.customerId,
    addressId: orderSummary.addressId,
    deliveryAddress: orderSummary.deliveryAddress,
    status: orderSummary.status,
    totalAmount: orderSummary.totalAmount,
    totalItems: orderSummary.totalItems,
    createdAt: orderSummary.createdAt,
    updatedAt: orderSummary.updatedAt,
  };
}
