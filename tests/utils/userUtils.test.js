const { processUser } = require("../../src/utils/userUtils");

describe("userUtils - processUser", () => {
  test("calls callback with correct value", () => {
    const mockFn = jest.fn();

    processUser(mockFn);

    expect(mockFn).toHaveBeenCalledWith("Karam");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("processUser handles empty callback safely", () => {
    expect(() => processUser()).toThrow();
  });

  test("callback is called multiple times correctly", () => {
    const mockFn = jest.fn();

    processUser(mockFn);
    processUser(mockFn);

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
