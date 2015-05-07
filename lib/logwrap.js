/*
    logwrap, v0.0.2, http://github.com/leonadler/logwrap, MIT License

    Wrapper for debugging JavaScript classes without changing their sourcecode

    Debug classes with wrapClass(class), disable with wrapClass(class, false)
    Debug functions with fn = wrapFunction(fn)

    (c) 2015 Leon Adler
    Released under the MIT License
    http://opensource.org/licenses/MIT
*/

(function (global, console) {
    "use strict";

    var isStrictMode = (this === null);

    function logwrap (obj) {
        if (typeof obj == 'function') {
            if (Object.getPrototypeOf(obj) !== Object.prototype ||
                Object.getOwnPropertyNames(obj).length) {
                // Constructor / property values set
                return wrapClass.apply(null, [].slice.call(arguments));
            }
            else {
                // Not a constructor / no prototype set
                return wrapFunction.apply(null, [].slice.call(arguments));
            }
        }
        else {
            throw new TypeError('logwrap cant wrap ' + (typeof obj) + ' objects.');
        }
    }

    logwrap.wrapClass = wrapClass;
    logwrap.wrapFunction = wrapFunction;

    if (typeof module == 'object' && typeof module.exports == 'object') {
        module.exports = logwrap;
    } else {
        global.logwrap = logwrap;
    }


    function wrapClass (constructorFunction, className, onOff) {
        var wrapped = {};
        var proto = constructorFunction.prototype;
        if (typeof className != 'string') {
            onOff = className;
            className = '';
        }
        className = className || getFunctionName(constructorFunction) || '<unnamed class>';

        for (var key in proto) {
            if (typeof proto[key] == 'function') {
                if (onOff === false) {
                    if (proto[key]._originalFunction) {
                        proto[key] = proto[key]._originalFunction;
                    }
                }
                else {
                    proto[key] = wrapFunction(proto[key], className + '.' + key);
                }
            }
        }

        return constructorFunction;
    }

    function wrapFunction (targetFunction, nameOptional) {
        var functionName = nameOptional || getFunctionName(targetFunction);

        var wrapped = function VerboseWrapped () {
            var args = getArgumentsHash(targetFunction, arguments);
            var thisArg = isStrictMode ? this : (this === global ? null : this);

            // Beautiful new grouped way of debug output
            if (console.groupCollapsed && console.info && console.trace) {
                console.groupCollapsed('[logwrap] ' + functionName + ' was called');
                console.info('this = ', thisArg);
                console.info('arguments = ', args);
                console.trace('stack trace');
                console.groupEnd();
            }
            // Old school way of console.log (IE)
            else {
                console.log('[logwrap] ' + functionName + ' was called');
                console.log('[logwrap] - this = ', thisArg);
                console.log('[logwrap] - arguments = ', args);
                console.log('[logwrap] - stack trace: ');
                for (var i = 0, current = VerboseWrapped.callee; current && i < 10; i++) {
                    console.log('[logwrap] - - ' + getFunctionSignature(current));
                    current = current.callee;
                }
            }

            var returnValue = targetFunction.apply(this, [].slice.call(arguments));
            console.log('[logwrap] - ' + functionName + ' returned: ', returnValue);
            return returnValue;
        };

        wrapped._originalFunction = targetFunction; 
        return wrapped;
    }

    function getArgumentsHash (calledFuction, args) {
        var hash = {};
        var argumentList = calledFuction.toString()
            .match(/^[^(]+\(((?:\/\*.+?\*\/|[^)])*)/)[1]
            .replace(/(^\/\/.+|\/\*.+?\*\/)/g, '')
            .match(/[^,\s]+/g);
        if (argumentList) {
            argumentList.forEach(function (argname, index) {
                hash[argname] = args[index];
            });
        }
        return hash;
    }

    function getFunctionName (targetFunction) {
        if (Function.prototype.hasOwnProperty('name')) {
            return targetFunction.name;
        } else {
            // Internet Explorer does not support function.name
            return Function.prototype.toString.apply(method).match(/^function (\S*)\(/)[1];
        }
    }

    function getFunctionSignature (targetFunction) {
        var parts = targetFunction.toString().match(/^function (?:([^(]+) )?\(((?:\/\*.+?\*\/|[^)])*)/);
        var name = parts[1] || targetFunction.name || '(anonymous)';
        var argString = parts[2].replace(/(^\/\/.+|\/\*.+?\*\/)/, '').split(/[,\s]+/).join(', ');
        return 'function ' + name + ' (' + argString + ')';
    }

}.call(null, typeof global != 'undefined' ? global : this, console));
