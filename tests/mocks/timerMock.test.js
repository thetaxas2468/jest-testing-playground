jest.useFakeTimers();
jest.spyOn(global, "setTimeout");

describe("timerGame", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("waits 1 second before ending the game", () => {
    const timerMock = require("../../src/manualMocks/timerMock");
    timerMock();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  });

  test("calls the callback", () => {
    const timerMock = require("../../src/manualMocks/timerMock");
    const callback = jest.fn();

    timerMock(callback);

    // At this point in time, the callback should not have been called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward until all timers have been executed
    jest.runAllTimers();

    // Now our callback should have been called!
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });
  test("calls the callback after 1 second", () => {
    const timerMock = require("../../src/manualMocks/timerMock");
    const callback = jest.fn();

    timerMock(callback);

    // Not called immediately
    expect(callback).not.toHaveBeenCalled();

    // Move time forward by 999ms
    jest.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();

    // Move 1 more ms (total 1000ms)
    jest.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
