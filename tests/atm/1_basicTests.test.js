const { validatePin } = require('../../src/atm/authService');
const { depositMoney, withdrawMoney } = require('../../src/atm/atmMachine');


describe('authService — validatePin', () => {
  test('returns true when the PIN matches the account', () => {
    expect(validatePin('ACC001', '1234')).toBe(true);
  });

  test('returns false when the PIN is wrong', () => {
    expect(validatePin('ACC001', '9999')).toBe(false);
  });

  test('returns false for an account that does not exist', () => {
    expect(validatePin('UNKNOWN_ACC', '1234')).toBe(false);
  });

  test('returns false when PIN is an empty string', () => {
    expect(validatePin('ACC001', '')).toBe(false);
  });
});

// ─── Input validation: throws BEFORE reaching the bank API ───
// These functions throw early so we never reach the network call.

describe('atmMachine — input validation (no API call needed)', () => {
  test('depositMoney throws when amount is zero', async () => {
    await expect(depositMoney('ACC001', 0)).rejects.toThrow(
      'Deposit amount must be greater than zero'
    );
  });

  test('depositMoney throws when amount is negative', async () => {
    await expect(depositMoney('ACC001', -50)).rejects.toThrow(
      'Deposit amount must be greater than zero'
    );
  });

  test('withdrawMoney throws on an invalid PIN before calling the bank API', async () => {
    // The PIN check runs first — bankApi is never reached
    await expect(withdrawMoney('ACC001', 'wrongPin', 100)).rejects.toThrow(
      'Invalid PIN'
    );
  });

  test('withdrawMoney throws when withdrawal amount is zero (after PIN check)', async () => {
    // ACC001 PIN is '1234' — passes auth, then hits amount validation
    await expect(withdrawMoney('ACC001', '1234', 0)).rejects.toThrow(
      'Withdrawal amount must be greater than zero'
    );
  });
});

// jest.fn() creates a fake function you fully control.
// Great for replacing callbacks or tracking calls.

describe('jest.fn() — how mock functions work', () => {
  test('a mock function records how many times it was called', () => {
    const mockFn = jest.fn();

    mockFn();
    mockFn();
    mockFn();

    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test('a mock function records what arguments it received', () => {
    const mockFn = jest.fn();

    mockFn('ACC001', 500);

    expect(mockFn).toHaveBeenCalledWith('ACC001', 500);
  });

  test('mockReturnValue makes the mock always return the value you set', () => {
    const mockGetBalance = jest.fn();
    mockGetBalance.mockReturnValue(1000);

    const result = mockGetBalance('ACC001');

    expect(result).toBe(1000);
  });

  test('mockReturnValueOnce returns different values on consecutive calls', () => {
    const mockFn = jest.fn();
    mockFn.mockReturnValueOnce('first call').mockReturnValueOnce('second call');

    expect(mockFn()).toBe('first call');
    expect(mockFn()).toBe('second call');
    expect(mockFn()).toBeUndefined(); // no more queued values
  });

  test('a mock function that has never been called reports zero calls', () => {
    const mockFn = jest.fn();

    expect(mockFn).not.toHaveBeenCalled();
  });
});
