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
  toString = toString || ObjProto.toString,
  hasOwnProperty = hasOwnProperty || ObjProto.hasOwnProperty;
var
  nativeIsArray = nativeIsArray || Array.isArray,
  nativeKeys = nativeKeys || Object.keys,
  nativeBind = nativeBind || FuncProto.bind,
  nativeCreate = nativeCreate || Object.create;
var VERSION = '1.0.0';


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
//Array扩展相关的方法兼容ie8以下版本,参考:http://www.zhangxinxu.com/wordpress/?p=3220
//forEach兼容ie6-ie8
ArrayProto.forEach || (ArrayProto.forEach = function(fn, context) {
  for (var k = 0, length = this.length; k < length; k++) {
    if (typeof fn === "function" && hasOwnProperty.call(this, k)) {
      fn.call(context, this[k], k, this);
    }
  }
});

//map兼容ie6-ie8
ArrayProto.map ||
  (ArrayProto.map = function(fn, context) {
    var arr = [];
    if (typeof fn === "function") {
      for (var k = 0, length = this.length; k < length; k++) {
        arr.push(fn.call(context, this[k], k, this));
      }
    }
    return arr;
  });

ArrayProto.filter ||
  (ArrayProto.filter = function(fn, context) {
    var arr = [];
    if (typeof fn === "function") {
      for (var k = 0, length = this.length; k < length; k++) {
        fn.call(context, this[k], k, this) && arr.push(this[k]);
      }
    }
    return arr;
  });



ArrayProto.some ||
  (ArrayProto.some = function(fn, context) {
    var passed = false;
    if (typeof fn === "function") {
      for (var k = 0, length = this.length; k < length; k++) {
        if (passed === true) break;
        passed = !!fn.call(context, this[k], k, this);
      }
    }
    return passed;
  });


ArrayProto.every ||
  (ArrayProto.every = function(fn, context) {
    var passed = true;
    if (typeof fn === "function") {
      for (var k = 0, length = this.length; k < length; k++) {
        if (passed === false) break;
        passed = !!fn.call(context, this[k], k, this);
      }
    }
    return passed;
  });

ArrayProto.indexOf ||
  (ArrayProto.indexOf = function(searchElement, fromIndex) {
    var index = -1;
    fromIndex = fromIndex * 1 || 0;

    for (var k = 0, length = this.length; k < length; k++) {
      if (k >= fromIndex && this[k] === searchElement) {
        index = k;
        break;
      }
    }
    return index;
  });

ArrayProto.lastIndexOf ||
  (ArrayProto.lastIndexOf = function(searchElement, fromIndex) {
    var index = -1,
      length = this.length;
    fromIndex = fromIndex * 1 || length - 1;
    for (var k = length - 1; k > -1; k -= 1) {
      if (k <= fromIndex && this[k] === searchElement) {
        index = k;
        break;
      }
    }
    return index;
  });

  if ('function' !== typeof ArrayProto.reduce) {
    ArrayProto.reduce = function(callback, opt_initialValue){
      'use strict';
      if (null === this || 'undefined' === typeof this) {
        // At the moment all modern browsers, that support strict mode, have
        // native implementation of Array.prototype.reduce. For instance, IE8
        // does not support strict mode, so this check is actually useless.
        throw new TypeError(
            'Array.prototype.reduce called on null or undefined');
      }
      if ('function' !== typeof callback) {
        throw new TypeError(callback + ' is not a function');
      }
      var index, value,
          length = this.length >>> 0,
          isValueSet = false;
      if (1 < arguments.length) {
        value = opt_initialValue;
        isValueSet = true;
      }
      for (index = 0; length > index; ++index) {
        if (this.hasOwnProperty(index)) {
          if (isValueSet) {
            value = callback(value, this[index], index, this);
          }
          else {
            value = this[index];
            isValueSet = true;
          }
        }
      }
      if (!isValueSet) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      return value;
    };
  }

//
// $.trim = function(str) {
//   return str == null ? "" : String.prototype.trim.call(str)
// }
