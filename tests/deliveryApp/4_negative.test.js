jest.mock('../../src/deliveryApp/api');

const api = require('../../src/deliveryApp/api');
const { placeOrder } = require('../../src/deliveryApp/orderService');
const { getMenu } = require('../../src/deliveryApp/restaurantService');
const { applyPromo } = require('../../src/deliveryApp/promoService');

const VALID_ADDRESS = { street: '123 Main St', city: 'London' };
const CART = [{ id: 'item-1', name: 'Burger', price: 10, quantity: 1 }];

beforeEach(() => jest.clearAllMocks());

describe('negative — empty cart', () => {
  test('throws when cart is an empty array', async () => {
    await expect(
      placeOrder({ userId: 'u1', cart: [], address: VALID_ADDRESS, paymentMethod: 'card' })
    ).rejects.toThrow('Cart is empty');
    expect(api.placeOrder).not.toHaveBeenCalled();
  });

  test('throws when cart is null', async () => {
    await expect(
      placeOrder({ userId: 'u1', cart: null, address: VALID_ADDRESS, paymentMethod: 'card' })
    ).rejects.toThrow('Cart is empty');
  });
});

describe('negative — delivery address', () => {
  test('throws when address is null', async () => {
    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: null, paymentMethod: 'card' })
    ).rejects.toThrow('Delivery address is incomplete');
  });

  test('throws when address is missing street', async () => {
    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: { city: 'London' }, paymentMethod: 'card' })
    ).rejects.toThrow('Delivery address is incomplete');
  });

  test('throws when address is missing city', async () => {
    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: { street: '123 Main St' }, paymentMethod: 'card' })
    ).rejects.toThrow('Delivery address is incomplete');
  });
});

describe('negative — payment', () => {
  test('throws when payment method is null', async () => {
    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: null })
    ).rejects.toThrow('Payment method is required');
  });

  test('throws when payment is declined', async () => {
    api.placeOrder.mockRejectedValue(new Error('Payment declined'));

    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' })
    ).rejects.toThrow('Payment declined');
  });
});

describe('negative — restaurant and stock', () => {
  test('throws when restaurant ID is missing', async () => {
    await expect(getMenu(null)).rejects.toThrow('Restaurant ID is required');
    expect(api.getMenu).not.toHaveBeenCalled();
  });

  test('throws when restaurant is closed', async () => {
    api.placeOrder.mockRejectedValue(new Error('Restaurant is currently closed'));

    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' })
    ).rejects.toThrow('Restaurant is currently closed');
  });

  test('throws when item is out of stock', async () => {
    api.placeOrder.mockRejectedValue(new Error('Item is out of stock'));

    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' })
    ).rejects.toThrow('Item is out of stock');
  });
});

describe('negative — promo codes', () => {
  test('throws for an invalid promo code', async () => {
    api.validatePromo.mockResolvedValue({ valid: false });

    await expect(applyPromo('BADCODE', 50)).rejects.toThrow('Invalid or expired promo code');
  });

  test('throws for an expired promo code', async () => {
    api.validatePromo.mockResolvedValue({ valid: false, reason: 'expired' });

    await expect(applyPromo('OLDCODE', 50)).rejects.toThrow('Invalid or expired promo code');
  });
});

describe('negative — network failures', () => {
  test('throws when the server is unreachable', async () => {
    api.placeOrder.mockRejectedValue(new Error('Network timeout'));

    await expect(
      placeOrder({ userId: 'u1', cart: CART, address: VALID_ADDRESS, paymentMethod: 'card' })
    ).rejects.toThrow('Network timeout');
  });

  test('throws when menu API is unreachable', async () => {
    api.getMenu.mockRejectedValue(new Error('Service unavailable'));

    await expect(getMenu('r1')).rejects.toThrow('Service unavailable');
  });
});
