// jest.mock('path/to/module') replaces the ENTIRE module with a
// fake version. Every exported function becomes a jest.fn()
// automatically — you don't have to create them yourself.

// Important: Jest HOISTS jest.mock() calls to the top of the file
// before any imports run. That's why it works even though it looks
// like it appears after the imports in the source code.

// Use jest.mock() when:
//   • You want complete control over a dependency
//   • You don't care about the original implementation at all
//   • You want to silence side effects (like console.log from logger)

// Use jest.spyOn() (previous file) when:
//   • You still want the original code to run most of the time
//   • You just want to watch calls or override for one test

jest.mock('../../src/atm/bankApi');
jest.mock('../../src/atm/transactionLogger');
jest.mock('../../src/atm/authService');

const bankApi = require('../../src/atm/bankApi');
const transactionLogger = require('../../src/atm/transactionLogger');
const authService       = require('../../src/atm/authService');
const { checkBalance, depositMoney, withdrawMoney } = require('../../src/atm/atmMachine');

beforeEach(() => {
  jest.clearAllMocks();
});


describe('checkBalance', () => {
  test('returns the balance from the bank API', async () => {
    bankApi.getBalance.mockResolvedValue(750);

    const result = await checkBalance('ACC001');

    expect(result).toBe(750);
    expect(bankApi.getBalance).toHaveBeenCalledWith('ACC001');
  });

  test('calls the bank API exactly once per request', async () => {
    bankApi.getBalance.mockResolvedValue(0);

    await checkBalance('ACC001');

    expect(bankApi.getBalance).toHaveBeenCalledTimes(1);
  });
});


describe('depositMoney', () => {
  test('calls bankApi.deposit and returns the new balance', async () => {
    bankApi.deposit.mockResolvedValue(1100);

    const result = await depositMoney('ACC001', 100);

    expect(bankApi.deposit).toHaveBeenCalledWith('ACC001', 100);
    expect(result).toBe(1100);
  });

  test('calls logTransaction after a successful deposit', async () => {
    bankApi.deposit.mockResolvedValue(1100);

    await depositMoney('ACC001', 100);

    expect(transactionLogger.logTransaction).toHaveBeenCalledWith('ACC001', 'DEPOSIT', 100);
  });

  test('does NOT call bankApi.deposit when amount is invalid', async () => {
    await expect(depositMoney('ACC001', -10)).rejects.toThrow();

    expect(bankApi.deposit).not.toHaveBeenCalled();
    expect(transactionLogger.logTransaction).not.toHaveBeenCalled();
  });
});


describe('withdrawMoney', () => {
  test('succeeds with correct PIN and enough balance', async () => {
    authService.validatePin.mockReturnValue(true);
    bankApi.getBalance.mockResolvedValue(500);
    bankApi.withdraw.mockResolvedValue(300);

    const result = await withdrawMoney('ACC001', '1234', 200);

    expect(result).toBe(300);
    expect(bankApi.withdraw).toHaveBeenCalledWith('ACC001', 200);
    expect(transactionLogger.logTransaction).toHaveBeenCalledWith('ACC001', 'WITHDRAWAL', 200);
  });

  test('throws and calls nothing on the bank when PIN is wrong', async () => {
    authService.validatePin.mockReturnValue(false);

    await expect(withdrawMoney('ACC001', 'bad', 200)).rejects.toThrow('Invalid PIN');

    expect(bankApi.getBalance).not.toHaveBeenCalled();
    expect(bankApi.withdraw).not.toHaveBeenCalled();
    expect(transactionLogger.logTransaction).not.toHaveBeenCalled();
  });

  test('throws "Insufficient funds" and does NOT withdraw when balance is too low', async () => {
    authService.validatePin.mockReturnValue(true);
    bankApi.getBalance.mockResolvedValue(50); // Only $50 in the account

    await expect(withdrawMoney('ACC001', '1234', 200)).rejects.toThrow('Insufficient funds');

    expect(bankApi.withdraw).not.toHaveBeenCalled();
    expect(transactionLogger.logTransaction).not.toHaveBeenCalled();
  });

  test('calls validatePin with the exact account ID and PIN provided', async () => {
    authService.validatePin.mockReturnValue(true);
    bankApi.getBalance.mockResolvedValue(500);
    bankApi.withdraw.mockResolvedValue(400);

    await withdrawMoney('ACC002', '5678', 100);

    expect(authService.validatePin).toHaveBeenCalledWith('ACC002', '5678');
  });
});
