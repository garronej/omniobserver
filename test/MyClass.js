
var observeObjectProperty = require("..").observeObjectProperty;

function MyClass(p) {
    this.p = p;
}

MyClass.prototype.m = function mInternalName() {
    return this.p;
};

MyClass.prototype.getArray = function mInternalName() {
    return [ "a", "b", "c" ];
};

MyClass.s = "my static";

MyClass.sM = function sM() { return 42; };

MyClass.v= function (){
    return { "foo": "bar" }
};

module.exports = MyClass;

observeObjectProperty(module, "exports", undefined,
    (o, p) => {


        if (o instanceof MyClass && p === "p") {

            console.log("< access to property p  of MyClass not traced >");

            return false;
        }

        if( o === MyClass && p === "v") {

            console.log("< call of MyClass.v not traced >");

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




