const logger = require("../../src/infrastructure/logger");
const { greet } = require("../../src/services/greet");

describe("greet", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should call logger.log", () => {
    const spy = jest
      .spyOn(logger, "log")
      .mockImplementation(() => {});

    greet("Karam");

    expect(spy).toHaveBeenCalledWith("Hello Karam");
  });
});