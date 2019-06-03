"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
function getPropertyNames(o) {
    var pSet = new Set();
    var o_ = o;
    while (true) {
        Object.getOwnPropertyNames(o_).forEach(function (p) { return pSet.add(p); });
        o_ = Object.getPrototypeOf(o_);
        if (!o_) {
            break;
        }
    }
    return Array.from(pSet);
}
function includeStackTrace(obj) {
    var stack = new Error().stack;
    Object.defineProperty(obj, "stackTrace", {
        "enumerable": false,
        "get": function () {
            var arr = stack.split("\n");
            for (var i = 1; i <= 4; i++) {
                arr.shift();
            }
            var out = arr.join("\n");
            console.log(out);
            return out;
        }
    });
}
function isPropNumber(p) {
    try {
        return !isNaN(parseInt(p));
    }
    catch (_a) {
        return false;
    }
}
function callShouldLog(shouldLog, o, p) {
    return shouldLog(o, typeof p === "symbol" ?
        String(p) :
        typeof p === "number" ?
            p :
            isPropNumber(p) ?
                parseInt(p) :
                p);
}
var functionProxies = new WeakMap();
function observeObjectProperty(o, p, interceptOutput, shouldLog, formatter) {
    if (shouldLog === void 0) { shouldLog = function () { return true; }; }
    if (formatter === void 0) { formatter = function (o) { return o; }; }
    var objName = o instanceof Function && !!o.name ?
        o.name
        :
            (function (str) { return str.charAt(0).toLowerCase() + str.slice(1); })(Object.getPrototypeOf(o).constructor.name);
    var logAccess = function (type, value) {
        if (!callShouldLog(shouldLog, o, p)) {
            return;
        }
        var isNumber = typeof p === "number" || typeof p !== "symbol" && isPropNumber(p);
        console.log("" + objName + (isNumber ? "[" : ".") + String(p) + (isNumber ? "]" : "") + " " + (type === "GET" ? "->" : "<-"), (function () {
            var valueAndTrace = { "value": formatter(value) };
            includeStackTrace(valueAndTrace);
            return valueAndTrace;
        })());
    };
    var logFunctionCall = function (callExpression, args, out) {
        if (!callShouldLog(shouldLog, o, p)) {
            return;
        }
        var extra = {};
        args.forEach(function (value, i) {
            extra["p" + i] = formatter(value);
        });
        extra["returns"] = formatter(out);
        includeStackTrace(extra);
        console.log(callExpression + "(" + (args.length === 0 ? "" : args.map(function (_value, index) { return "p" + index; }).join(", ")) + ") -> ", extra);
    };
    var propertyDescriptor = (function () {
        var propertyDescriptor = (function () {
            var pd = undefined;
            var o_ = o;
            while (pd === undefined) {
                pd = Object.getOwnPropertyDescriptor(o_, p);
                o_ = Object.getPrototypeOf(o_);
                if (!o_) {
                    break;
                }
            }
            return pd;
        })();
        if (propertyDescriptor === undefined) {
            throw new Error("No property " + String(p) + " on obj");
        }
        if (!propertyDescriptor.configurable) {
            throw new Error("Property " + String(p) + " of " + objName + " will not be observed (not configurable)");
        }
        return {
            "enumerable": propertyDescriptor.enumerable,
            "configurable": true,
            "get": function () {
                var e_1, _a, e_2, _b;
                var value = "value" in propertyDescriptor ?
                    propertyDescriptor.value :
                    propertyDescriptor.get.apply(o);
                if (value instanceof Function) {
                    if (functionProxies.has(value)) {
                        return functionProxies.get(value);
                    }
                    var valueProxy_1 = function _g() {
                        var _newTarget = this && this instanceof _g ? this.constructor : void 0;
                        var args = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        var binded = Function.prototype.bind.apply(value, __spread([!!_newTarget ? null : this], args));
                        var out = !!_newTarget ? new binded() : binded();
                        if (!!interceptOutput) {
                            interceptOutput(out);
                        }
                        {
                            var isNumber = typeof p === "number" || typeof p !== "symbol" && isPropNumber(p);
                            logFunctionCall([
                                !!_newTarget ? "new " : "" + objName + (isNumber ? "[" : "."),
                                p === "exports" ? (value.name || "[default export]") : String(p),
                                isNumber ? "]" : ""
                            ].join(""), args, out);
                        }
                        observe(out, shouldLog, formatter);
                        return out;
                    };
                    Object.defineProperty(valueProxy_1, "name", __assign({}, Object.getOwnPropertyDescriptor(value, "name"), { "value": value.name }));
                    {
                        var prototype = value.prototype;
                        if (!!prototype) {
                            try {
                                for (var _c = __values(__spread(Object.getOwnPropertyNames(prototype), Object.getOwnPropertySymbols(prototype))), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var propertyName = _d.value;
                                    Object.defineProperty(valueProxy_1.prototype, propertyName, Object.getOwnPropertyDescriptor(prototype, propertyName));
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        }
                    }
                    try {
                        for (var _e = __values(Object.getOwnPropertyNames(value)
                            .filter(function (p) { return [
                            "length",
                            "name",
                            "arguments",
                            "caller",
                            "prototype"
                        ].indexOf(p) < 0; })), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var p_1 = _f.value;
                            var pd = Object.getOwnPropertyDescriptor(value, p_1);
                            Object.defineProperty(valueProxy_1, p_1, pd);
                            observeObjectProperty(valueProxy_1, p_1, undefined, function (o, p) { return shouldLog(o === valueProxy_1 ? value : o, p); }, function (o) { return formatter(o === valueProxy_1 ? value : o); });
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    functionProxies.set(value, valueProxy_1);
                    return valueProxy_1;
                }
                else {
                    logAccess("GET", value);
                    observe(value, shouldLog, formatter);
                    return value;
                }
            },
            "set": function (value) {
                logAccess("SET", value);
                return "value" in propertyDescriptor ?
                    propertyDescriptor.value = value :
                    propertyDescriptor.set.apply(o, value);
            }
        };
    })();
    Object.defineProperty(o, p, propertyDescriptor);
}
exports.observeObjectProperty = observeObjectProperty;
var observedObjects = new WeakSet();
function observeObject(o, shouldLog, formatter) {
    var e_3, _a;
    if (o instanceof Function) {
        throw new Error("cannot observe function");
    }
    if (!(o instanceof Object)) {
        throw new Error("not an object, cannot observe");
    }
    if (Object.getPrototypeOf(o).constructor.name === "Promise") {
        throw new Error("should not observe Promise");
    }
    if (observedObjects.has(o)) {
        return;
    }
    observedObjects.add(o);
    try {
        for (var _b = __values(getPropertyNames(o)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var p = _c.value;
            if (p === "valueOf") {
                continue;
            }
            if (p === "length" && (o instanceof Array || o instanceof Uint8Array)) {
                continue;
            }
            if (o instanceof Uint8Array && isPropNumber(p)) {
                continue;
            }
            try {
                observeObjectProperty(o, p, undefined, shouldLog, formatter);
            }
            catch (error) {
                if (shouldLog(o, p)) {
                    console.log("WARNING: " + error.message);
                }
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
}
function observe(o, shouldLog, formatter) {
    var then = function (o) {
        if (o instanceof Function) {
            console.log("===========>warning, function not observed", o);
            return;
        }
        if (!(o instanceof Object)) {
            return;
        }
        observeObject(o, shouldLog, formatter);
    };
    if (o instanceof Object && Object.getPrototypeOf(o).constructor.name === "Promise") {
        o.then(function (o) { return then(o); });
    }
    else {
        then(o);
    }
}
