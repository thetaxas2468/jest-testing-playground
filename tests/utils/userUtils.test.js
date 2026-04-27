const { processUser } = require("../../src/utils/userUtils");

describe("userUtils - processUser", () => {
  test("calls callback with correct value", () => {
    const mockFn = jest.fn();

    processUser(mockFn);

    expect(mockFn).toHaveBeenCalledWith("Karam");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
