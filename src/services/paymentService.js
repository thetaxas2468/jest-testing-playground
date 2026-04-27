const { charge } = require("./chargeService");


function checkout(total) { return charge(total); }

module.exports = { checkout };