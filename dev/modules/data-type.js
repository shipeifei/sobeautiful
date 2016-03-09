/*
 *工具类主要进行数据类型、数据、对象等相关涉及到数据的方法实现
 *author:shipeifei
 *date:2016-03-09
 *email:shipeifei_gonghe@163.com
 ***/
var type = {
  push: Array.prototype.push,
  slice: Array.prototype.slice,
  toString: Object.prototype.toString,
  hasOwnProperty: Object.prototype.hasOwnProperty,
  nativeIsArray: Array.isArray,
  nativeKeys: Object.keys,
  nativeBind: Function.prototype.bind,
  nativeCreate: Object.create,
  class2type: (function() {
    var classType = {};
    var types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
    for (var i = 0, len = types.length; i < len; i++) {
      classType["[object " + types[i] + "]"] = types[i].toLowerCase()
    }
    return classType;
  }()),
  toString: {}.toString,
  //判断是否定义
  isUndefined: function(obj) {
    return typeof obj === "undefined";
  },

  type: function(obj) {
    return obj == null ? String(obj) :
      this.class2type[this.toString.call(obj)] || "object"
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
    return obj != null && obj.nodeType === obj.DOCUMENT_NODE
  },
  isObject: function(obj) {
    return this.type(obj) === "object"
  },
  //判断对象是否包含给定的自身属性
  hasSelfProperty: function(obj, key) {
    return obj != null && this.hasOwnProperty.call(obj, key);
  },
  isArray: this.nativeIsArray || function(obj) {
    return this.type(obj) === 'array';
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
  },
  //对比对象是否相等，这里可以对比数组、对象、字符串、数字
   eq : function(a, b, aStack, bStack) {
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Compare `[[Class]]` names.
    var className = this.toString.call(a);
    if (className !== this.toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor,
        bCtor = b.constructor;
      if (aCtor !== bCtor && !(this.isFunction(aCtor) && aCtor instanceof aCtor &&
          this.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a),
        key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(this.hasSelfProperty(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  },
  // Perform a deep comparison to check if two objects are equal.
  isEqual : function(a, b) {
    return this.eq(a, b);
  }

};
export default type;
