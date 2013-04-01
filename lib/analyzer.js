var parse = require("./ast");
var global = require("./global");
var program = Object.create(global);
var n1, n2, N1, N2;
var scope = null;
var complexity;
var context;
var calls;

var operator = {
    "negation": "-",
    "inversion": "!",
    "sum": "+",
    "difference": "-",
    "product": "*",
    "quotient": "/",
    "remainder": "%",
    "conjunction": "&&",
    "disjunction": "||",
    "lesser": "<",
    "greater": ">",
    "nogreater": "<=",
    "nolesser": ">=",
    "equal": "===",
    "inequal": "!==",
    "addition": "+=",
    "subtraction": "-=",
    "multiplication": "*=",
    "division": "/=",
    "modulo": "%="
};

function log2(n) {
    return Math.log(n) / Math.LN2;
}

module.exports = function (code) {
    var magenta = "\x1B[35m";
    var yellow = "\x1B[33m";
    var green = "\x1B[32m";
    var red = "\x1B[31;1m";
    var reset = "\x1B[0m";

    try {
        var ast = parse(code);
    } catch (error) {
        console.log(red + "Syntax Error:");
        console.log("    " + error.message + reset);
        process.exit(1);
    }

    var length = ast.length;

    for (var i = 0; i < length; i++) {
        var funct = ast[i];
        var name = funct.name;

        try {
            if (typeof global[name] !== "undefined") throw new Error("Redeclaration of global `" + name + "'.");
            if (typeof program[name] !== "undefined") throw Error("Multiple declarations of function `" + name + "'.");
        } catch (error) {
            console.log(red + "Error:");
            console.log("    " + error.message + reset);
            process.exit(1);
        }

        scope = Object.create(program);
        var params = funct.params;
        var size = params.length;
        var parameters = [];
        var args = [];

        var desc = program[name] = {
            type: "function",
            params: parameters
        };

        for (var j = 0; j < size; j++) {
            var param = params[j];
            var type = new Type(param.dimensions);
            parameters.push(type);
            var arg = param.name;
            scope[arg] = type;
            args.push(arg);
        }

        complexity = 1;
        context = name;

        calls = {
            "if": 0
        };

        n1 = [];
        n2 = [];
        N1 = 0;
        N2 = 0;

        try {
            args.push(analyze(funct.body, desc, true));
            desc.funct = eval("(" + Function.apply(null, args) + ")");
            if (typeof desc.result === "undefined") throw new Error("No return value expressed.");
        } catch (error) {
            console.log(red + "Error in function `" + name + "':");
            console.log("    " + error.message + reset);
            process.exit(1);
        }

        n1 = n1.length;
        n2 = n2.length;

        var n = n1 + n2;
        var N = N1 + N2;

        var calculatedN = n1 * log2(n1) + n2 * log2(n2);

        var V = N * log2(n);
        var D = n1 * N2 / (2 * n2);
        var E = D * V;

        var T = E / 18;
        var B = V / 3000;

        desc.complexity = complexity;

        var stats = [];
        var keys = Object.keys(calls);
        var size = keys.length;

        for (var j = 0; j < size; j++) {
            var key = keys[j];
            stats.push(magenta + key + reset + " x " + yellow + calls[key] + reset);
        }

        console.log(green + "Cyclomatic complexity" + reset + " of " + magenta + name + reset + ": " + yellow + complexity + reset + " (" + stats.join(", ") + ")\n");

        console.log("Number of distinct operators: " + yellow + n1 + reset);
        console.log("Number of distinct operands: " + yellow + n2 + reset);
        console.log("Total number of operators: " + yellow + N1 + reset);
        console.log("Total number of operands: " + yellow + N2 + reset + "\n");

        console.log("Vocabulary: " + yellow + n + reset);
        console.log("Length: " + yellow + N + reset);
        console.log("Calculated length: " + yellow + calculatedN.toFixed(2) + reset + "\n");

        console.log("Volume: " + yellow + V.toFixed(2) + reset);
        console.log("Difficulty: " + yellow + D.toFixed(2) + reset);
        console.log("Effort: " + yellow + E.toFixed(2) + reset + "\n");

        console.log("Estimated time required to program: " + yellow + T.toFixed(2) + reset + " seconds");
        console.log("Estimated number of potential bugs: " + yellow + B.toFixed(2) + reset + "\n");
    }

    return [ast, program];

    function Type(dimensions) {
        if (dimensions.length) {
            this.type = "array";
            this.dimensions = dimensions;
        } else this.type = "number";
    }
};

function analyze(body, funct, block) {
    var length = body.length;
    var last = length - 1;
    var result = null;
    var code = [];

    for (var i = 0; i < length; i++) {
        var line = body[i];
        var type = line.type;

        switch (type) {
        case "branch":
            complexity++;
            calls["if"]++;

            var condition = evaluate(line.condition);

            if (condition.type === "number") var branch = "if("+ condition.code +"){\n";
            else throw new Error("The condition must evaluate to a number.");
            branch += analyze(line.pass, funct) + "\n}";

            var fail = line.fail;
            if (fail) branch += "else{\n" + analyze(fail, funct) + "\n}";
            code.push(branch);

            break;
        case "assignment":
            if (++N1 && n1.indexOf("=") < 0) n1.push("=");
            code.push(assignment(line.left, evaluate(line.right)));
            break;
        case "addition":
        case "subtraction":
        case "multiplication":
        case "division":
        case "modulo":
            code.push(evaluate(line).code);
            break;
        default:
            if (i < last) throw new Error("The function returns before the end of the code.");

            result = funct.result;
            var type = evaluate(line);
            code.push("return " + type.code + ";");
            if (typeof result === "undefined") result = funct.result = type;
            else if (!compare(type, result)) throw new Error("Multiple types of return values.");
        }
    }

    if (block && !result) throw new Error("The function must always return a value.");

    return code.join("\n");
}

function assignment(left, expression) {
    var name = left.name;
    var variable = scope[name];
    var indices = left.indices;

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

    return "(" + evaluate(left).code + "=" + expression.code + ")";
}

function evaluate(expression) {
    var type = expression.type;

    switch (type) {
    case "constant":
        var value = expression.value
        n2.push(value);
        N2++;

        return {
            type: "number",
            code: value
        };
    case "array":
        var dimensions = expression.dimensions;
        var length = dimensions.length;
        var array = [];

        for (var i = 0; i < length; i++) {
            var dimension = evaluate(dimensions[i]);
            if (dimension.type === "number") array.push(dimension.code);
            else throw new Error("Dimension " + i + " of the new array must be a number.");
        }

        return {
            type: "array",
            dimensions: dimensions,
            code: "alloc([" + array.join(",") + "])"
        };
    case "list":
        var elements = expression.elements;
        var value = evaluate(elements[0]);
        var length = elements.length;
        elements[0] = value.code;

        for (var i = 1; i < length; i++) {
            var element = evaluate(elements[i]);
            if (compare(element, value)) elements[i] = element.code;
            else throw new Error("Element " + i + " must be of the same type as the first.");
        }

        var dimensions = [length];
        if (value.type !== "number") dimensions = dimensions.concat(value.dimensions);

        return {
            type: "array",
            dimensions: dimensions,
            code: "[" + elements.join(",") + "]"
        };
    case "variable":
        var name = expression.name;
        var variable = scope[name];

        if (++N2 && n2.indexOf(name) < 0) n2.push(name);

        if (typeof variable !== "undefined") {
            var indices = expression.indices;

            switch (variable.type) {
            case "array":
                var length = indices.length
                var dimensions = variable.dimensions.length - length;

                for (var i = 0; i < length; i++) {
                    var index = evaluate(indices[i]);
                    if (index.type !== "number") throw new Error("Index " + i + " of variable `" + name + "' must be a number.");
                    indices[i] = index.code;
                }

                var code = name;
                if (dimensions < 0) throw new Error("The array `" + name + "' only has " + length + " dimensions.");
                if (length) code += "[" + indices.join("][") + "]";

                if (!dimensions) return {
                    type: "number",
                    code: code
                };

                return {
                    code: code,
                    type: "array",
                    dimensions: variable.dimensions.slice(length)
                };
            case "number":
                if (indices.length) throw new Error("The variable `" + name + "' is not an array.");

                return {
                    type: "number",
                    code: name
                };
            default:
                throw new Error("The function `" + name + "' is not a value.");
            }
        } else throw new Error("The variable `" + name + "' is not defined.");
    case "call":
        var name = expression.name;
        var funct = program[name];

        if (++N1 && n1.indexOf(name) < 0) n1.push(name);

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
                var argv = [];

                if (argc < paramc || argc > paramc && typeof rest === "undefined")
                    throw new Error("The function `" + name + "' expects " + paramc + " arguments.");

                for (var i = 0; i < paramc; i++) {
                    var arg = evaluate(args[i]);
                    if (compare(arg, params[i])) argv.push(arg.code);
                    else throw new Error("Argument " + i + " of the function call to `" + name + "' is invalid.");
                }

                while (i < argc) {
                    var arg = evaluate(args[i++]);
                    if (compare(arg, rest)) argv.push(arg.code);
                    else throw new Error("Argument " + (i - 1) + " of the function call to `" + name + "' is invalid.");
                }

                result.code = "program['" + name + "'].funct(" + argv.join(",") + ")";

                if (name !== context) {
                    complexity += funct.complexity;
                    if (calls[name]) calls[name]++;
                    else calls[name] = 1;
                }

                return result;
            } else throw new Error("The global, `" + name + "', is not a function.");
        } else throw new Error("Calling undeclared function `" + name + "'.");
    case "negation":
    case "inversion":
        var opcode = operator[type];
        var operand = evaluate(expression.operand);
        if (++N1 && n1.indexOf(opcode) < 0) n1.push(opcode);

        if (operand.type !== "number")
            throw new Error("Expected a number as the operand of the operation `" + type + "'.");

        return {
            type: "number",
            code: "(" + opcode + operand.code + ")"
        };
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
    case "addition":
    case "subtraction":
    case "multiplication":
    case "division":
    case "modulo":
        var opcode = operator[type];
        var left = evaluate(expression.left);
        var right = evaluate(expression.right);
        if (++N1 && n1.indexOf(opcode) < 0) n1.push(opcode);

        if (left.type !== "number")
            throw new Error("Expected a number on the left hand side of the operation `" + type + "'.");

        if (right.type !== "number")
            throw new Error("Expected a number on the right hand side of the operation `" + type + "'.");

        return {
            type: "number",
            code: "(" + left.code + opcode + right.code + ")"
        };
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

function alloc(dimensions) {
    var container = dimensions.length > 1;
    var length = dimensions[0];
    var array = [];

    if (container)
        for (var i = 0; i < length; i++)
            array.push(alloc(dimensions.slice(1)));
    else
        for (var i = 0; i < length; i++)
            array.push(0);

    return array;
}
