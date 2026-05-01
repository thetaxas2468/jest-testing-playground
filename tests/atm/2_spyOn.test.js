// jest.spyOn(object, 'methodName') wraps a REAL function so Jest
// can record every call — but the original code still runs by default.

// You can also chain .mockReturnValue() or .mockImplementation() on
// a spy to replace the behaviour when needed (e.g. to silence
// console.log or avoid a real network call).

// Always call jest.restoreAllMocks() after each test so the spy
// doesn't bleed into the next test.

// Key differences:
//   jest.fn()      → brand new fake function (no original)
//   jest.spyOn()   → wraps an existing function (original still there)
//   jest.mock()    → replaces the whole module 

const bankApi = require('../../src/atm/bankApi');
const transactionLogger = require('../../src/atm/transactionLogger');
const authService = require('../../src/atm/authService');
const { checkBalance, depositMoney, withdrawMoney } = require('../../src/atm/atmMachine');

afterEach(() => {
  jest.restoreAllMocks();
});

describe('spyOn bankApi.getBalance', () => {
  test('checkBalance calls getBalance with the correct account ID', async () => {
    // We spy AND mock the return value so no real network call fires
    const spy = jest.spyOn(bankApi, 'getBalance').mockResolvedValue(500);

    const balance = await checkBalance('ACC001');

    expect(spy).toHaveBeenCalledWith('ACC001');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(balance).toBe(500);
  });

  test('checkBalance passes whatever the bank returns straight through', async () => {
    jest.spyOn(bankApi, 'getBalance').mockResolvedValue(99999);

    const balance = await checkBalance('ACC001');

    expect(balance).toBe(99999);
  });
});


describe('spyOn transactionLogger.logTransaction', () => {
  test('depositMoney calls logTransaction after a successful deposit', async () => {
    jest.spyOn(bankApi, 'deposit').mockResolvedValue(600);
    const logSpy = jest.spyOn(transactionLogger, 'logTransaction').mockImplementation(() => {});

    await depositMoney('ACC001', 100);

    expect(logSpy).toHaveBeenCalledWith('ACC001', 'DEPOSIT', 100);
  });

  test('withdrawMoney calls logTransaction with WITHDRAWAL type', async () => {
    jest.spyOn(authService, 'validatePin').mockReturnValue(true);
    jest.spyOn(bankApi, 'getBalance').mockResolvedValue(1000);
    jest.spyOn(bankApi, 'withdraw').mockResolvedValue(800);
    const logSpy = jest.spyOn(transactionLogger, 'logTransaction').mockImplementation(() => {});

    await withdrawMoney('ACC001', '1234', 200);

    expect(logSpy).toHaveBeenCalledWith('ACC001', 'WITHDRAWAL', 200);
  });

  test('logTransaction is NOT called when deposit amount is invalid', async () => {
    const logSpy = jest.spyOn(transactionLogger, 'logTransaction').mockImplementation(() => {});

    await expect(depositMoney('ACC001', 0)).rejects.toThrow();

    expect(logSpy).not.toHaveBeenCalled();
  });

  test('logTransaction is NOT called when the PIN is wrong', async () => {
    jest.spyOn(authService, 'validatePin').mockReturnValue(false);
    const logSpy = jest.spyOn(transactionLogger, 'logTransaction').mockImplementation(() => {});

    await expect(withdrawMoney('ACC001', 'bad', 100)).rejects.toThrow('Invalid PIN');

    expect(logSpy).not.toHaveBeenCalled();
  });
});

describe('spyOn authService.validatePin', () => {
  test('withdrawMoney calls validatePin with the account ID and PIN', async () => {
    const pinSpy = jest.spyOn(authService, 'validatePin').mockReturnValue(true);
    jest.spyOn(bankApi, 'getBalance').mockResolvedValue(500);
    jest.spyOn(bankApi, 'withdraw').mockResolvedValue(400);
    jest.spyOn(transactionLogger, 'logTransaction').mockImplementation(() => {});

    await withdrawMoney('ACC001', '1234', 100);

    expect(pinSpy).toHaveBeenCalledWith('ACC001', '1234');
  });
});
