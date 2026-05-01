jest.mock('../../src/deliveryApp/api');

const api = require('../../src/deliveryApp/api');
const { placeOrder, getOrderHistory } = require('../../src/deliveryApp/orderService');
const { getRestaurants, getMenu } = require('../../src/deliveryApp/restaurantService');

const VALID_ADDRESS = { street: '123 Main St', city: 'London' };
const CART = [{ id: 'item-1', name: 'Burger', price: 10, quantity: 2 }]; // subtotal $20

beforeEach(() => jest.clearAllMocks());

describe('browsing — restaurants', () => {
  test('returns the list of available restaurants', async () => {
    api.getRestaurants.mockResolvedValue([
      { id: 'r1', name: 'Burger Palace', open: true },
      { id: 'r2', name: 'Pizza World',   open: true },
    ]);

    const restaurants = await getRestaurants();

    expect(restaurants).toHaveLength(2);
    expect(api.getRestaurants).toHaveBeenCalledTimes(1);
  });
});

describe('browsing — menu', () => {
  test('returns menu items for a given restaurant', async () => {
    api.getMenu.mockResolvedValue([
      { id: 'item-1', name: 'Burger', price: 10 },
      { id: 'item-2', name: 'Fries',  price: 4  },
    ]);

    const menu = await getMenu('r1');

    expect(menu).toHaveLength(2);
    expect(api.getMenu).toHaveBeenCalledWith('r1');
  });

  test('item name, price and ID are present in the menu', async () => {
    api.getMenu.mockResolvedValue([{ id: 'item-1', name: 'Burger', price: 10 }]);

    const menu = await getMenu('r1');

    expect(menu[0]).toHaveProperty('id');
    expect(menu[0]).toHaveProperty('name');
    expect(menu[0]).toHaveProperty('price');
  });
});

describe('placing an order', () => {
  test('returns an order confirmation with an order ID', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    const result = await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(result.orderId).toBe('ORD-001');
    expect(result.status).toBe('confirmed');
  });

  test('sends the correct total (subtotal + delivery fee) to the API', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-001', status: 'confirmed' });

    // $20 subtotal → below $30 free-delivery threshold → +$3.99 fee = $23.99
    await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 23.99 }));
  });

  test('applies free delivery when subtotal reaches $30', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-002', status: 'confirmed' });
    const cart = [{ id: 'item-1', name: 'Meal', price: 15, quantity: 2 }]; // $30

    await placeOrder({ userId: 'u1', cart, address: VALID_ADDRESS, paymentMethod: 'card' });

    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 30 }));
  });

  test('subtracts promo discount from the final total', async () => {
    api.placeOrder.mockResolvedValue({ orderId: 'ORD-003', status: 'confirmed' });

    // $20 + $3.99 - $5 promo = $18.99
    await placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card', promoDiscount: 5 });

    expect(api.placeOrder).toHaveBeenCalledWith(expect.objectContaining({ total: 18.99 }));
  });
});

describe('order history', () => {
  test('returns the list of past orders for a user', async () => {
    api.getOrderHistory.mockResolvedValue([
      { orderId: 'ORD-001', status: 'delivered' },
      { orderId: 'ORD-002', status: 'cancelled' },
    ]);

    const history = await getOrderHistory('u1');

    expect(history).toHaveLength(2);
    expect(history[0].orderId).toBe('ORD-001');
  });

  test('calls getOrderHistory with the correct user ID', async () => {
    api.getOrderHistory.mockResolvedValue([]);

    await getOrderHistory('user-42');

    expect(api.getOrderHistory).toHaveBeenCalledWith('user-42');
  });
});
