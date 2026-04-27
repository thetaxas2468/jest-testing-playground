const { add } = require("../../src/utils/mathUtils");

describe("mathUtils", () => {
  test("adds two numbers", () => {
    // Arrange
    const a = 2;
    const b = 3;

    // Act
    const result = add(a, b);

    // Assert
    expect(result).toBe(5);
  });
});
