/*
 *工具类主要进行数据类型、数据、对象等相关涉及到数据的方法实现
 *author:shipeifei
 *date:2016-03-09
 *email:shipeifei_gonghe@163.com
 ***/
var dataType = (function() {
  var dataType = {
    class2type: (function() {
      var classType = {},
        types = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
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
    isType: function(type) {
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
      return obj != null && obj === obj.window;
    },
    isDocument: function(obj) {
      return obj != null && obj.nodeType===9;
    },
    isElement:function (obj) {
      return obj != null && obj.nodeType === 1;

    },
    isObject: function(obj) {
      return this.type(obj) === "object";
    },
    isNull: function(obj) {
      return obj === null;
    },
    isNaN: function(obj) {
      return this.isNumber(obj) && obj !== +obj;
    },
    //判断对象是否包含给定的自身属性
    hasSelfProperty: function(obj, key) {
      return obj != null && hasOwnProperty.call(obj, key);
    },
    isArray: Array.isArray || function(obj) {
      return this.type(obj) === 'array';
    },
    size: function(obj) {
      return this.isNull(obj) ? 0 : (this.isArray(obj) ? obj.length : 0);

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
  return dataType;
})();
