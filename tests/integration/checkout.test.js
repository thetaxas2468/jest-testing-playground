describe("paymentService - checkout", () => {
  // mock dependencies FIRST
  jest.mock("../../src/services/chargeService", () => ({
    charge: jest.fn(),
  }));

  const { charge } = require("../../src/services/chargeService");
  const { checkout } = require("../../src/services/paymentService");

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("checkout calls charge with correct amount", () => {
    // arrange
    charge.mockReturnValue("Mocked payment");

    // act
    const result = checkout(100);

    // assert
    expect(charge).toHaveBeenCalledWith(100);
    expect(result).toBe("Mocked payment");
  });
});
