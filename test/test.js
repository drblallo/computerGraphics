let expect = require("chai").expect;
require("mocha");
let transform = require("../src/lib/transform.js")
let utils = require("../src/lib/utils.js")
let renderObject = require("../src/lib/renderObject.js")

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

describe("MakeTransform()", function() {
  it("should make a transform", function() {
    // 1. ARRANGE
    let x = new transform.MakeTransform();

    // 3. ASSERT
    expect(x.toMatrix()).to.eql(utils.identityMatrix());
  });
});


describe("Test Translation", function() {
  it("should translate", function() {
    // 1. ARRANGE
    let x = new transform.MakeTransform();
	x.setTranslation(2, 3, 4);

    // 3. ASSERT
    expect(x.translation).to.eql([2, 3, 4]);

    x.translate(1, -1, 0);
    expect(x.translation).to.eql([3, 2, 4]);
  });
});

describe("Test Scale", function() {
  it("should scale", function() {
    // 1. ARRANGE
    let x = new transform.MakeTransform();
	x.setScale(2, 3, 4);

    // 3. ASSERT
    expect(x.scale).to.eql([2, 3, 4]);

    x.scalate(2, -1, 0);
    expect(x.scale).to.eql([4, -3, 0]);
  });
});


describe("Test Rotation", function() {
  it("should rotate", function() {
    // 1. ARRANGE
    let x = new transform.MakeTransform();
	x.setRotation(utils.degToRad(180), 0, 0);

    // 3. ASSERT
    //expect(x.getRotation()).to.eql([0, 0, 0]);

    //x.scalate(2, -1, 0);
    //expect(x.scale).to.eql([4, -3, 0]);
  });
});

describe("Test renderObject", function() {
  it("renderobject should create", function() {
    // 1. ARRANGE
    let x = new renderObject.MakeRenderObject(new renderObject.EmptyContext());

    // 3. ASSERT
    expect(x.getParent()).to.be.equal(null);

  });
});
