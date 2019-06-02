
const assert= require("assert");

const MyClass = require("./MyClass");


assert(MyClass.sM() === 42);
assert(MyClass.s === "my static");

const inst = new MyClass("hello world");

inst.m();