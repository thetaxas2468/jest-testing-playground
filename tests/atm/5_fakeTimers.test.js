// Problem: the ATM session expires after 30 real seconds.
//          We can't wait 30 seconds per test — that's way too slow.

// Solution: jest.useFakeTimers()
//   Replaces setTimeout / setInterval / Date with Jest-controlled
//   versions. Time only moves when YOU tell it to.


const { startSession, warnBeforeExpiry } = require('../../src/atm/sessionService');

beforeEach(() => {
  jest.useFakeTimers(); // Jest now controls time for every test in this file
});

afterEach(() => {
  jest.useRealTimers(); // Give time back to the real clock after each test
  jest.clearAllMocks();
});

describe('startSession — session expires after 30 seconds', () => {
  test('the expiry callback is NOT called immediately', () => {
    const onExpire = jest.fn();

    startSession(onExpire);

    // No time has passed yet — callback must not have fired
    expect(onExpire).not.toHaveBeenCalled();
  });

  test('the expiry callback is NOT called after 29 999 ms (just before timeout)', () => {
    const onExpire = jest.fn();

    startSession(onExpire);
    jest.advanceTimersByTime(29_999);

    expect(onExpire).not.toHaveBeenCalled();
  });

  test('the expiry callback IS called after exactly 30 000 ms', () => {
    const onExpire = jest.fn();

    startSession(onExpire);
    jest.advanceTimersByTime(30_000);

    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onExpire).toHaveBeenCalledWith('SESSION_EXPIRED');
  });

  test('jest.runAllTimers() fires the callback without specifying the exact delay', () => {
    const onExpire = jest.fn();

    startSession(onExpire);
    jest.runAllTimers(); // fire everything that is pending, regardless of delay

    expect(onExpire).toHaveBeenCalled();
  });

  test('two sessions started independently each fire their own callback', () => {
    const onExpire1 = jest.fn();
    const onExpire2 = jest.fn();

    startSession(onExpire1);
    startSession(onExpire2);

    jest.advanceTimersByTime(30_000);

    expect(onExpire1).toHaveBeenCalledTimes(1);
    expect(onExpire2).toHaveBeenCalledTimes(1);
  });
});


describe('warnBeforeExpiry — warning fires at 25 seconds', () => {
  test('warning is NOT shown before 25 seconds', () => {
    const onWarn = jest.fn();

    warnBeforeExpiry(onWarn);
    jest.advanceTimersByTime(24_999);

    expect(onWarn).not.toHaveBeenCalled();
  });

  test('warning IS shown at exactly 25 seconds', () => {
    const onWarn = jest.fn();

    warnBeforeExpiry(onWarn);
    jest.advanceTimersByTime(25_000);

    expect(onWarn).toHaveBeenCalledTimes(1);
    expect(onWarn).toHaveBeenCalledWith('WARNING: Session expiring soon');
  });
});


describe('warning then expiry — two timers in sequence', () => {
  test('warning fires at 25s and expiry fires at 30s', () => {
    const onWarn   = jest.fn();
    const onExpire = jest.fn();

    warnBeforeExpiry(onWarn);
    startSession(onExpire);

    // At 25 seconds: only the warning should have fired
    jest.advanceTimersByTime(25_000);
    expect(onWarn).toHaveBeenCalledTimes(1);
    expect(onExpire).not.toHaveBeenCalled();

    // Advance 5 more seconds (total 30s): now expiry fires too
    jest.advanceTimersByTime(5_000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
