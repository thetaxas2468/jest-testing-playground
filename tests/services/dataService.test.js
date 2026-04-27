const { fetchData } = require("../../src/services/dataService");

describe("dataService", () => {
  test("returns data", async () => {
    const result = await fetchData();

    expect(result).toBe("data");
  });
});
