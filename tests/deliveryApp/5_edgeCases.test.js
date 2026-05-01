jest.mock('../../src/deliveryApp/api');

const api = require('../../src/deliveryApp/api');
const { placeOrder } = require('../../src/deliveryApp/orderService');
const { applyPromo } = require('../../src/deliveryApp/promoService');

const VALID_ADDRESS = { street: '123 Main St', city: 'London' };

beforeEach(() => jest.clearAllMocks());

describe('edge cases — large orders', () => {
  test('handles a cart with 50 different items', async () => {
    const bigCart = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`, name: `Item ${i}`, price: 1, quantity: 1,
    }));
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-BIG', status: 'confirmed' });

    const result = await placeOrder({ userId: 'u1', cart: bigCart, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(result.orderId).toBe('ORD-BIG');
    // 50 * $1 = $50 — above $30 threshold, free delivery
    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 50 }));
  });

  test('handles a single item with quantity 100', async () => {
    const cart = [{ id: 'item-1', name: 'Burger', price: 9.99, quantity: 100 }];
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-100', status: 'confirmed' });

    await placeOrder({ userId: 'u1', cart, address: VALID_ADDRESS, paymentMethod: 'card' });

    // 100 * $9.99 = $999, free delivery
    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 999 }));
  });
});

describe('edge cases — free delivery boundary', () => {
  test('charges delivery fee when subtotal is $29.99 (just below $30 threshold)', async () => {
    const cart = [{ id: 'i1', name: 'Item', price: 29.99, quantity: 1 }];
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-X', status: 'confirmed' });

    await placeOrder({ userId: 'u1', cart, address: VALID_ADDRESS, paymentMethod: 'card' });

    // $29.99 + $3.99 delivery = $33.98
    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 33.98 }));
  });

  test('free delivery when subtotal is exactly $30.00', async () => {
    const cart = [{ id: 'i1', name: 'Item', price: 30, quantity: 1 }];
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-Y', status: 'confirmed' });

    await placeOrder({ userId: 'u1', cart, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 30 }));
  });
});

describe('edge cases — promo codes', () => {
  test('promo that expires mid-checkout fails on re-validation', async () => {
    api.validatePromo
      .mockResolvedValueOnce({ valid: true, discountPercent: 10 })
      .mockResolvedValueOnce({ valid: false });

    const { discount } = await applyPromo('SAVE10', 50);
    expect(discount).toBeCloseTo(5);

    await expect(applyPromo('SAVE10', 50)).rejects.toThrow('Invalid or expired promo code');
  });

  test('promo discount never makes the order total negative', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-Z', status: 'confirmed' });

    // $10 cart + $3.99 delivery = $13.99, promoDiscount of $5 → $8.99 (still positive)
    await placeOrder({ userId: 'u1', cart: [{ id: 'i1', name: 'Item', price: 10, quantity: 1 }], address: VALID_ADDRESS, paymentMethod: 'card', promoDiscount: 5 });

    const total = api.placeOrder.mock.calls[0][0].total;
    expect(total).toBeGreaterThan(0);
  });
});

describe('edge cases — quantity boundaries', () => {
  test('an item with quantity 0 effectively costs $0 (empty-like)', () => {
    const { getSubtotal } = require('../../src/deliveryApp/cart');
    const cart = [{ id: 'i1', price: 10, quantity: 0 }];
    expect(getSubtotal(cart)).toBe(0);
  });
});

describe('edge cases — very long delivery address', () => {
  test('accepts a street address of 500 characters', async () => {
    const longAddress = { street: 'A'.repeat(500), city: 'London' };
    const cart = [{ id: 'i1', name: 'Burger', price: 10, quantity: 1 }];
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-LONG', status: 'confirmed' });

    const result = await placeOrder({ userId: 'u1', cart, address: longAddress, paymentMethod: 'card' });

    expect(result.orderId).toBe('ORD-LONG');
  });
});

describe('edge cases — double-click / concurrent orders', () => {
  test('two simultaneous placeOrder calls both resolve without crashing', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    const payload = { userId: 'u1', cart: [{ id: 'i1', name: 'Burger', price: 10, quantity: 1 }], address: VALID_ADDRESS, paymentMethod: 'card' };
    const [r1, r2] = await Promise.all([placeOrder(payload), placeOrder(payload)]);

    expect(r1.status).toBe('confirmed');
    expect(r2.status).toBe('confirmed');
  });
});
