// Validates the user's PIN before allowing withdrawals.
// Real apps would check against an encrypted database.

const VALID_PINS = {
  ACC001: '1234',
  ACC002: '5678',
  ACC003: '0000',
};

function validatePin(accountId, pin) {
  return VALID_PINS[accountId] === pin;
}

module.exports = { validatePin };
