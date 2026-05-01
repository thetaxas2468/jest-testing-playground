jest.mock('../../src/deliveryApp/api');

const api = require('../../src/deliveryApp/api');
const { placeOrder } = require('../../src/deliveryApp/orderService');

const VALID_ADDRESS = { street: '123 Main St', city: 'London' };
const CART = [{ id: 'item-1', name: 'Burger', price: 10, quantity: 1 }];

beforeEach(() => jest.clearAllMocks());

describe('payment — accepted methods', () => {
  test('accepts card payment', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    const result = await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(result.status).toBe('confirmed');
    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ paymentMethod: 'card' }));
  });

  test('accepts cash on delivery', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-002', status: 'confirmed' });

    const result = await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'cash' });

    expect(result.status).toBe('confirmed');
    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ paymentMethod: 'cash' }));
  });
});

describe('payment — failures', () => {
  test('throws when payment is declined by the bank', async () => {
    api.placeOrder.mockRejectedValue(new Error('Payment declined'));

    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' })
    ).rejects.toThrow('Payment declined');
  });

  test('throws when no payment method is provided', async () => {
    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: null })
    ).rejects.toThrow('Payment method is required');

    expect(api.placeOrder).not.toHaveBeenCalled();
  });

  test('throws when payment method is undefined', async () => {
    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS })
    ).rejects.toThrow('Payment method is required');

    expect(api.placeOrder).not.toHaveBeenCalled();
  });
});

describe('payment — double-charge prevention', () => {
  test('api.placeOrder is called exactly once per order', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(api.placeOrder).toHaveBeenCalledTimes(1);
  });

  test('two concurrent place-order calls each reach the API once (backend handles deduplication)', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    const payload = { userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' };
    const [r1, r2] = await Promise.all([placeOrder(payload), placeOrder(payload)]);

    expect(r1.status).toBe('confirmed');
    expect(r2.status).toBe('confirmed');
    expect(api.placeOrder).toHaveBeenCalledTimes(2);
  });
});
