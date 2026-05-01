function addItem(cart, item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    return cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
  }
  return [...cart, { ...item, quantity: 1 }];
}

function removeItem(cart, itemId) {
  return cart.filter(i => i.id !== itemId);
}

function updateQuantity(cart, itemId, quantity) {
  if (quantity <= 0) return cart.filter(i => i.id !== itemId);
  return cart.map(i => i.id === itemId ? { ...i, quantity } : i);
}

function getSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function isEmpty(cart) {
  return !cart || cart.length === 0;
}

module.exports = { addItem, removeItem, updateQuantity, getSubtotal, isEmpty };
