# Bianca #

An automated white-box algorithm testing language which compiles down to JSON AST.

## Installation ##

Bianca will help you test all your mathematical algorithms. All you need to do is request an appointment with [npm](https://npmjs.org/ "npm"):

```bash
npm install -g bianca
```

## Getting Started ##

Bianca is an expert at testing mathematical algorithms. Everything about her reflects her innate testability.

Every program in Bianca is composed of one or more functions. Functions in Bianca must have at least one argument and must always return a value. For example:

```bianca
square(x) x * x

pythagoras(x, y)
    square(x) + square(y)
```

Bianca doesn't allow you to use functions before they are declared. This forces programmers to write functions which don't have any cyclic dependencies. This simplifies testing.

Unlike other languages like Ruby, Python and Perl, Bianca doesn't return the last expression of a function. Instead it returns the first expression of the function. For example:

```bianca
pythagoras(x, y)
    xsq = x * x
    ysq = y * y
    xsq + ysq
```

Any line after the expression `xsq + ysq` will raise an error. This is in spirit of the language because expressions do not have any side effects (functions in Bianca are pure). Hence it makes no sense to keep expressions dangling unless you wish to return them.

Bianca only supports `if`, `else` and `else if` for branching. The logical `AND` and `OR` operators are `&` and `|` respectively. This is because Bianca doesn't have bitwise operators as it's a mathematical algorithm testing language:

```bianca
fact(n)
    if (n < 0) 0
    if (n == 0) 1
    n * fact(n - 1)
```

Bianca doesn't have any constructs for creating loops. Instead you must create loops using functions. This is beneficial because functions are the basic testable unit in Bianca. This allows you to test individual parts of the algorithm separately by splitting it into different functions. For example, adding two 3x3 matrices:

```bianca
col(a[3][3], b[3][3], i, j)
    if (j >= 3) a
    a[i][j] += b[i][j]
    col(a, b, i, j + 1)

row(a[3][3], b[3][3], i)
    if (i >= 3) a
    a = col(a, b, i, 0)
    row(a, b, i + 1)

add(a[3][3], b[3][3])
    row(a, b, 0)
```

## Compiling Bianca Programs ##

Unlike other languages Bianca is not meant to be executed directly. Hence the `bianca` compiler doesn't transform Bianca programs into another language. Instead it produces an Abstract Syntax Tree in JSON format which can easily be converted into any other programming language you want. For example:

```bash
bianca factorial.bianca
```

The above program verifies the semantic correctness of the program `factorial.bianca` and then writes the AST to the file `factorial.ast.json`. Hence Bianca can be used as a general purpose algorithm tester for any language.

## Unit Testing ##

Just compiling a program is not very useful by itself. What Bianca is really good at is automatic unit testing. You may create a simple JSON test file for your `.bianca` program and when you compile it the compiler will automatically run the unit tests for you and notify you about any errors. For example:

```json
{
    "fact": [
        {
            args: [5],
            result: 120
        },
        {
            args: [0],
            result: 1
        },
        {
            args: [-10],
            result: 0
        }
    ]
}
```

The above JSON test file must be saved as `factorial.test.json`. When compiling `factorial.bianca` this file will automatically be read and the compiler will run three units tests. The output will be something like this:

```bash
Passed.
Passed.
Passed.
```

## FAQ ##

__Why did you name the language Bianca?__

Bianca means white in Italian, and this language performs white-box testing on algorithms. However I mostly named this language Bianca because I used to like a girl named Bianca.

__Why did you create this language?__

For the challenge it imposed. This is the first true programming language I created and it's very satisfying. I was inspired to create it after enlisting in the PLT games competition.

__Do you think you will win?__

I do hope so. It took me a lot of effort to create this language, and I believe I put a little more effort than other participants. My language is definitely the biggest one in the current competition. Take a look at the code. I created my own lexer, parser, ast generator, semantic analyzer, code generator and test runner. That's a lot of work in a very little time.
