
var observeObjectProperty = require("..").observeObjectProperty;

function MyClass(p) {
    this.p = p;
}

MyClass.prototype.m = function m() {
    return this.p + " !";
};

MyClass.s = "my static";

MyClass.sM = function sM() { return 42; };

module.exports = MyClass;

observeObjectProperty(module, "exports", undefined,
    (o, p) => {

        if (o instanceof MyClass && p === "p") {

            console.log("_______not tracing p__________");

            return false;
        }

        return true;

    },
    o => {

        if (o instanceof MyClass) {
            return "A myClass instance object";
        } else {
            return o;
        }

    }
);




