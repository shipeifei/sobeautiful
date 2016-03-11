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

/*
 *工具类主要进行数据类型、数据、对象等相关涉及到数据的方法实现
 *author:shipeifei
 *date:2016-03-09
 *email:shipeifei_gonghe@163.com
 ***/
var dataType = {
  class2type: (function() {
    var classType = {}, types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
    for (var i = 0, len = types.length; i < len; i++) {
      classType["[object " + types[i] + "]"] = types[i].toLowerCase()
    }
    return classType;
  }()),
  //判断是否定义
  isUndefined: function(obj) {
    return typeof obj === "undefined";
  },
  //使用偏函数
  isType : function(type) {
      return function(obj) {
          return toString.call(obj) === "[object " + type + "]";
      }
  },
  type: function(obj) {
    return obj == null ? String(obj) :
      this.class2type[toString.call(obj)] || "object"
  },
  //判断是否为字符串
  isString: function(obj) {
    return this.isUndefined(obj) ? false : this.type(obj) === "string";
  },
  //判断是否为整形
  isNumber: function(obj) {
    return this.isUndefined(obj) ? false : this.type(obj) === "number";

  },
  //判断是否为bool
  isBoolean: function(obj) {
    return this.isUndefined(obj) ? false : this.type(obj) === "boolean";
  },
  //是否是函数
  isFunction: function(value) {
    return this.type(value) === "function"
  },
  isWindow: function(obj) {
    return obj != null && obj === obj.window
  },
  isDocument: function(obj) {
    return obj != null && obj.nodeType === 1;
  },
  isObject: function(obj) {
    return this.type(obj) === "object"
  },
  isNull : function(obj) {
    return obj === null;
  },
  isNaN : function(obj) {
    return this.isNumber(obj) && obj !== +obj;
  },
  //判断对象是否包含给定的自身属性
  hasSelfProperty: function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  },
  isArray: Array.isArray || function(obj) {
    return this.type(obj) === 'array';
  },
  size:function (obj) {
  return  this.isNull(obj)?0:(this.isArray(obj)?obj.length:0);

  },
  //测试对象是否是“纯粹”的对象，这个对象是通过 对象常量（"{}"） 或者 new Object 创建的，如果是，则返回true。
  isPlainObject: function(obj) {
    return this.isObject(obj) && !this.isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  },
  likeArray: function(obj) {
    return typeof obj.length === 'number';
  },

  //判断对象是否为空
  isEmptyObject: function(obj) {
    var name;
    for (name in obj) {
      return false;
    }
    return true;
  },
  isEmpty: function(obj) {
    if (obj == null) {
      return true;
    }
    if (this.likeArray(obj) && (this.isArray(obj) || this.isString(obj))) {
      return obj.length === 0;
    }
    return this.isEmptyObject(obj);
  }
};

/*
 *数据集合的操作主要有:each/map/filter/extend/等方法
 *author:shipeifei
 *date:2016-03-09
 *email:shipeifei_gonghe@163.com
 */
var dataSet = {
  //对象或者数组是否包含给定的属性
  contain: function(obj, key) {
    //数组
    if (dataType.likeArray(obj)) {
      if (ArrayProto.indexOf) {
        return obj.indexOf(key);
      } else {
        var length = obj.length;
        for (var i = 0; i < length; i++) {
          if (obj[i] === key) return i; // 使用全等于(===)判断符
        }
        return -1;
      }
    }
    //对象
    else {
      return dataType.isString(obj) ? obj.indexOf(key) : -1;
    }
  },
  // ie9以下不能进行属性枚举
  hasEnumBug: !{
    toString: null
  }.propertyIsEnumerable('toString'),
  nonEnumerableProps: ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'],
  //
  collectNonEnumProps: function(obj, keys) {
    var nonEnumIdx = this.nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (dataType.isFunction(constructor) && constructor.prototype) || ObjProto;

    // 构造函数作为一个特殊的情况.
    var prop = 'constructor';
    if (dataType.hasSelfProperty(obj, prop) && !this.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = this.nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !this.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  },
  //获取对象的所有的自身的属性，排除原型继承的属性
  keys: function(obj) {
    if (!dataType.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj)
      if (dataType.hasSelfProperty(obj, key)) keys.push(key);
      // 兼容ie9一下的版本
    if (this.hasEnumBug) this.collectNonEnumProps(obj, keys);
    return keys;
  },

  extend: function(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  },

  //对比对象是否相等，这里可以对比数组、对象、字符串、数字,参考资料underscore
  eq: function(a, b, aStack, bStack) {
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    if (a == null || b == null) return a === b;
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      case '[object RegExp]':
      case '[object String]':

        return '' + a === '' + b;
      case '[object Number]':

        if (+a !== +a) return +b !== +b;
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      var aCtor = a.constructor,
        bCtor = b.constructor;
      if (aCtor !== bCtor && !(dataType.isFunction(aCtor) && aCtor instanceof aCtor &&
          dataType.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }

    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {

      if (aStack[length] === a) return bStack[length] === b;
    }

    aStack.push(a);
    bStack.push(b);

    if (areArrays) {
      length = a.length;
      if (length !== b.length) return false;
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      var keys = this.keys(a),
        key;
      length = keys.length;
      if (this.keys(b).length !== length) return false;
      while (length--) {
        key = keys[length];
        if (!(dataType.hasSelfProperty(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    aStack.pop();
    bStack.pop();
    return true;
  },
  // 判断两个对象是否相等，可以深度对比
  isEqual: function(a, b) {
    return this.eq(a, b);
  },
  //循环
  /*
   *callback:function(value,index,elements) 第一个是数组值，第二个是数组索引，第三个是数组本身this
   *
   */
  each: function(elements, callback) {
    var i, key;
    if (dataType.likeArray(elements)) {
      return ArrayProto.forEach.call(elements,callback);
    } else {
      for (key in elements) {
        if (callback.call(elements[key], key, elements[key]) === false) {
          return elements;
        }
      }
    }
    return elements;
  },
  //映射集合
  map: function(elements, callback) {
    var value, values = [],
      i, key
    if (dataType.likeArray(elements)) {
      //首先考虑es5的特性
      if (typeof ArrayProto.map === 'function') {
        return ArrayProto.map.call(elements,callback);
      } else {
        for (i = 0; i < elements.length; i++) {
          value = callback(elements[i], i, elements[i]);
          if (!dataType.isNull(value)) {
            values.push(value);
          }
        }
      }
    } else {
      for (key in elements) {
        value = callback(elements[key], key, elements[key]);
        if (!dataType.isNull(value)) {
          values.push(value);
        }
      }
    }
    return (function() {
      return values.length > 0 ? ArrayProto.concat.apply([], values) : values;
    }())
  },
  /*
   *过滤方法
   *callback:function(value,index,elements) 第一个是数组值，第二个是数组索引，第三个是数组本身this
   *
   */
  filter: function(elements, callback) {
      return ArrayProto.filter.call(elements,callback);
  },
  some: function(elements, callback) {
      return ArrayProto.some.call(elements, callback);
  },
  every: function(elements, callback) {
      return ArrayProto.every.call(elements, callback);
  },
  //返回一个除去所有false值的 array副本。 在javascript中, false, null, 0, "", undefined 和 NaN 都是false值.
  compact: function(array) {
    return this.filter(array, function(item) {
      return item != null;
    });
  },
  indexOf: function(elements, searchElement, fromIndex) {
      return ArrayProto.indexOf.call(elements, searchElement, fromIndex);
  },
  lastIndexOf:function (elements, searchElement, fromIndex) {
    return ArrayProto.lastIndexOf.call(elements, searchElement, fromIndex);
  }
};
