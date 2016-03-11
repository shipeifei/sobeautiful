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
