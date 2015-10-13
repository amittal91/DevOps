var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');

function main()
{
    var args = process.argv.slice(2);

    if( args.length == 0 )
    {
        args = ["subject.js"];
    }
    var filePath = args[0];

    constraints(filePath);

    generateTestCases()

}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
    if( greaterThan )
        return Random.integer(constraintValue,constraintValue+10)(engine);
    else
        return Random.integer(constraintValue-10,constraintValue)(engine);
}

function Constraint(properties)
{
    this.ident = properties.ident;
    this.expression = properties.expression;
    this.operator = properties.operator;
    this.value = properties.value;
    this.funcName = properties.funcName;
    // Supported kinds: "fileWithContent","fileExists"
    // integer, string, phoneNumber
    this.kind = properties.kind;
}

function fakeDemo()
{
    console.log( faker.phone.phoneNumber() );
    console.log( faker.phone.phoneNumberFormat() );
    console.log( faker.phone.phoneFormats() );
}

var functionConstraints =
{
}

//Added an empty file
var mockFileLibrary = 
{
    pathExists:
    {
        'path/fileExists': {}
    },
    fileWithContent:
    {
        pathContent: 
        {   
            file1: 'text content',
        },
        pathContentEmpty:
        {
            file2: '',
        }
    }
};

var permArr = [],
  usedChars = [];

// Takes a list of lists and returns lists of all possible cross products
// Reference : Stack Overflow
function cartesianProductOf(argument) {
    return _.reduce(argument, function(a, b) {
        return _.flatten(_.map(a, function(x) {
            return _.map(b, function(y) {
                return x.concat([y]);
            });
        }), true);
    }, [ [] ]);
};

// Takes in a number, converts it to string and pads it with 0 to convert a 3 digit string
// Used to generate phone numbers having all possible area codes
function padNumber(num) {
    var numLength = num.toString().length;
    padDigits = 3 - (numLength % 3);
    numberString = num.toString();
    if (padDigits == 1)
    {
        var result = "0" + numberString;
        return result;
    }

    else if (padDigits == 2)
    {
        var result = "00" + numberString;
        return result;
    }

    else
        return numberString;
}

function generateTestCases()
{

    
    var content = "var subject = require('./subject.js')\nvar mock = require('mock-fs');\n";
    for ( var funcName in functionConstraints )
    {
        
        var params = {};
        // initialize params
        for (var i =0; i < functionConstraints[funcName].params.length; i++ )
        {
            
            var paramName = functionConstraints[funcName].params[i];
            //params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
            params[paramName] = ['\'\''];
        }

        // update parameter values based on known constraints.
        var constraints = functionConstraints[funcName].constraints;
        // Handle global constraints...
        var fileWithContent = _.some(constraints, {kind: 'fileWithContent' });
        var pathExists      = _.some(constraints, {kind: 'fileExists' });
        
        //returns true if function contains a parameter called phoneNumber
        var phoneNumberExists = _.contains(functionConstraints[funcName].params, "phoneNumber");
        //returns false if function contains a parameter called phoneNumber
        var optionsExists = _.contains(functionConstraints[funcName].params, "options");

        // plug-in values for parameters
        //For each function, for each each constraint, we are creating a list of params.
        for( var c = 0; c < constraints.length; c++ )
        {
            var constraint = constraints[c];

            if( params.hasOwnProperty( constraint.ident ) )
            {
                if (constraint.ident == "filePath")
                {
                    if( constraint.kind == "fileWithContent")
                    {
                        params[constraint.ident].push(constraint.value);
                    }
                }
                else if (constraint.ident == "dir")
                {
                    if( constraint.kind == "fileExists")
                    {
                        params[constraint.ident].push(constraint.value);
                    }
                }
                else {

                    params[constraint.ident].push(constraint.value);
                }
            }
        }

        //arglist would contatin a list of lists of params for each function. e.g. if a function contains 3 params
        // x, y, z with values x :[ 1,2] , y: [3,4], z[5,6], then arglist would contain arglist = [[1,2],[3,4],[5,6]]
        var arglist = [];
            
        for (var key in params )
        {
            arglist.push(params[key]);
        }

        // This would return the cross product of all the lists present in arglist. For the above example the result
        // would be something like [[1,3,5] , [1,4,6] , [2,3,5],........]
        combination = cartesianProductOf(arglist);

        for (var i=0 ; i<combination.length; i++ )
        {
            //Checks if this function is not for the file function
            if(!pathExists || !fileWithContent)
            {
                content += "subject.{0}({1});\n".format(funcName, combination[i] );
            }    


            //checks if this function is the file function
            if( pathExists || fileWithContent )
            {
                var stringEmpty = false;
                // checks if both the params dir and filepath passed to the function are empty.
                // If they are empty then doesn't pass it to content because passing empty parameters
                // causes a bad file descriptor error.
                for (var j=0; j<combination[i].length; j++ )
                {
                    if (combination[i][j] == "''" && combination[i][j+1] == "''")
                    {
                        stringEmpty = true;
                        break ;
                    }
                }
                if(!stringEmpty)
                {
                    content += generateMockFsTestCases(pathExists,fileWithContent,funcName, combination[i]);
                    // Bonus...generate constraint variations test cases....
                    content += generateMockFsTestCases(!pathExists,fileWithContent,funcName, combination[i]);
                    content += generateMockFsTestCases(pathExists,!fileWithContent,funcName, combination[i]);
                    content += generateMockFsTestCases(!pathExists,!fileWithContent,funcName, combination[i]);
                }
            }

        }
        // If the function is any of the function with phoneNumber as paramter, then generate phone numbers with all
        // possible area codes.
        if (phoneNumberExists )
        {
            for( var i =0 ; i<1000 ; i++) 
            {
                result = padNumber(i) + "1111111"
                //Checks if for the function options parameter also exists. If yes then pass in some dummy option as well.
                if (optionsExists)
                {
                    result = '"'+result+'","","'+i+'"'
                    content += "subject.{0}({1});\n".format(funcName, result ); 
                }
                else 
                {
                    content += "subject.{0}({1});\n".format(funcName, '"'+result+'"' ); 
                }
            }
        }
    }
    fs.writeFileSync('test.js', content, "utf8");
}

function generateMockFsTestCases (pathExists,fileWithContent,funcName,args) 
{
    var testCase = "";
    // Build mock file system based on constraints.
    var mergedFS = {};
    if( pathExists )
    {
        for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
    }
    if( fileWithContent )
    {
        for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
    }

    testCase += 
    "mock(" +
        JSON.stringify(mergedFS)
        +
    ");\n";

    testCase += "\tsubject.{0}({1});\n".format(funcName, args );
    testCase+="mock.restore();\n";
    return testCase;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
    var result = esprima.parse(buf, options);

    traverse(result, function (node) 
    {
        if (node.type === 'FunctionDeclaration') 
        {
            var funcName = functionName(node);
            //console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

            var params = node.params.map(function(p) {return p.name});

            functionConstraints[funcName] = {constraints:[], params: params};

            // Check for expressions using argument.
            traverse(node, function(child)
            {
                if( child.type === 'BinaryExpression' && child.operator == "==")
                {
                    if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1 )
                    {
                        // get expression from original source code:
                        var expression = buf.substring(child.range[0], child.range[1]);
                        var rightHand = buf.substring(child.right.range[0], child.right.range[1])
                        //console.log ('Inside == \t Funcname' + funcName + "Child name" + child.left.name  + 'value =' + )
                        functionConstraints[funcName].constraints.push( 
                            new Constraint(
                            {
                                ident: child.left.name,
                                value: rightHand,
                                funcName: funcName
                            }));    

                        var newValue = "'random1234"+rightHand+"'"
                        functionConstraints[funcName].constraints.push( 
                            new Constraint(
                            {
                                ident: child.left.name,
                                value: newValue,
                                funcName: funcName
                            }));

                    }

                    if( child.left.type == 'CallExpression' && params.indexOf( child.left.callee.object.name ) > -1 )
                    {
                        // get expression from original source code:
                        var expression = buf.substring(child.range[0], child.range[1]);
                        var result = ''
                        for (var i=0 ; i<=child.right.value; i++)
                        {
                            if (i == child.right.value)
                            {
                                result += child.left.arguments[0].value
                            }

                            else
                            {
                                result += "a";
                            }
                        }
                        
                        functionConstraints[funcName].constraints.push( 
                            new Constraint(
                            {
                                ident: child.left.callee.object.name,
                                value: '"'+ result + '"',
                                funcName: funcName
                            }));    
                    }
                }

                if( child.type === 'BinaryExpression' && child.operator == "<")
                {
                    if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1 )
                    {
                        // get expression from original source code:
                        var expression = buf.substring(child.range[0], child.range[1]);
                        var rightHand = buf.substring(child.right.range[0], child.right.range[1])
                        functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                            ident: child.left.name,
                            value: rightHand - 1,
                            funcName: funcName
                        }));

                        functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                            ident: child.left.name,
                            value: rightHand + 1,
                            funcName: funcName
                        }));
                    }
                }   

                if( child.type === 'BinaryExpression' && child.operator == ">")
                {
                    if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1 )
                    {
                        // get expression from original source code:
                        var expression = buf.substring(child.range[0], child.range[1]);
                        var rightHand = buf.substring(child.right.range[0], child.right.range[1])
                        functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                            ident: child.left.name,
                            value: rightHand + 1,
                            funcName: funcName
                        }));

                        functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                            ident: child.left.name,
                            value: rightHand - 1,
                            funcName: funcName
                        }));
                    }
                }   


                if( child.type === 'BinaryExpression' && child.operator == "!=")
                {
                    if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1 )
                    {
                        // get expression from original source code:
                        var expression = buf.substring(child.range[0], child.range[1]);
                        var rightHand = buf.substring(child.right.range[0], child.right.range[1])
                        var newValue = "'random1234"+rightHand+"'"
                        functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                            ident: child.left.name,
                            value: newValue,
                            funcName: funcName
                        }));

                        functionConstraints[funcName].constraints.push( 
                        new Constraint(
                        {
                            ident: child.left.name,
                            value: rightHand,
                            funcName: funcName
                        }));
                    }
                }   

                if( child.type == "CallExpression" && 
                     child.callee.property &&
                     child.callee.property.name =="readFileSync" )
                {
                    for( var p =0; p < params.length; p++ )
                    {
                        if( child.arguments[0].name == params[p] )
                        {
                            functionConstraints[funcName].constraints.push( 
                            new Constraint(
                            {
                                ident: params[p],
                                value:  "'pathContent/file1'",
                                funcName: funcName,
                                kind: "fileWithContent",
                                operator : child.operator,
                                expression: expression
                            }));

                            functionConstraints[funcName].constraints.push( 
                            new Constraint(
                            {
                                ident: params[p],
                                value:  "'pathContentEmpty/file2'",
                                funcName: funcName,
                                kind: "fileWithContent",
                                operator : child.operator,
                                expression: expression
                            }));
                        }
                    }
                }

                if( child.type == "CallExpression" &&
                     child.callee.property &&
                     child.callee.property.name =="existsSync")
                {
                    for( var p =0; p < params.length; p++ )
                    {
                        if( child.arguments[0].name == params[p] )
                        {
                            functionConstraints[funcName].constraints.push( 
                            new Constraint(
                            {
                                ident: params[p],
                                // A fake path to a file
                                value:  "'path/fileExists'",
                                funcName: funcName,
                                kind: "fileExists",
                                operator : child.operator,
                                expression: expression
                            }));

                            functionConstraints[funcName].constraints.push( 
                            new Constraint(
                            {
                                ident: params[p],
                                value:  "'pathContent/file1'",
                                funcName: funcName,
                                kind: "fileWithContent",
                                operator : child.operator,
                                expression: expression
                            }));
                        }
                    }
                }

            });

            //console.log( functionConstraints[funcName]);

        }
    });
}

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null) {
                    traverseWithCancel(child, visitor);
                }
            }
        }
     }
}

function functionName( node )
{
    if( node.id )
    {
        return node.id.name;
    }
    return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();
