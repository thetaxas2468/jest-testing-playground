const api = require('./api');
const { getSubtotal, isEmpty } = require('./cart');
const { calculateDeliveryFee, validateAddress } = require('./deliveryService');

async function placeOrder({ userId, cart, address, paymentMethod, promoDiscount = 0 }) {
  if (isEmpty(cart)) throw new Error('Cart is empty');
  validateAddress(address);
  if (!paymentMethod) throw new Error('Payment method is required');

  const subtotal = getSubtotal(cart);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = parseFloat((subtotal + deliveryFee - promoDiscount).toFixed(2));

  return api.placeOrder({ userId, cart, address, paymentMethod, total });
}

async function getOrderHistory(userId) {
  return api.getOrderHistory(userId);
}

module.exports = { placeOrder, getOrderHistory };
