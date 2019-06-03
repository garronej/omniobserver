
const assert= require("assert");

const MyClass = require("./MyClass");


assert(MyClass.sM() === 42);
assert(MyClass.s === "my static");

assert(MyClass.v().foo === "bar");

const inst = new MyClass("hello world");

assert(inst.getArray()[1] === "b");

assert(inst.m() === "hello world");