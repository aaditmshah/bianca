var parse = require("./ast");
var global = require("./global");
var program = Object.create(global);
var number = { type: "number" };
var scope = null;

var longhand = {
    "addition": "sum",
    "subtraction": "difference",
    "multiplication": "product",
    "division": "quotient",
    "modulo": "remainder"
};

module.exports = function (code) {
    try {
        var ast = parse(code);
    } catch (error) {
        console.log("Lexical Error:");
        console.log("    " + error.message);
        process.exit(1);
    }

    var length = ast.length;

    for (var i = 0; i < length; i++) {
        var funct = ast[i];
        var name = funct.name;

        try {
            if (typeof global[name] !== "undefined") throw Error("Multiple declarations of function `" + name + "'.");
            if (typeof program[name] !== "undefined") throw new Error("Redeclaration of global `" + name + "'.");
        } catch (error) {
            console.log("Error:");
            console.log("    " + error.message);
            process.exit(1);
        }

        scope = Object.create(program);
        var params = funct.params;
        var size = params.length;
        var parameters = [];

        var desc = program[name] = {
            type: "function",
            params: parameters
        };

        for (var j = 0; j < size; j++) {
            var param = params[j];
            var type = new Type(param.dimensions);
            scope[param.name] = type;
            parameters.push(type);
        }

        try {
            analyze(funct.body, desc);
        } catch (error) {
            console.log("Error in function `" +name+ "':");
            console.log("    " + error.message);
            process.exit(1);
        }
    }

    return ast;

    function Type(dimensions) {
        if (dimensions.length) {
            this.type = "array";
            this.dimensions = dimensions;
        } else this.type = "number";
    }
};

function analyze(body, funct) {
    var length = body.length;

    for (var i = 0; i < length; i++) {
        var line = body[i];
        var type = line.type;

        switch (type) {
        case "branch":
            if (evaluate(line.condition).type !== "number")
                throw new Error("The condition must evaluate to a number.");

            var fail = line.fail;
            analyze(line.pass, funct);
            if (fail) analyze(fail, funct);

            break;
        case "assignment":
            assignment(line.left, line.right);
            break;
        case "addition":
        case "subtraction":
        case "multiplication":
        case "division":
        case "modulo":
            var left = line.left;

            assignment(left, {
                type: longhand[type],
                right: line.right,
                left: left
            });

            break;
        default:
            var result = funct.result;
            var type = evaluate(line);

            if (typeof result === "undefined") funct.result = type;
            else if (!compare(type, result)) throw new Error("Multiple types of return values.");
        }
    }
}

function assignment(left, right) {
    var name = left.name;
    var variable = scope[name];
    var indices = left.indices;
    var expression = evaluate(right);

    if (typeof variable === "undefined") {
        if (indices.length) throw new Error("Indexing a variable `" + name + "' which is not defined.");
        scope[name] = expression;
    } else {
        switch (variable.type) {
        case "array":
            var length = indices.length;
            var dimensions = variable.dimensions.length - length;

            for (var i = 0; i < length; i++)
                if (evaluate(indices[i]).type !== "number")
                    throw new Error("Index " + i + " of variable `" + name + "' must be a number.");

            if (dimensions < 0)
                throw new Error("The array `" + name + "' only has " + length + " dimensions.");
            if (!dimensions && expression.type !== "number") throw new Error("The right hand side of the assignment to `" + name + "' must be a number.");

            if (dimensions && !compare(expression, {
                type: "array",
                dimensions: dimensions
            })) throw new Error("The right hand side of the assignment to `" + name + "' must be an array of " + dimensions + " dimensions.");

            break;
        case "number":
            if (indices.length) throw new Error("The variable `" + name + "' is not an array.");
            if (expression.type !== "number") throw new Error("The variable `" + name + "' must be a number.");
            break;
        default:
            throw new Error("The function `" + name + "' is not a value.");
        }
    }
}

function evaluate(expression) {
    var type = expression.type;

    switch (type) {
    case "constant":
        return number;
    case "array":
        var dimensions = expression.dimensions;
        var length = dimensions.length;

        for (var i = 0; i < length; i++)
            if (evaluate(dimensions[i]).type !== "number")
                throw new Error("Dimension " + i + " of the new array must be a number.");

        return {
            type: "array",
            dimensions: dimensions
        };
    case "list":
        var elements = expression.elements;
        var value = evaluate(elements[0]);
        var length = elements.length;

        for (var i = 1; i < length; i++)
            if (!compare(evaluate(elements[i]), value))
                throw new Error("Element " + i + " must be of the same type as the first.");

        var dimensions = [length];
        if (value.type !== "number") dimensions = dimensions.concat(value.dimensions);

        return {
            type: "array",
            dimensions: dimensions
        };
    case "variable":
        var name = expression.name;
        var variable = scope[name];

        if (typeof variable !== "undefined") {
            var indices = expression.indices;

            switch (variable.type) {
            case "array":
                var length = indices.length
                var dimensions = variable.dimensions.length - length;

                for (var i = 0; i < length; i++)
                    if (evaluate(indices[i]).type !== "number")
                        throw new Error("Index " + i + " of variable `" + name + "' must be a number.");

                if (dimensions < 0)
                    throw new Error("The array `" + name + "' only has " + length + " dimensions.");
                if (!dimensions) return number;

                return {
                    type: "array",
                    dimensions: variable.dimensions.slice(length)
                };
            case "number":
                if (indices.length) throw new Error("The variable `" + name + "' is not an array.");
                return number;
            default:
                throw new Error("The function `" + name + "' is not a value.");
            }
        } else throw new Error("The variable `" + name + "' is not defined.");
    case "call":
        var name = expression.name;
        var funct = program[name];

        if (typeof program[name] !== "undefined") {
            if (funct.type === "function") {
                var result = funct.result;

                if (typeof result === "undefined")
                    throw new Error("Recursively calling function `" + name + "' before determining its return type.");

                var rest = funct.rest;
                var params = funct.params;
                var args = expression.args;

                var paramc = params.length;
                var argc = args.length;

                if (argc < paramc || argc > paramc && typeof rest === "undefined")
                    throw new Error("The function `" + name + "' expects " + paramc + " arguments.");

                for (var i = 0; i < paramc; i++)
                    if (!compare(evaluate(args[i]), params[i]))
                        throw new Error("Argument " + i + " of the function call to `" + name + "' is invalid.");

                while (i < argc)
                    if (!compare(evaluate(args[i++]), rest))
                        throw new Error("Argument " + (i - 1) + " of the function call to `" + name + "' is invalid.");

                return result;
            } else throw new Error("The global, `" + name + "', is not a function.");
        } else throw new Error("Calling undeclared function `" + name + "'.");
    case "negation":
    case "inversion":
        var operand = expression.operand;

        if (evaluate(operand).type !== "number")
            throw new Error("Expected a number as the operand of the operation `" + type + "'.");

        return number;
    case "sum":
    case "difference":
    case "product":
    case "quotient":
    case "remainder":
    case "conjunction":
    case "disjunction":
    case "lesser":
    case "greater":
    case "nogreater":
    case "nolesser":
    case "equal":
    case "inequal":
        var left = expression.left;
        var right = expression.right;

        if (evaluate(left).type !== "number")
            throw new Error("Expected a number on the left hand side of the operation `" + type + "'.");

        if (evaluate(right).type !== "number")
            throw new Error("Expected a number on the right hand side of the operation `" + type + "'.");

        return number;
    }
}

function compare(test, expected) {
    var type = test.type;
    if (type !== expected.type) return false;
    if (type !== "array") return true;

    test = test.dimensions;
    expected = expected.dimensions;
    var length = expected.length;

    if (length) {
        if (test.length === length) {
            for (var i = 0; i < length; i++)
                if (test[i] !== expected[i]) return false;
        } else return false;
    }

    return true;
}
