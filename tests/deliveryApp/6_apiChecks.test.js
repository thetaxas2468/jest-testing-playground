jest.mock('../../src/deliveryApp/api');

const api = require('../../src/deliveryApp/api');
const { placeOrder, getOrderHistory } = require('../../src/deliveryApp/orderService');
const { getRestaurants, getMenu } = require('../../src/deliveryApp/restaurantService');
const { applyPromo } = require('../../src/deliveryApp/promoService');

const VALID_ADDRESS = { street: '123 Main St', city: 'London' };
const CART = [{ id: 'item-1', name: 'Burger', price: 10, quantity: 1 }];

beforeEach(() => jest.clearAllMocks());

describe('API contract — placeOrder', () => {
  test('sends all required fields to the API', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(api.placeOrder).toHaveBeenCalledWith({
      userId: 'u1',
      cart: CART,
      address: VALID_ADDRESS,
      paymentMethod: 'card',
      total: 13.99, // $10 + $3.99 delivery
    });
  });

  test('returns confirmed status on success', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    const result = await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(result.status).toBe('confirmed');
  });

  test('returns a string order ID on success', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-999', status: 'confirmed' });

    const result = await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(result.orderId).toBeDefined();
    expect(typeof result.orderId).toBe('string');
  });

  test('propagates server errors to the caller', async () => {
    api.placeOrder.mockRejectedValue(new Error('Internal server error'));

    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' })
    ).rejects.toThrow('Internal server error');
  });

  test('is called exactly once per order', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(api.placeOrder).toHaveBeenCalledTimes(1);
  });
});

describe('API contract — getOrderHistory', () => {
  test('calls getOrderHistory with the correct user ID', async () => {
    api.getOrderHistory.mockResolvedValue([]);

    await getOrderHistory('user-42');

    expect(api.getOrderHistory).toHaveBeenCalledWith('user-42');
  });

  test('returns an array', async () => {
    api.getOrderHistory.mockResolvedValue([
      { orderId: 'ORD-001', status: 'delivered' },
    ]);

    const history = await getOrderHistory('u1');

    expect(Array.isArray(history)).toBe(true);
  });

  test('each history entry contains an orderId and status', async () => {
    api.getOrderHistory.mockResolvedValue([
      { orderId: 'ORD-001', status: 'delivered' },
    ]);

    const history = await getOrderHistory('u1');

    expect(history[0]).toHaveProperty('orderId');
    expect(history[0]).toHaveProperty('status');
  });
});

describe('API contract — getMenu', () => {
  test('calls getMenu with the restaurant ID', async () => {
    api.getMenu.mockResolvedValue([]);

    await getMenu('r1');

    expect(api.getMenu).toHaveBeenCalledWith('r1');
  });

  test('each menu item has a name and price', async () => {
    api.getMenu.mockResolvedValue([{ id: 'item-1', name: 'Burger', price: 8.99 }]);

    const menu = await getMenu('r1');

    expect(menu[0]).toHaveProperty('name');
    expect(menu[0]).toHaveProperty('price');
    expect(typeof menu[0].price).toBe('number');
  });
});

describe('API contract — validatePromo', () => {
  test('calls validatePromo with the code string', async () => {
    api.validatePromo.mockResolvedValue({ valid: true, discountPercent: 10 });

    await applyPromo('SAVE10', 50);

    expect(api.validatePromo).toHaveBeenCalledWith('SAVE10');
  });

  test('calculates discount correctly from API response', async () => {
    api.validatePromo.mockResolvedValue({ valid: true, discountPercent: 20 });

    const { discount, finalAmount } = await applyPromo('SAVE20', 100);

    expect(discount).toBe(20);
    expect(finalAmount).toBe(80);
  });

  test('user is not charged more than once for the same successful order', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(api.placeOrder).toHaveBeenCalledTimes(1);
  });
});
