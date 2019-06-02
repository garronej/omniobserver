
function getPropertyNames(o: any) {


    const pSet = new Set<(string | number | symbol)>();

    let o_ = o;

    while (true) {

        Object.getOwnPropertyNames(o_).forEach(p => pSet.add(p));

        o_ = Object.getPrototypeOf(o_);

        if (!o_) {
            break;
        }

    }

    return Array.from(pSet);

}

function logFunctionCall(callExpression: string, args: any[], out: any) {

    const extra = {};

    args.forEach((value, i) => {
        extra[`p${i}`] = value;
    });

    extra["returns"] = out;

    includeStackTrace(extra);

    console.log(
        `${callExpression}(${args.length === 0 ? "" : args.map((_value, index) => `p${index}`).join(", ")}) -> `,
        extra
    );

}

function includeStackTrace(obj: Object): void {

    const { stack } = new Error();

    Object.defineProperty(
        obj,
        "stackTrace",
        {
            "enumerable": false,
            "get": () => {
                const arr = stack!.split("\n");
                for (let i = 1; i <= 4; i++) {
                    arr.shift();
                }
                const out = arr.join("\n");

                console.log(out);

                return out;

            }
        }
    );


}


const functionProxies = new WeakMap<Function, Function>();

export function observeObjectProperty(o: any, p: string | number | symbol, interceptOutput?: (out: any) => void) {

    const objName = (str => str.charAt(0).toLowerCase() + str.slice(1))
        (Object.getPrototypeOf(o).constructor.name);


    const propertyDescriptor: PropertyDescriptor = (() => {

        const propertyDescriptor = (() => {

            let pd: PropertyDescriptor | undefined = undefined;

            let o_ = o;

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
            throw new Error(`No property ${String(p)} on obj`);
        }

        if (!propertyDescriptor.configurable) {

            throw new Error(
                `Property ${String(p)} of ${objName} will not be observed (not configurable)`
            );

        }

        const logAccess = (type: "GET" | "SET", value: any) =>
            console.log(
                `${objName}.${String(p)} ${type === "GET" ? "->" : "<-"}`,
                (() => {

                    const valueAndTrace = { value };

                    includeStackTrace(valueAndTrace);

                    return valueAndTrace;

                })()
            )
            ;

        return {
            "enumerable": propertyDescriptor.enumerable,
            "configurable": true,
            "get": () => {

                const value = "value" in propertyDescriptor ?
                    propertyDescriptor.value :
                    propertyDescriptor.get!.apply(o);

                if (value instanceof Function) {

                    if (functionProxies.has(value)) {
                        return functionProxies.get(value)!
                    }

                    if (!value.name) {

                        Object.defineProperty(
                            value,
                            "name",
                            {
                                ...Object.getOwnPropertyDescriptor(value, "name"),
                                "value": String(p)
                            }
                        );

                    }

                    const valueProxy = function (...args) {

                        const binded = Function.prototype.bind.apply(value, [!!new.target ? null : this, ...args]);

                        const out = !!new.target ? new binded() : binded();

                        if (!!interceptOutput) {
                            interceptOutput(out);
                        }

                        observe(out);

                        logFunctionCall(`${!!new.target ? "new " : `${objName}.`}${String(p)}`, args, out);

                        return out;

                    };

                    Object.defineProperty(
                        valueProxy,
                        "name",
                        {
                            ...Object.getOwnPropertyDescriptor(value, "name"),
                            "value": value.name
                        }
                    );

                    {

                        const { prototype } = value;

                        if (!!prototype) {

                            for (const propertyName of [
                                ...Object.getOwnPropertyNames(prototype),
                                ...Object.getOwnPropertySymbols(prototype)
                            ]) {

                                Object.defineProperty(
                                    valueProxy.prototype,
                                    propertyName,
                                    Object.getOwnPropertyDescriptor(prototype, propertyName)!
                                );

                            }

                        }

                    }


                    for (const p of Object.getOwnPropertyNames(value)) {

                        const pd = Object.getOwnPropertyDescriptor(value, p)!;

                        if ("value" in pd && pd.value instanceof Function) {

                            Object.defineProperty(
                                valueProxy,
                                p,
                                {
                                    ...pd,
                                    "value": (() => {

                                        const f = pd.value;

                                        const f_ = function (...args) {

                                            const out = f.apply(value, args);

                                            logFunctionCall(`${value.name}.${String(p)}`, args, out);

                                            return out;

                                        };

                                        Object.defineProperty(
                                            f_,
                                            "name",
                                            {
                                                ...Object.getOwnPropertyDescriptor(f, "name"),
                                                "value": f.name
                                            }
                                        );

                                        return f_;


                                    })()
                                }
                            );

                        }


                    }

                    functionProxies.set(value, valueProxy);

                    return valueProxy;

                } else {

                    logAccess("GET", value);

                    observe(value);

                    return value;

                }

            },
            "set": value => {

                logAccess("SET", value);

                return "value" in propertyDescriptor ?
                    propertyDescriptor.value = value :
                    propertyDescriptor.set!.apply(o, value)
                    ;

            }
        };


    })();

    Object.defineProperty(o, p, propertyDescriptor);

}

const observedObjects = new WeakSet<any>();

function observeObject(o: any) {

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

    for (const p of getPropertyNames(o)) {

        try {

            observeObjectProperty(o, p);

        } catch (error) {

            console.log(`WARNING: ${error.message}`);

        }
    }


}

function observe(o: any) {

    const then = (o: any) => {

        if (o instanceof Function) {
            console.log("===========>warning, function not observed", o);
            return;
        }

        if (!(o instanceof Object)) {
            return;
        }

        observeObject(o);

    };

    if (o instanceof Object && Object.getPrototypeOf(o).constructor.name === "Promise") {
        o.then(o => then(o));
    } else {
        then(o);
    }

}

