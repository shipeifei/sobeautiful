/*
 *String相关方法的兼容扩展
 *author:shipeifei
 *date:2016-03-09
 *email:shipeifei_gonghe@163.com
 */
;
(function() {
  // 得到字节长度
  if (!String.prototype.GetLen) {
    String.prototype.GetLen = function() {
      var regEx = /^[\u4e00-\u9fa5\uf900-\ufa2d]+$/;
      if (regEx.test(this)) {
        return this.length * 2;
      } else {
        var oMatches = this.match(/[\x00-\xff]/g);
        var oLength = this.length * 2 - oMatches.length;
        return oLength;
      }
    }
  }
  // 保留数字
  if (!String.prototype.GetNum) {
    String.prototype.GetNum = function() {
      var regEx = /[^\d]/g;
      return this.replace(regEx, '');
    }
  }
  // 合并多个空白为一个空白
  if (!String.prototype.ResetBlank) {
    String.prototype.ResetBlank = function() { //对字符串扩展
      var regEx = /\s+/g;
      return this.replace(regEx, ' ');
    }
  }
  if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      'use strict';
      if (typeof start !== 'number') {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }
  //除去所有的空格
  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }
  }
  /**
   * 删除左边的空格
   */
  if (!String.prototype.trimLeft) {
    String.prototype.trimLeft = function() {
      return this.replace(/(^\s*)/g, '');
    }
  }
  /**
   * 删除右边的空格
   */
  if (!String.prototype.trimRight) {
    String.prototype.trimRight = function() {
      return this.replace(/(\s*$)/g, '');
    }
  }
  // only run when the substr() function is broken
  if ('ab'.substr(-1) != 'b') {
    /**
     *  Get the substring of a string
     *  @param  {integer}  start   where to start the substring
     *  @param  {integer}  length  how many characters to return
     *  @return {string}
     */
    String.prototype.substr = function(substr) {
      return function(start, length) {
        // call the original method
        return substr.call(this,
          // did we get a negative start, calculate how much it is from the beginning of the string
          // adjust the start parameter for negative value
          start < 0 ? this.length + start : start,
          length)
      }
    }(String.prototype.substr);
  }
  /*! http://mths.be/endswith v0.2.0 by @mathias */
  if (!String.prototype.endsWith) {
    (function() {
      'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
      var defineProperty = (function() {
        // IE 8 only supports `Object.defineProperty` on DOM elements
        try {
          var object = {};
          var $defineProperty = Object.defineProperty;
          var result = $defineProperty(object, object, object) && $defineProperty;
        } catch (error) {}
        return result;
      }());
      var toString = {}.toString;
      var endsWith = function(search) {
        if (this == null) {
          throw TypeError();
        }
        var string = String(this);
        if (search && toString.call(search) == '[object RegExp]') {
          throw TypeError();
        }
        var stringLength = string.length;
        var searchString = String(search);
        var searchLength = searchString.length;
        var pos = stringLength;
        if (arguments.length > 1) {
          var position = arguments[1];
          if (position !== undefined) {
            // `ToInteger`
            pos = position ? Number(position) : 0;
            if (pos != pos) { // better `isNaN`
              pos = 0;
            }
          }
        }
        var end = Math.min(Math.max(pos, 0), stringLength);
        var start = end - searchLength;
        if (start < 0) {
          return false;
        }
        var index = -1;
        while (++index < searchLength) {
          if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
            return false;
          }
        }
        return true;
      };
      if (defineProperty) {
        defineProperty(String.prototype, 'endsWith', {
          'value': endsWith,
          'configurable': true,
          'writable': true
        });
      } else {
        String.prototype.endsWith = endsWith;
      }
    }());
  }
}());
