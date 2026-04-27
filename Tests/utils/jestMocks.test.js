describe("async mocking", () => {
  test("mock async", async () => {
    const mockFn = jest.fn();
    mockFn.mockResolvedValue("async value");

    const result = await mockFn();

    expect(result).toBe("async value");
  });
});
