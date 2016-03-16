if (typeof Object.create != 'function') {
  // Production steps of ECMA-262, Edition 5, 15.2.3.5
  // Reference: http://es5.github.io/#x15.2.3.5
  Object.create = (function() {
    // To save on memory, use a shared constructor
    function Temp() {}
    // make a safe reference to Object.prototype.hasOwnProperty
    var hasOwn = Object.prototype.hasOwnProperty;

    return function(O) {
      // 1. If Type(O) is not Object or Null throw a TypeError exception.
      if (typeof O != 'object') {
        throw TypeError('Object prototype may only be an Object or null');
      }

      // 2. Let obj be the result of creating a new object as if by the
      //    expression new Object() where Object is the standard built-in
      //    constructor with that name
      // 3. Set the [[Prototype]] internal property of obj to O.
      Temp.prototype = O;
      var obj = new Temp();
      Temp.prototype = null; // Let's not keep a stray reference to O...

      // 4. If the argument Properties is present and not undefined, add
      //    own properties to obj as if by calling the standard built-in
      //    function Object.defineProperties with arguments obj and
      //    Properties.
      if (arguments.length > 1) {
        // Object.defineProperties does ToObject on its first argument.
        var Properties = Object(arguments[1]);
        for (var prop in Properties) {
          if (hasOwn.call(Properties, prop)) {
            obj[prop] = Properties[prop];
          }
        }
      }

      // 5. Return obj
      return obj;
    };
  })();
}



var ArrayProto = ArrayProto || Array.prototype,
  ObjProto = ObjProto || Object.prototype,
  FuncProto = FuncProto || Function.prototype;
var
  push = push || ArrayProto.push,
  slice = slice || ArrayProto.slice,
  filter=filter||ArrayProto.filter,
  toString = toString || ObjProto.toString,
  hasOwnProperty = hasOwnProperty || ObjProto.hasOwnProperty;
var
  nativeIsArray = nativeIsArray || Array.isArray,
  nativeKeys = nativeKeys || Object.keys,
  nativeBind = nativeBind || FuncProto.bind,
  nativeCreate = nativeCreate || Object.create;
var VERSION = '1.0.0',classCache = {};


if (!FuncProto.bind) {
  FuncProto.bind = function(oThis) {
    if (typeof this !== "function") {
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = slice.call(arguments, 1),
      fToBind = this,
      fNOP = function() {},
      fBound = function() {
        return fToBind.apply(
          this instanceof fNOP && oThis ? this : oThis || window,
          aArgs.concat(slice.call(arguments))
        );
      };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}

//
// $.trim = function(str) {
//   return str == null ? "" : String.prototype.trim.call(str)
// }
