// jest.mock("../../src/services/userService", () => {
//   const original = jest.requireActual("../../src/services/userService");

//   return {
//     ...original,
//     fetchUser: jest.fn(),
//   };
// });

const userService = require("../../src/services/userService");

describe("userService", () => {
  afterEach(() => {
    jest.clearAllMocks();
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
});
