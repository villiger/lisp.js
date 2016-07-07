var L = {
    run: function (code) {
        code = "(" + code + ")";
        var tokens = L.tokenize(code);
        var tree = L.parse(tokens);
        var result = L.interpret(tree);
        return result;
    },
    /*
     * Fügt im ganzen Code vor und hinter jeder Klammer ein Leerzeichen ein und splittet
     * dann alles nach Leerzeichen auf, wobei doppelte Leerzeichen dann ignoriert werden.
     */
    tokenize: function (code) {
        return code.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').split(/\s+/).filter(function (e) {
            return e !== '' && e !== null && e !== undefined;
        });
    },
    /*
     * Die Elemente im Array von "tokenize()" werden hier anhand öffnender und schliessender
     * Klammern in einen hierarchischen Baum unterteilt. Dies Funktion wird rekusriv aufgerufen.
     */
    parse: function(tokens) {
        if (tokens.length === 0) {
            throw "unexpected EOF";
        }

        var token = tokens.shift();

        if (token === '(') {
            // Immer wenn eine Klammer geöffnet wird, dann starten wir ein neues Unter-Array
            // und fügen diesem Elemente hinzu, bis die Klammer wieder geschlossen wird.
            var list = [];
            while (tokens[0] !== ')') {
                list.push(L.parse(tokens));
            }
            tokens.shift();
            return list;
        } else if (token === ')') {
            throw "unexpected )";
        } else {
            // Ist ein Token eine Zahl, dann wandeln wir sie von String in eine Number um.
            if (isNaN(token) === false) {
                return Number(token);
            }
            return token;
        }
    },
    /*
     * Diese Funktion wird rekursiv aufgerufen und führt den eigentlichen Code aus.
     * Je nach dem was gerade in der aktuellen Stelle im Code-Tree aufgerufen wird,
     * wird ein anderer Operator ausgeführt.
     */
    interpret: function(tree) {
        var result = null;
        
        if (tree === null || tree.length === 0) {
            return null;
        } else if (Array.isArray(tree[0])) {
            for (var i = 0; i < tree.length; i++) {
                result = L.interpret(tree[i]);
            }
        } else {
            var operator = tree[0];
            var list = tree.slice(1);

            if (operator === 'if') {
                result = L.operators.if(list);
            } else if (operator === 'let') {
                result = L.operators.let(list);
            } else if (operator === 'defun') {
                result = L.operators.defun(list);
            } else if (operator in L.environment.functions) {
                result = L.operators.funcall(operator, list);
            } else {
                result = L.operators.codeblock(operator, list);
            }
        }

        return result;
    },
    operators : {
        'if': function(list) {
            var first = L.interpret(list[0]);
            if (first) {
                return L.interpret(list[1]);
            } else if (list.length === 3) {
                return L.interpret(list[2]);
            }
            
            return null;
        },
        'let': function(list) {
            var identifier = list[0];
            var value = list[1];
            L.environment.variables[identifier] = value;
            return null;
        },
        'defun': function(list) {
            var identifier = list[0];
            var params = list[1];
            var body = list.slice(2);
            L.environment.functions[identifier] = {
                params: params,
                body: body
            };
            
            return null;
        },
        'funcall': function(operator, list) {
            var fun = L.environment.functions[operator];
            var mapper = function(val) {
                if (Array.isArray(val)) {
                    return val.map(mapper);
                } else {
                    var i = fun.params.indexOf(val);
                    if (i >= 0) {
                        return list[i];
                    } else {
                        return val;
                    }
                }
            };
        
            var body = fun.body.map(mapper, L);
            return L.interpret(body);
        },
        'codeblock': function(operator, list) {
            var result = null;
            
            for (var i = 0; i < list.length; i++) {
                var element = list[i];
                
                // Nach Variablen in der Environment suchen und ersetzen.
                if (element in L.environment.variables) {
                    element = L.environment.variables[element];
                }

                // Falls das Element ein Array ist, wird es zuerst in einem eigenen
                // Interpret-Aufruf ausgeführt.
                if (Array.isArray(element)) {
                    element = L.interpret(element);
                }
                
                if (result === null) {
                    result = element;
                } else {
                    // Basis-Operatoren werden auf die Elemente angewendet.
                    switch (operator) {
                        case "+": {
                            result = result + element;
                            break;
                        }
                        case "-": {
                            result = result - element;
                            break;
                        }
                        case "*": {
                            result = result * element;
                            break;
                        }
                        case "/": {
                            result = result / element;
                            break;
                        }
                    }
                }
            }
            
            return result;
        }
    },
    environment: {
        variables: {
            lispver: '1.0.0'
        },
        functions: {
            square: {
                params: ['x'],
                body: [['*', 'x', 'x']]
            }
        }
    }
};
