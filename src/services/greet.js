const logger = require("../infrastructure/logger");

function greet(name) {
  logger.log(`Hello ${name}`);
}

module.exports = { greet };
