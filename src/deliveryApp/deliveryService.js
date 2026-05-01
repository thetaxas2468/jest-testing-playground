const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 30;

function calculateDeliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

function validateAddress(address) {
  if (!address || !address.street || !address.city) {
    throw new Error('Delivery address is incomplete');
  }
}

module.exports = { calculateDeliveryFee, validateAddress, DELIVERY_FEE, FREE_DELIVERY_THRESHOLD };
