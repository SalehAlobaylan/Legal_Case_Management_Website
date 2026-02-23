describe("Jest Setup", () => {
  it("should be configured correctly", () => {
    expect(true).toBe(true);
  });

  it("should support async tests", async () => {
    const result = await Promise.resolve("success");
    expect(result).toBe("success");
  });
});
