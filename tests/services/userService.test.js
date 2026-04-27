// jest.mock("../../src/services/userService", () => {
//   const original = jest.requireActual("../../src/services/userService");

//   return {
//     ...original,
//     fetchUser: jest.fn(),
//   };
// });

jest.mock("../../src/manualMocks/request", () => ({
  request: jest.fn(),
}));

const userService = require("../../src/services/userService");
const { request } = require("../../src/manualMocks/request");

describe("userService", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test("spy without full mock", () => {
    const spy = jest
      .spyOn(userService, "fetchUser")
      .mockReturnValue({ name: "Spy User" });

    expect(userService.fetchUser().name).toBe("Spy User");

    spy.mockRestore();
  });

  test("returns mocked user name", () => {
    // better to mock it on start before all, but for demonstration, we can mock it here
    userService.fetchUser = jest.fn();
    userService.fetchUser.mockReturnValue({ name: "Mocked Karam" });
    expect(userService.getUserName()).toBe("Mocked Karam");
  });

  test("getUserName handles undefined user", () => {
    jest.spyOn(userService, "fetchUser").mockReturnValue(undefined);

    expect(() => userService.getUserName()).toThrow();
  });

  test("fetchUser returns different values on consecutive calls", () => {
    userService.fetchUser
      .mockReturnValueOnce({ name: "User1" })
      .mockReturnValueOnce({ name: "User2" });

    expect(userService.fetchUser().name).toBe("User1");
    expect(userService.fetchUser().name).toBe("User2");
  });
  test("fetchUser is called inside getUserName", () => {
    const spy = jest
      .spyOn(userService, "fetchUser")
      .mockReturnValue({ name: "Test User" });

    userService.getUserName();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });
  test("throws error when user is missing", () => {
    userService.fetchUser.mockReturnValue(null);

    expect(() => userService.getUserName()).toThrow();
  });
  // The assertion for a promise must be returned.
  it("works with promises", async () => {
    expect.assertions(1);
    request.mockResolvedValue({ name: "Mark" });
    const data = await userService.byRequest(4);
    expect(data).toBe("Mark");
  });

  it("works with promises then", () => {
    expect.assertions(1);
    request.mockResolvedValue({ name: "Paul" });
    return userService.byRequest(5).then((data) => expect(data).toBe("Paul"));
  });

  // Testing for async errors using Promise.catch.
  it("tests error with promises", async () => {
    expect.assertions(1);
    request.mockRejectedValue(new Error("User with 2 not found."));

    try {
      await userService.byRequest(2);
    } catch (e) {
      expect(e.message).toBe("User with 2 not found.");
    }
  });
  // Testing for async errors using `.rejects`.
  it("tests error with rejects", () => {
    expect.assertions(1);

    request.mockRejectedValue(new Error("User with 3 not found."));

    return expect(userService.byRequest(3)).rejects.toThrow(
      "User with 3 not found.",
    );
  });
});
