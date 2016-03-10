/*
 *工具类主要进行数据类型、数据、对象等相关涉及到数据的方法实现
 *author:shipeifei
 *date:2016-03-09
 *email:shipeifei_gonghe@163.com
 ***/
var dataType = {
  push: Array.prototype.push,
  slice: Array.prototype.slice,
  toString: Object.prototype.toString,
  hasOwnProperty: Object.prototype.hasOwnProperty,
  nativeIsArray: Array.isArray,
  nativeKeys: Object.keys,
  nativeBind: Function.prototype.bind,
  nativeCreate: Object.create,
  class2type: (function() {
    var classType = {}, types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
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
    return obj != null && this.hasOwnProperty.call(obj, key);
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
      if (Array.prototype.indexOf) {
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
    var proto = (dataType.isFunction(constructor) && constructor.prototype) || Object.prototype;

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
    if (dataType.nativeKeys) return dataType.nativeKeys(obj);
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
    var className = dataType.toString.call(a);
    if (className !== dataType.toString.call(b)) return false;
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
  each: function(elements, callback) {


    var i, key;
    if (dataType.likeArray(elements)) {
      //使用es5原生的方法
      if (Array.prototype.forEach) {
        elements.forEach(function(value, index, array) {
          if (callback.call(value, index, value) === false) {
            return elements;
          }
        });
      } else {
        for (i = 0; i < elements.length; i++)
          if (callback.call(elements[i], i, elements[i]) === false) {
            return elements;
          }
      }
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
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i);
        console.log("value", value);
        if (!dataType.isNull(value)) {
          values.push(value);
        }
      }
    } else {
      for (key in elements) {
        value = callback(elements[key], key);
        if (!dataType.isNull(value)) {
          values.push(value);
        }
      }
    }
    return (function() {
      return values.length > 0 ? Array.prototype.concat.apply([], values) : values;
    }())
  }
};
