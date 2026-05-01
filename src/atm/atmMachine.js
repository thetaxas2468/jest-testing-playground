const bankApi = require('./bankApi');
const authService = require('./authService');
const transactionLogger = require('./transactionLogger');

async function checkBalance(accountId) {
  // Fake API call to get balance
  const balance = await bankApi.getBalance(accountId);
  return balance;
}

async function depositMoney(accountId, amount) {
  if (amount <= 0) {
    throw new Error('Deposit amount must be greater than zero');
  }
  // Fake API call to deposit money
  const newBalance = await bankApi.deposit(accountId, amount);
  // Log the transaction
  transactionLogger.logTransaction(accountId, 'DEPOSIT', amount);
  return newBalance;
}

async function withdrawMoney(accountId, pin, amount) {
  if (!authService.validatePin(accountId, pin)) {
    throw new Error('Invalid PIN — access denied');
  }
  if (amount <= 0) {
    throw new Error('Withdrawal amount must be greater than zero');
  }
  const currentBalance = await bankApi.getBalance(accountId);
  if (amount > currentBalance) {
    throw new Error('Insufficient funds');
  }
  // Fake API call to withdraw money
  const newBalance = await bankApi.withdraw(accountId, amount);
  transactionLogger.logTransaction(accountId, 'WITHDRAWAL', amount);
  return newBalance;
}

module.exports = { checkBalance, depositMoney, withdrawMoney };
