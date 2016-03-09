import {
  dataType
} from './data-type';

/*
*数据集合的操作主要有:each/map/filter/extend/等方法
*author:shipeifei
*date:2016-03-09
*email:shipeifei_gonghe@163.com
*/
var dataSet = {
  extend : function(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  },
  //循环
  each: function(elements, callback) {
    var i, key;
    if (dataType.likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) {
          return elements;
        }
    } else {
      for (key in elements) {
        if (callback.call(elements[key], key, elements[key]) === false) {
          return elements;
        }
      }
    }

    return elements;
  }
};
