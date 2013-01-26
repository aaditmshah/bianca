var Parser = require("jison").Parser;

module.exports = new Parser({
    "operators": [
        ["left", ","],
        ["right", "=", "+=", "-=", "*=", "/=", "%="],
        ["left", "&", "|"],
        ["left", "==", "!="],
        ["left", "<", ">", "<=", ">="],
        ["left", "+", "-"],
        ["left", "*", "/", "%"],
        ["right", "!", "NEGATE"]
    ],
    "bnf": {
        "program": [
            ["functions EOF", "return $1;"]
        ],
        "functions": [
            ["function",           "$$ = [$1];"],
            ["functions function", "$$ = $1.concat($2);"]
        ],
        "function": [
            ["identifier ( params ) block", "$$ = new yy.Function($1, $3, $5);"]
        ],
        "identifier": [
            ["SYMBOL", "$$ = yytext;"]
        ],
        "params": [
            ["param",          "$$ = [$1];"],
            ["params , param", "$$ = $1.concat($3);"]
        ],
        "param": [
            ["identifier",      "$$ = new yy.Param($1);"],
            ["param dimension", "$$ = $1; $$.dimensions.push($2);"]
        ],
        "dimension": [
            ["[ ]",       "$$ = 0;"],
            ["[ INDEX ]", "$$ = yytext;"]
        ],
        "block": [
            ["expression NEWLINE",          "$$ = [$1];"],
            ["NEWLINE INDENT lines DEDENT", "$$ = $3;"]
        ],
        "lines": [
            ["line",       "$$ = [$1];"],
            ["lines line", "$$ = $1.concat($2);"]
        ],
        "line": [
            ["branch",         "$$ = $1;"],
            ["phrase NEWLINE", "$$ = $1;"]
        ],
        "phrase": [
            ["expression", "$$ = $1;"],
            ["statement",  "$$ = $1;"]
        ],
        "expression": [
            ["variable",                 "$$ = $1;"],
            ["( expression )",           "$$ = $2;"],
            ["[ elements ]",             "$$ = new yy.Value('list', $2);"],
            ["indices",                  "$$ = new yy.Value('array', $1);"],
            ["identifier ( list )",      "$$ = new yy.Value('call', $1, $3);"],
            ["INDEX",                    "$$ = new yy.Value('constant', yytext);"],
            ["NUMBER",                   "$$ = new yy.Value('constant', yytext);"],
            ["- expression",             "$$ = new yy.Value('negation', $2);", {"prec": "NEGATE"}],
            ["! expression",             "$$ = new yy.Value('inversion', $2);"],
            ["expression + expression",  "$$ = new yy.Value('sum', $1, $3);"],
            ["expression - expression",  "$$ = new yy.Value('difference', $1, $3);"],
            ["expression * expression",  "$$ = new yy.Value('product', $1, $3);"],
            ["expression / expression",  "$$ = new yy.Value('quotient', $1, $3);"],
            ["expression % expression",  "$$ = new yy.Value('remainder', $1, $3);"],
            ["expression & expression",  "$$ = new yy.Value('conjunction', $1, $3);"],
            ["expression | expression",  "$$ = new yy.Value('disjunction', $1, $3);"],
            ["expression < expression",  "$$ = new yy.Value('lesser', $1, $3);"],
            ["expression > expression",  "$$ = new yy.Value('greater', $1, $3);"],
            ["expression <= expression", "$$ = new yy.Value('nogreater', $1, $3);"],
            ["expression >= expression", "$$ = new yy.Value('nolesser', $1, $3);"],
            ["expression == expression", "$$ = new yy.Value('equal', $1, $3);"],
            ["expression != expression", "$$ = new yy.Value('inequal', $1, $3);"]
        ],
        "indices": [
            ["index",         "$$ = [$1];"],
            ["indices index", "$$ = $1.concat($2);"]
        ],
        "index": [
            ["[ expression ]", "$$ = $2;"]
        ],
        "variable": [
            ["identifier",              "$$ = new yy.Value('variable', $1);"],
            ["variable [ expression ]", "$$ = $1; $$.indices.push($3);"]
        ],
        "list": [
            ["expression",        "$$ = [$1];"],
            ["list , expression", "$$ = $1.concat($3);"]
        ],
        "elements": [
            ["expression , expression", "$$ = [$1, $2];"],
            ["elements , expression",   "$$ = $1.concat($3);"]
        ],
        "statement": [
            ["variable = phrase",  "$$ = new yy.Value('assignment', $1, $3);"],
            ["variable += phrase", "$$ = new yy.Value('addition', $1, $3);"],
            ["variable -= phrase", "$$ = new yy.Value('subtraction', $1, $3);"],
            ["variable *= phrase", "$$ = new yy.Value('multiplication', $1, $3);"],
            ["variable /= phrase", "$$ = new yy.Value('division', $1, $3);"],
            ["variable %= phrase", "$$ = new yy.Value('modulo', $1, $3);"]
        ],
        "if": [
            ["IF ( expression ) block", "$$ = new yy.Value('branch', $3, $5);"]
        ],
        "else": [
            ["ELSE branch", "$$ = $2;"],
            ["ELSE block",  "$$ = $2;"]
        ],
        "branch": [
            ["if",      "$$ = $1;"],
            ["if else", "$$ = $1; $$.fail = $2;"]
        ]
    }
});
