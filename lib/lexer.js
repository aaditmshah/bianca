var Lexer = require("lex");

var row = 1;
var col = 1;

var indent = [0];

var lexer = module.exports = new Lexer(function (char) {
    throw new Error("Unexpected character at row " + row + ", col " + col + ": " + char);
});

lexer.addRule(/\n+/, function (lexeme) {
    col = 1;
    row += lexeme.length;
    return "NEWLINE";
});

lexer.addRule(/^ */gm, function (lexeme) {
    var indentation = lexeme.length;

    col += indentation;

    if (indentation > indent[0]) {
        indent.unshift(indentation);
        return "INDENT";
    }

    var tokens = [];

    while (indentation < indent[0]) {
        tokens.push("DEDENT");
        indent.shift();
    }

    if (tokens.length) return tokens;
});

lexer.addRule(/ +/, function (lexeme) {
    col += lexeme.length;
});

lexer.addRule(/\d+/, function (lexeme) {
    this.yytext = +lexeme;
    col += lexeme.length;
    return "INDEX";
});

lexer.addRule(/[-\+]?\d+(?:\.\d+)?/, function (lexeme) {
    this.yytext = +lexeme;
    col += lexeme.length;
    return "NUMBER";
});

lexer.addRule(/if/, function (lexeme) {
    col += lexeme.length;
    return "IF";
});

lexer.addRule(/else/, function (lexeme) {
    col += lexeme.length;
    return "ELSE";
});

lexer.addRule(/[a-z]+/, function (lexeme) {
    col += lexeme.length;
    this.yytext = lexeme;
    return "SYMBOL";
});

lexer.addRule(/\[/, function () {
    col++;
    return "[";
});

lexer.addRule(/\]/, function () {
    col++;
    return "]";
});

lexer.addRule(/\(/, function () {
    col++;
    return "(";
});

lexer.addRule(/\)/, function () {
    col++;
    return ")";
});

lexer.addRule(/\+/, function () {
    col++;
    return "+";
});

lexer.addRule(/\-/, function () {
    col++;
    return "-";
});

lexer.addRule(/\*/, function () {
    col++;
    return "*";
});

lexer.addRule(/\//, function () {
    col++;
    return "/";
});

lexer.addRule(/\%/, function () {
    col++;
    return "%";
});

lexer.addRule(/</, function () {
    col++;
    return "<";
});

lexer.addRule(/>/, function () {
    col++;
    return ">";
});

lexer.addRule(/<=/, function () {
    col++;
    return "<=";
});

lexer.addRule(/>=/, function () {
    col++;
    return ">=";
});

lexer.addRule(/==/, function () {
    col++;
    return "==";
});

lexer.addRule(/!=/, function () {
    col++;
    return "!=";
});

lexer.addRule(/!/, function () {
    col++;
    return "!";
});

lexer.addRule(/\&/, function () {
    col++;
    return "&";
});

lexer.addRule(/\|/, function () {
    col++;
    return "|";
});

lexer.addRule(/=/, function () {
    col++;
    return "=";
});

lexer.addRule(/\+=/, function () {
    col++;
    return "+=";
});

lexer.addRule(/\-=/, function () {
    col++;
    return "-=";
});

lexer.addRule(/\*=/, function () {
    col++;
    return "*=";
});

lexer.addRule(/\/=/, function () {
    col++;
    return "/=";
});

lexer.addRule(/\%=/, function () {
    col++;
    return "%=";
});

lexer.addRule(/,/, function () {
    col++;
    return ",";
});

lexer.addRule(/$/, function () {
    return "EOF";
});
