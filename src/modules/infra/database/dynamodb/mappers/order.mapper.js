import { Order } from '../../../../domain/entities/order.js';
import { OrderItem } from '../../../../domain/entities/order-item.js';

function toCents(value) {
  return String(Math.round(Number(value) * 100));
}

function fromCents(value) {
  return Number(value) / 100;
}

export function toOrderProfileItem(order) {
  const createdAt = order.createdAt;
  const sortKey = `${createdAt}#${order.id}`;

  return {
    PK: `ORDER#${order.id}`,
    SK: 'PROFILE',
    type: 'ORDER',
    orderId: order.id,
    customerId: order.customerId,
    addressId: order.addressId,
    deliveryAddress: order.deliveryAddress,
    status: order.status,
    totalAmount: toCents(order.getTotalAmount()),
    totalItems: String(order.getTotalItems()),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    AO_PK: 'ORDER',
    AO_SK: sortKey,
    OC_PK: `CUSTOMER#${order.customerId}`,
    OC_SK: sortKey,
  };
}

export function toOrderItem(order, item) {
  return {
    PK: `ORDER#${order.id}`,
    SK: `ITEM#${item.productId}`,
    type: 'ORDER_ITEM',
    orderId: order.id,
    customerId: order.customerId,
    productId: item.productId,
    productName: item.productName,
    quantity: String(item.quantity),
    unitPrice: toCents(item.unitPrice.toNumber()),
    lineTotal: toCents(item.getLineTotal()),
    createdAt: order.createdAt,
  };
}

export function toOrderSummary(item) {
  if (!item) return null;

  return {
    id: item.orderId,
    customerId: item.customerId,
    addressId: item.addressId,
    deliveryAddress: item.deliveryAddress,
    status: item.status,
    totalAmount: fromCents(item.totalAmount),
    totalItems: Number(item.totalItems),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function toDomainOrder(orderProfileItem, orderItems = []) {
  if (!orderProfileItem) return null;

  const items = orderItems.map(
    (item) =>
      new OrderItem({
        productId: item.productId,
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: fromCents(item.unitPrice),
      }),
  );

  return new Order({
    id: orderProfileItem.orderId,
    customerId: orderProfileItem.customerId,
    addressId: orderProfileItem.addressId,
    deliveryAddress: orderProfileItem.deliveryAddress,
    items,
    status: orderProfileItem.status,
    createdAt: orderProfileItem.createdAt,
    updatedAt: orderProfileItem.updatedAt,
  });
}
