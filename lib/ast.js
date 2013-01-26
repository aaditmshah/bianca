var parser = require("./parser");
parser.lexer = require("./lexer");

module.exports = function (code) {
    return parser.parse(code + "\n");
};

var yy = parser.yy;

yy.Function = function (name, params, body) {
    this.name = name;
    this.params = params;
    this.body = body;
};

yy.Param = function (name, type) {
    this.name = name;
    this.dimensions = [];
};

yy.Value = function (type) {
    switch (this.type = type) {
    case "array":
        this.dimensions = arguments[1];
        break;
    case "list":
        this.elements = arguments[1];
        break;
    case "constant":
        this.value = arguments[1];
        break;
    case "variable":
        this.name = arguments[1];
        this.indices = [];
        break;
    case "call":
        this.name = arguments[1];
        this.args = arguments[2];
        break;
    case "negation":
    case "inversion":
        this.operand = arguments[1];
        break;
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
    case "assignment":
    case "addition":
    case "subtraction":
    case "multiplication":
    case "division":
    case "modulo":
        this.left = arguments[1];
        this.right = arguments[2];
        break;
    case "branch":
        this.condition = arguments[1];
        this.pass = arguments[2];
    }
};
