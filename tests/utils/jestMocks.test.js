describe("async mocking", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("mock async", async () => {
    const mockFn = jest.fn();
    mockFn.mockResolvedValue("async value");

    const result = await mockFn();

    expect(result).toBe("async value");
  });

  test("mock resets between tests", () => {
    const mockFn = jest.fn();

    mockFn("a");

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
