const api = require('./api');

async function getRestaurants() {
  return api.getRestaurants();
}

async function getMenu(restaurantId) {
  if (!restaurantId) throw new Error('Restaurant ID is required');
  return api.getMenu(restaurantId);
}

module.exports = { getRestaurants, getMenu };
