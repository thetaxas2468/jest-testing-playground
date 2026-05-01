// Represents the real delivery app backend API.
// Every function throws — you must mock this module in tests.

async function getRestaurants() { throw new Error('Mock required'); }
async function getMenu(restaurantId) { throw new Error('Mock required'); }
async function placeOrder(order) { throw new Error('Mock required'); }
async function processPayment(payment) { throw new Error('Mock required'); }
async function getOrderHistory(userId) { throw new Error('Mock required'); }
async function validatePromo(code) { throw new Error('Mock required'); }

module.exports = { getRestaurants, getMenu, placeOrder, processPayment, getOrderHistory, validatePromo };
