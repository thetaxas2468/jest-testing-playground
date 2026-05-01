const api = require('./api');

async function applyPromo(code, subtotal) {
  const promo = await api.validatePromo(code);
  if (!promo || !promo.valid) throw new Error('Invalid or expired promo code');
  const discount = parseFloat((subtotal * (promo.discountPercent / 100)).toFixed(2));
  return { discount, finalAmount: parseFloat((subtotal - discount).toFixed(2)) };
}

module.exports = { applyPromo };
