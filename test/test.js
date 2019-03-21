let expect = require("chai").expect;
require("mocha");

describe("addTwoNumbers()", function() {
  it("should add two numbers", function() {
    // 1. ARRANGE
    let x = 5;
    let y = 1;
    let sum1 = x + y;

    // 2. ACT
    let sum2 = x + y;

    // 3. ASSERT
    expect(sum2).to.be.equal(sum1);
  });
});
