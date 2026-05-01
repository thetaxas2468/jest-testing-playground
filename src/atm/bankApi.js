// This file represents the connection to a real bank server.
// In real life, these functions would make HTTP network requests.
// In tests, we MOCK this entire file so we control the responses
// and don't need a real server running.

async function getBalance(accountId) {
  // Real call would be: GET https://bank.com/api/accounts/:id/balance
  throw new Error('Real network call — you must mock bankApi in tests');
}

async function deposit(accountId, amount) {
  // Real call would be: POST https://bank.com/api/accounts/:id/deposit
  throw new Error('Real network call — you must mock bankApi in tests');
}

async function withdraw(accountId, amount) {
  // Real call would be: POST https://bank.com/api/accounts/:id/withdraw
  throw new Error('Real network call — you must mock bankApi in tests');
}

module.exports = { getBalance, deposit, withdraw };
