// Records every deposit and withdrawal with a timestamp.
// In tests we often spy on this to confirm it was called,
// or mock it to silence noisy console.log output.

function logTransaction(accountId, type, amount) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${type} | Account: ${accountId} | $${amount}`);
}

module.exports = { logTransaction };
