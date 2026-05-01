const { addItem, removeItem, updateQuantity, getSubtotal, isEmpty } = require('../../src/deliveryApp/cart');

const BURGER = { id: 'item-1', name: 'Burger', price: 8.99 };
const FRIES  = { id: 'item-2', name: 'Fries',  price: 3.49 };

describe('addItem', () => {
  test('adds a new item with quantity 1', () => {
    const cart = addItem([], BURGER);
    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({ ...BURGER, quantity: 1 });
  });

  test('increments quantity when the same item is added again', () => {
    const cart = addItem(addItem([], BURGER), BURGER);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  test('can hold multiple different items', () => {
    const cart = addItem(addItem([], BURGER), FRIES);
    expect(cart).toHaveLength(2);
  });

  test('does not mutate the original cart array', () => {
    const original = [];
    addItem(original, BURGER);
    expect(original).toHaveLength(0);
  });
});

describe('removeItem', () => {
  test('removes the correct item by ID', () => {
    const cart = addItem(addItem([], BURGER), FRIES);
    const updated = removeItem(cart, 'item-1');
    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe('item-2');
  });

  test('removing a non-existent ID leaves the cart unchanged', () => {
    const cart = addItem([], BURGER);
    expect(removeItem(cart, 'does-not-exist')).toHaveLength(1);
  });
});

describe('updateQuantity', () => {
  test('sets the item to the new quantity', () => {
    const cart = updateQuantity(addItem([], BURGER), 'item-1', 5);
    expect(cart[0].quantity).toBe(5);
  });

  test('removes the item when quantity is set to 0', () => {
    const cart = updateQuantity(addItem([], BURGER), 'item-1', 0);
    expect(cart).toHaveLength(0);
  });

  test('removes the item when quantity is negative', () => {
    const cart = updateQuantity(addItem([], BURGER), 'item-1', -3);
    expect(cart).toHaveLength(0);
  });
});

describe('getSubtotal', () => {
  test('calculates subtotal correctly across multiple items and quantities', () => {
    let cart = addItem([], BURGER);        // 8.99 x1
    cart = addItem(cart, FRIES);           // 3.49 x1
    cart = updateQuantity(cart, 'item-1', 2); // 8.99 x2 = 17.98
    // 17.98 + 3.49 = 21.47
    expect(getSubtotal(cart)).toBeCloseTo(21.47);
  });

  test('returns 0 for an empty cart', () => {
    expect(getSubtotal([])).toBe(0);
  });
});

describe('isEmpty', () => {
  test('returns true for an empty array', () => expect(isEmpty([])).toBe(true));
  test('returns true for null',           () => expect(isEmpty(null)).toBe(true));
  test('returns true for undefined',      () => expect(isEmpty(undefined)).toBe(true));
  test('returns false when cart has items', () => expect(isEmpty([BURGER])).toBe(false));
});
