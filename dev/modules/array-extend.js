/*
 *Array相关方法的兼容扩展
 *author:shipeifei
 *date:2016-03-09
 *email:shipeifei_gonghe@163.com
 */
;(function() {
  var ArrayProto = ArrayProto || Array.prototype;
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


  //去重
  ArrayProto.uniq || (ArrayProto.uniq = function(fn, context) {
    var that=this;
    return this.filter(function (v,k) {
       return that.indexOf(v)===k;
    });
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
    ArrayProto.reduce = function(callback, opt_initialValue) {
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
          } else {
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

  if ('function' !== typeof Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function(callback /*, initialValue*/ ) {
      'use strict';
      if (null === this || 'undefined' === typeof this) {
        throw new TypeError(
          'Array.prototype.reduce called on null or undefined');
      }
      if ('function' !== typeof callback) {
        throw new TypeError(callback + ' is not a function');
      }
      var t = Object(this),
        len = t.length >>> 0,
        k = len - 1,
        value;
      if (arguments.length >= 2) {
        value = arguments[1];
      } else {
        while (k >= 0 && !k in t) k--;
        if (k < 0)
          throw new TypeError('Reduce of empty array with no initial value');
        value = t[k--];
      }
      for (; k >= 0; k--) {
        if (k in t) {
          value = callback(value, t[k], k, t);
        }
      }
      return value;
    };
  }
  // Production steps of ECMA-262, Edition 6, 22.1.2.1
  // Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
  if (!Array.from) {
    Array.from = (function() {
      var toStr = Object.prototype.toString;
      var isCallable = function(fn) {
        return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
      };
      var toInteger = function(value) {
        var number = Number(value);
        if (isNaN(number)) {
          return 0;
        }
        if (number === 0 || !isFinite(number)) {
          return number;
        }
        return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
      };
      var maxSafeInteger = Math.pow(2, 53) - 1;
      var toLength = function(value) {
        var len = toInteger(value);
        return Math.min(Math.max(len, 0), maxSafeInteger);
      };

      // The length property of the from method is 1.
      return function from(arrayLike /*, mapFn, thisArg */ ) {
        // 1. Let C be the this value.
        var C = this;

        // 2. Let items be ToObject(arrayLike).
        var items = Object(arrayLike);

        // 3. ReturnIfAbrupt(items).
        if (arrayLike == null) {
          throw new TypeError("Array.from requires an array-like object - not null or undefined");
        }

        // 4. If mapfn is undefined, then let mapping be false.
        var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
        var T;
        if (typeof mapFn !== 'undefined') {
          // 5. else
          // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
          if (!isCallable(mapFn)) {
            throw new TypeError('Array.from: when provided, the second argument must be a function');
          }

          // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
          if (arguments.length > 2) {
            T = arguments[2];
          }
        }

        // 10. Let lenValue be Get(items, "length").
        // 11. Let len be ToLength(lenValue).
        var len = toLength(items.length);

        // 13. If IsConstructor(C) is true, then
        // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
        // 14. a. Else, Let A be ArrayCreate(len).
        var A = isCallable(C) ? Object(new C(len)) : new Array(len);

        // 16. Let k be 0.
        var k = 0;
        // 17. Repeat, while k < len… (also steps a - h)
        var kValue;
        while (k < len) {
          kValue = items[k];
          if (mapFn) {
            A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
          } else {
            A[k] = kValue;
          }
          k += 1;
        }
        // 18. Let putStatus be Put(A, "length", len, true).
        A.length = len;
        // 20. Return A.
        return A;
      };
    }());
  }
}());
/**
 * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
 * on host objects like NamedNodeMap, NodeList, and HTMLCollection
 * (technically, since host objects have been implementation-dependent,
 * at least before ES6, IE hasn't needed to work this way).
 * Also works on strings, fixes IE < 9 to allow an explicit undefined
 * for the 2nd argument (as in Firefox), and prevents errors when
 * called on other DOM objects.
 */
(function() {
  'use strict';
  var _slice = Array.prototype.slice;

  try {
    // Can't be used with DOM elements in IE < 9
    _slice.call(document.documentElement);
  } catch (e) { // Fails in IE < 9
    // This will work for genuine arrays, array-like objects,
    // NamedNodeMap (attributes, entities, notations),
    // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
    // and will not fail on other DOM objects (as do DOM elements in IE < 9)
    Array.prototype.slice = function(begin, end) {
      // IE < 9 gets unhappy with an undefined end argument
      end = (typeof end !== 'undefined') ? end : this.length;

      // For native Array objects, we use the native slice function
      if (Object.prototype.toString.call(this) === '[object Array]') {
        return _slice.call(this, begin, end);
      }

      // For array like object we handle it ourselves.
      var i, cloned = [],
        size, len = this.length;

      // Handle negative value for "begin"
      var start = begin || 0;
      start = (start >= 0) ? start : len + start;

      // Handle negative value for "end"
      var upTo = (end) ? end : len;
      if (end < 0) {
        upTo = len + end;
      }

      // Actual expected size of the slice
      size = upTo - start;

      if (size > 0) {
        cloned = new Array(size);
        if (this.charAt) {
          for (i = 0; i < size; i++) {
            cloned[i] = this.charAt(start + i);
          }
        } else {
          for (i = 0; i < size; i++) {
            cloned[i] = this[start + i];
          }
        }
      }

      return cloned;
    };
  }
}());
