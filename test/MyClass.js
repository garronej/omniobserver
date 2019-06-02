
var observeObjectProperty = require("..").observeObjectProperty;

function MyClass(p) {
    this.p= p;
}

// For node.js, we pick am3 with max dbits to 28.
MyClass.prototype.m = function m(){
    return this.p + " !";
};

module.exports = MyClass;

observeObjectProperty(module, "exports");
