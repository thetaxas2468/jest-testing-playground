// Real APIs are slow, unreliable, and need a running server.
// Instead, we fake them with:
//
//   mockResolvedValue(x)      → the promise resolves (success) with x
//   mockRejectedValue(err)    → the promise rejects (failure) with err
//   mockResolvedValueOnce(x)  → only resolves once, then reverts


jest.mock('../../src/atm/bankApi');
jest.mock('../../src/atm/transactionLogger');
jest.mock('../../src/atm/authService');

const bankApi = require('../../src/atm/bankApi');
const authService = require('../../src/atm/authService');
const { checkBalance, depositMoney, withdrawMoney } = require('../../src/atm/atmMachine');

beforeEach(() => {
  jest.clearAllMocks();
  // Default: PIN is always valid unless a specific test overrides this
  authService.validatePin.mockReturnValue(true);
});


describe('fakeApi — success responses', () => {
  test('checkBalance resolves with the account balance', async () => {
    bankApi.getBalance.mockResolvedValue(1200);

    const balance = await checkBalance('ACC001');

    expect(balance).toBe(1200);
  });

  test('depositMoney resolves with the updated balance', async () => {
    bankApi.deposit.mockResolvedValue(1300); // 1200 + 100

    const newBalance = await depositMoney('ACC001', 100);

    expect(newBalance).toBe(1300);
  });

  test('withdrawMoney resolves with the updated balance', async () => {
    bankApi.getBalance.mockResolvedValue(1000);
    bankApi.withdraw.mockResolvedValue(800); // 1000 - 200

    const newBalance = await withdrawMoney('ACC001', '1234', 200);

    expect(newBalance).toBe(800);
  });

  test('mockResolvedValueOnce — consecutive deposits return different balances', async () => {
    bankApi.deposit
      .mockResolvedValueOnce(600) 
      .mockResolvedValueOnce(700); 

    const first  = await depositMoney('ACC001', 100);
    const second = await depositMoney('ACC001', 100);

    expect(first).toBe(600);
    expect(second).toBe(700);
  });
});


describe('fakeApi — network errors and rejections', () => {
  test('checkBalance throws when the bank server is down', async () => {
    bankApi.getBalance.mockRejectedValue(new Error('Network timeout'));

    await expect(checkBalance('ACC001')).rejects.toThrow('Network timeout');
  });

  test('depositMoney throws when the API fails mid-deposit', async () => {
    bankApi.deposit.mockRejectedValue(new Error('Server error — try again'));

    await expect(depositMoney('ACC001', 100)).rejects.toThrow('Server error');
  });

  test('catching the error with try/catch', async () => {
    bankApi.getBalance.mockRejectedValue(new Error('Connection refused'));

    try {
      await checkBalance('ACC001');
      throw new Error('Expected checkBalance to throw, but it did not');
    } catch (error) {
      expect(error.message).toBe('Connection refused');
    }
  });

  test('catching the error with .rejects (promise-chain style)', () => {
    expect.assertions(1);

    bankApi.getBalance.mockRejectedValue(new Error('Timeout'));

    return expect(checkBalance('ACC001')).rejects.toThrow('Timeout');
  });

  test('withdrawMoney fails gracefully when getBalance rejects', async () => {
    // PIN is fine, but the network drops on the balance check
    bankApi.getBalance.mockRejectedValue(new Error('Bank unreachable'));

    await expect(withdrawMoney('ACC001', '1234', 100)).rejects.toThrow('Bank unreachable');

    // Withdraw should never have been called
    expect(bankApi.withdraw).not.toHaveBeenCalled();
  });
});
