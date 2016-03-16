/*
 *dom选择器
 *author:shipeifei
 *date:2016-03-09
 *email:shipeifei_gonghe@163.com
 */
var sobeautifulQza = (function() {

  //匹配标签,可以匹配:<p />,<p/>,<p></p>
  var $, classCache = {},
    classList,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    readyRE = /complete|loaded|interactive/,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,
    elementDisplay = {},
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    //相邻; 接近性; 傍边
    adjacencyOperators = ['after', 'prepend', 'before', 'append'],
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table,
      'thead': table,
      'tfoot': table,
      'td': tableRow,
      'th': tableRow,
      '*': document.createElement('div')
    },
    cssNumber = {
      'column-count': 1,
      'columns': 1,
      'font-weight': 1,
      'line-height': 1,
      'opacity': 1,
      'z-index': 1,
      'zoom': 1
    },
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
    simpleSelectorRE = /^[\w-]*$/;


  var sobeautiful = {};
  /*
   *dom处理工具,使用命名空间防止变量或者方法冲突
   */
  sobeautiful.util = {

    //将字符串转成驼峰式的格式
    camelize: function(str) {
      return str.replace(/-+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : '';
      })
    },
    /*
     * 获取HTML元素属性值
     * @param object o 要获取属性的HTML元素
     * @param string a 要获取的属性名
     * @return 返回要获取的属性值
     */
    getAttribute: function(o, a) {
      if (typeof o != 'object' || typeof a != 'string') return;
      return a == 'class' ? o.className : o.getAttribute(a);
    },
    /*
     * 移除HTML元素属性
     * @param object o 要移除属性的HTML元素
     * @param string a 要移除的属性名
     */
    removeAttribute: function(o, a) {
      if (typeof o != 'object' || typeof a != 'string') return;
      o.removeAttribute(a);
      if (a == 'class') o.removeAttribute('className');
    },
    /*
     * 设置HTML元素属性
     * @param object node 要设置属性的HTML元素
     * @param string name 要设置的属性名
     * @param string value 要设置的属性值
     */
    setAttribute: function(node, name, value) {
      if (!dataType.isObject(node)) {
        return;
      }!(2 in arguments) ? this.removeAttribute(node, name): node.setAttribute(name, value);
      //a == 'class' ? o.className = v : o.setAttribute(a, v);
    },
    /*
     *删除css样式属性
     *@function*
     *@param {HTMLElement|String} el*
     *@param {String} st*
     *@return {HTMLElement} el*
     */
    removeStyle: function() {
      var ele = document.createElement('DIV'),
        fn;
      ele.style.removeProperty ? (fn = function(el, st) {
        el.style.removeProperty(st);
        return el;
      }) : (fn = function(el, st) {
        el.style.removeAttribute(sobeautiful.util.camelize(st));
        return el;
      });
      ele = null; //这种习惯要有
      return fn;
    }(),
    //获取当前节点相邻的前一个节点
    getPreElement: function() {
      var ele = document.createElement('DIV'),
        fn;
      ele.previousElementSibling ? (fn = function() {
        return "previousElementSibling";
      }) : (fn = function() {
        return "previousSibling";
      });
      ele = null;
      return fn;
    }(),
    //获取当前节点相邻的后一个节点
    getNextElement: function() {
      var ele = document.createElement('DIV'),
        fn;
      ele.nextElementSibling ? (fn = function() {
        return "nextElementSibling";
      }) : (fn = function() {
        return "nextSibling";
      });
      ele = null;
      return fn;
    }(),
    //使用柯里化优化代码,获取指定的元素css样式属性值
    getStyle: function() {
      var ele = document.createElement('DIV'),
        fn;
      ele.currentStyle ? (fn = function(obj, attr) {
        return obj.currentStyle[attr];
      }) : (fn = function(obj, attr) {
        return getComputedStyle(obj, false)[attr];
      });

      ele = null;
      return fn;
    }(),
    // access className property while respecting SVGAnimatedString
    className: function(node, value) {
      var klass = node.className || '',
        svg = klass && klass.baseVal !== undefined
      if (value === undefined) return svg ? klass.baseVal : klass
      svg ? (klass.baseVal = value) : (node.className = value)
    },
    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    deserializeValue: function(value) {
      try {
        return value ?
          value == "true" ||
          (value == "false" ? false :
            value == "null" ? null :
            +value + "" == value ? +value :
            /^[\[\{]/.test(value) ? $.parseJSON(value) :
            value) : value
      } catch (e) {
        return value
      }
    },
    //将字符串格式化成-拼接的形式,一般用在样式属性上，比如border-width
    dasherize: function(str) {
      return str.replace(/::/g, '/')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
        .replace(/([a-z\d])([A-Z])/g, '$1_$2')
        .replace(/_/g, '-')
        .toLowerCase()
    },
    //给需要的样式值后面加上'px'单位，除了cssNumber里面的指定的那些
    maybeAddPx: function(name, value) {
      return (typeof value == "number" && !cssNumber[sobeautiful.util.dasherize(name)]) ? value + "px" : value;
    },
    //将给定的参数生成正则
    classRE: function(name) {
      return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    },
    funcArg: function(context, arg, idx, payload) {
      return dataType.isFunction(arg) ? arg.call(context, idx, payload) : arg;
    },
    //获取节点的默认display属性
    defaultDisplay: function(nodeName) {
      var element, display;
      if (!elementDisplay[nodeName]) {
        element = document.createElement(nodeName);
        document.body.appendChild(element);
        display = sobeautiful.util.getStyle(element, "display");
        element.parentNode.removeChild(element);
        display == "none" && (display = "block");
        elementDisplay[nodeName] = display;
        element = null;
      }
      return elementDisplay[nodeName];
    },
    filtered: function(nodes, selector) {
      return selector == null ? $(nodes) : $(nodes).filter(selector);
    },
    //获取指定元素的子节点(不包含文本节点),Firefox不支持children，所以只能通过筛选childNodes
    children: function(element) {
      //判断兼容性
      return 'children' in element ?
        slice.call(element.children) :
        $.map(element.childNodes, function(node) {
          if (node.nodeType == 1) return node
        })
    },
    hasClass: function(elem, className) {
      if (!className) {
        return false;
      };
      return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
    },
    getElementsByClassName: function(className, element) {
      element = element || document;
      //判断浏览器是否支持getElementsByClassName，如果支持就直接的用
      if (element.getElementsByClassName) {
        return element.getElementsByClassName(className);
      } else {
        var ele = [],
          all = element.getElementsByTagName("*");
        for (var i = 0, len = all.length; i < len; i++) {
          if (sobeautiful.util.hasClass(all[i], className)) {
            ele[ele.length] = all[i];
          }
        }
        return ele;
      }
    },
    //类似得到一个数组的副本。
    flatten: function(array) {
      return array.length > 0 ? ArrayProto.concat.apply([], array) : array
    },
    //数组去重
    uniq: function(array) {
      return filter.call(array, function(item, idx) {
        return array.indexOf(item) == idx;
      })
    },
    each: function(elements, callback) {
      var i, key
      for (i = 0; i < elements.length; i++) {
        if (callback.call(elements[i], i, elements[i]) === false) {
          return elements;
        }
      }
      return elements;
    },
    matches: function(element, selector) {
      if (!selector || !element || element.nodeType !== 1) return false;
      var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
        element.oMatchesSelector || element.matchesSelector;
      if (matchesSelector) {
        return matchesSelector.call(element, selector);
      }
      // fall back to performing a selector:
      var match, parent = element.parentNode,
        temp = !parent;
      if (temp)(parent = tempParent).appendChild(element)
      match = ~sobeautiful.qsa(parent, selector).indexOf(element)
      temp && tempParent.removeChild(element)
      return match;
    }
  };

  // 通过原型链继承实现链式开发，这里_proto_需要针对ie进行处理
  sobeautiful.Z = function(dom, selector) {
      dom = dom || [];
      dom.__proto__ = $.fn; //通过给dom设置__proto__属性指向$.fn来达到继承$.fn上所有方法的目的
      dom.selector = selector || '';
      return dom;
    }
    //判断给定的参数是否是Zepto集
  sobeautiful.isZ = function(object) {
    return object instanceof sobeautiful.Z;
  }

  /*
   *创建标签
   *html:标签内容必填
   *name:标签名字必填
   *标签属性可选
   **/
  sobeautiful.createElement = function(html, name, properties) {
    var domElement, container, nodes;
    //判断是否匹配标签正则
    if (singleTagRE.test(html)) {
      //这里补给一下正则表达式的知识：RegExp是一个全局对象，只要有一个分组表达式，RegExp就会把他的属性$1-$9按照
      //顺序复制，同时只能复制9个，如果超过9个表达式自动匹配最后九个
      //这些属性是只读的。如果表达式模式中有括起来的子匹配，
      //$1…$9属性值分别是第1个到第9个子匹配所捕获到的内容。
      //如果有超过9个以上的子匹配，$1…$9属性分别对应最后的9个子匹配。
      //在一个表达式模式中，可以指定任意多个带括号的子匹配，
      //但RegExp对象只能存储最后的9个子匹配的结果。
      //在RegExp实例对象的一些方法所返回的结果数组中，可以获得所有圆括号内的子匹配结果。
      //document.createElement(RegExp.$1)创建返回的是一个对象
      domElement = [document.createElement(RegExp.$1)];

    }
    if (!domElement) {
      if (html.replace) {
        html = html.replace(tagExpanderRE, "<$1></$2>");
      }
      if (name === undefined) {
        name = fragmentRE.test(html) && RegExp.$1;
      }
      if (!(name in containers)) {
        name = '*';
      }
      container = containers[name];
      container.innerHTML = '' + html;
      domElement = sobeautiful.util.each(Array.prototype.slice.call(container.childNodes), function() {
        container.removeChild(this);
      });
    }
    if (dataType.isPlainObject(properties)) {
      nodes = sobeautiful.init(domElement);
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) {
          nodes[key](value);
        } else {
          nodes.attr(key, value);
        }
      });
    }
    return domElement;

  }

  /**
   *初始化选择器
   *selector 选择器类型 :#id .class a div.class h2,h3  等常用类型
   *如果没有参数输出null
   */
  sobeautiful.init = function(selector, context) {
    var dom;
    //如果没有传入selector，进行报错提示
    if (!selector) {
      return sobeautiful.Z();
    } else if (dataType.isString(selector)) //传入的是字符串
    {
      //去除空格
      selector = selector.trim();
      //创建元素
      if (selector[0] === "<" && fragmentRE.test(selector)) {
        dom = sobeautiful.createElement(selector, RegExp.$1), selector = null;

      } //这里是选择元素
      else {
        dom = sobeautiful.qza(document, selector);
      }
    }
    // ready加载
    else if (dataType.isFunction(selector)) {
      return $(document).ready(selector);
    } else {
      //选择器是一个数组
      if (dataType.isArray(selector)) {
        dom = dataSet.compact(selector);
      }
      //对象,主要针对创建createElement元素
      if (dataType.isObject(selector)) {
        dom = [selector], selector = null;
      }

    }
    return sobeautiful.Z(dom, selector);
  }

  /*
   *元素选择器
   *element:根节点
   *selector:选择条件
   */
  sobeautiful.qza = function(element, selector) {
    //传入的不是根节点
    if (!dataType.isDocument(element) || dataType.isNull(element)) {
      return [];
    } else if (element.nodeType !== 1 && element.nodeType !== 9) { //不是节点元素
      return [];
    }
    var found, maybeID = selector[0] === "#", //通过id进行选择
      maybeClass = !maybeID && selector[0] === ".", //通过类名进行选择
      nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, //获取选择的名字
      isSimple = simpleSelectorRE.test(nameOnly);
    //if版本 通过id获取
    if (isSimple && maybeID) {
      return (found = element.getElementById(nameOnly)) ? [found] : [];
    } else {
      if (maybeClass && isSimple) {
        return Array.prototype.slice.call(sobeautiful.util.getElementsByClassName(nameOnly, element));
      } else {
        if (element.getElementsByTagName(selector).length > 0) {
          return Array.prototype.slice.call(element.getElementsByTagName(selector));
        } else {
          return Array.prototype.slice.call(element.querySelectorAll(selector));
        }
      }
    }
  }


  //$对象
  $ = function(selector, context) {
      return sobeautiful.init(selector, context)
    }
    //检查父节点是否包含给定的dom节点，如果两者是相同的节点，则返回 false。
    //E专用，用于判断文档是否包含指定节点元素
  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }
  $.map = function(elements, callback) {
    var value, values = [],
      i, key, len;
    if (dataType.likeArray(elements))
      for (i = 0, len = elements.length; i < len; i++) {
        value = callback(elements[i], i);
        if (value != null) values.push(value)
      }
    else {
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    }
    return sobeautiful.util.flatten(values);
  }
  $.fn = {
      concat: ArrayProto.concat,
      indexOf: ArrayProto.indexOf,
      //通过遍历集合中的元素，返回通过迭代函数的全部结果，（愚人码头注：一个新数组）null 和 undefined 将被过滤掉。
      map: function(fn) {
        return $($.map(this, function(el, i) {
          return fn.call(el, i, el)
        }))
      },
      slice: function() {
        return $(slice.apply(this, arguments))
      },
      ready: function(callback) {
        if (readyRE.test(document.readyState) && document.body) {
          callback($);
        } else {
          document.addEventListener('DOMContentLoaded', function() {
            callback($);
          }, false)
        }
        return this;
      },
      //获取指定索引的元素，这里返回的是一个htmlElement对象,没有传递值默认返回数组
      get: function(idx) {
        return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
      },
      //转换为数组
      toArray: function() {
        return this.get();
      },
      //获取节点大小
      size: function() {
        return this.length;
      },
      remove: function() {
        return this.each(function() {
          if (this.parentNode != null) {
            this.parentNode.removeChild(this);
          }
        })
      },
      each: function(callback) {
        ArrayProto.every.call(this, function(el, idx) {
          return callback.call(el, idx, el) !== false;
        })
        return this;
      },
      filter: function(selector) {
        if (dataType.isFunction(selector)) {
          return this.not(this.not(selector));
        }
        return $(filter.call(this, function(element) {
          return sobeautiful.util.matches(element, selector);
        }))
      },
      add: function(selector, context) {
        return $(dataSet.uniq(this.concat($(selector, context))))
      },
      is: function(selector) {
        return this.length > 0 && sobeautiful.util.matches(this[0], selector)
      },
      not: function(selector) {
        var nodes = [];
        if (dataType.isFunction(selector) && selector.call !== undefined) {
          this.each(function(idx) {
            if (!selector.call(this, idx)) {
              nodes.push(this);
            }
          })
        } else {
          var excludes = typeof selector == 'string' ? this.filter(selector) :
            (dataSet.likeArray(selector) && dataType.isFunction(selector.item)) ? slice.call(selector) : $(selector)
          this.forEach(function(el) {
            if (excludes.indexOf(el) < 0) {
              nodes.push(el);
            }
          })
        }
        return $(nodes);
      },
      has: function(selector) {
        return this.filter(function() {
          return dataType.isObject(selector) ?
            $.contains(this, selector) :
            $(this).find(selector).size()
        })
      },
      eq: function(idx) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
      },
      //获取第一个元素
      first: function() {
        var el = this[0];
        return el && !dataType.isObject(el) ? el : $(el)
      },
      //最后一个元素
      last: function() {
        var el = this[this.length - 1];
        return el && !dataType.isObject(el) ? el : $(el)
      },
      find: function(selector) {
        var result, $this = this;
        if (!selector) {
          result = $();
        } else if (typeof selector == 'object')
          result = $(selector).filter(function() {
            var node = this;
            return ArrayProto.some.call($this, function(parent) {
              return $.contains(parent, node);
            })
          });
        else if (this.length == 1) {
          result = $(sobeautiful.qza(this[0], selector));
        } else {
          result = this.map(function() {
            return sobeautiful.qsa(this, selector);
          })
        }
        return result;
      },
      //获取当前节点的父亲元素
      parents: function(selector) {
        var ancestors = [],
          nodes = this;
        while (nodes.length > 0) {
          nodes = $.map(nodes, function(node) {
            if ((node = node.parentNode) && !dataType.isDocument(node) && ancestors.indexOf(node) < 0) {
              ancestors.push(node);
              return node;
            }
          })
        }
        return sobeautiful.util.filtered(ancestors, selector);
      },
      //获取元素的直接父亲元素
      parent: function(selector) {
        return sobeautiful.util.filtered(sobeautiful.util.uniq(this.pluck('parentNode')), selector)
      },
      children: function(selector) {
        return sobeautiful.util.filtered(this.map(function() {
          return sobeautiful.util.children(this);
        }), selector)
      },
      contents: function() {
        return this.map(function() {
          return slice.call(this.childNodes);
        })
      },
      siblings: function(selector) {
        return sobeautiful.util.filtered(this.map(function(i, el) {
          return filter.call(sobeautiful.util.children(el.parentNode), function(child) {
            return child !== el
          })
        }), selector)
      },
      empty: function() {
        return this.each(function() {
          this.innerHTML = '';
        })
      },
      // `pluck` is borrowed from Prototype.js
      pluck: function(property) {
        var ele = document.createElement('DIV');
        console.log("else", ele[property]);
        return $.map(this, function(el) {
          return el[property];
        })
      },
      // `pluckonce` is borrowed from Prototype.js
      pluckonce: function(property) {
        return $.map(this, function(el) {
          if (property === "previousElementSibling") {
            do {
              el = el.previousElementSibling;
            } while (el && el.nodeType != 1);
            return el;
          } else if (property === "previousSibling") {

            do {
              el = el.previousSibling;
            } while (el && el.nodeType != 1);
            return el;



          } else if (property === "nextElementSibling") {
            do {
              el = el.nextElementSibling;
            } while (el && el.nodeType != 1);
            return el;


          } else {
            do {
              el = el.nextSibling;
            } while (el && el.nodeType != 1);
            return el;

          }
        })
      },
      show: function() {
        return this.each(function() {
          this.style.display == "none" && (this.style.display = '')
          if (sobeautiful.util.getStyle(this, "display") === "none") {
            this.style.display = sobeautiful.util.defaultDisplay(this.nodeName);
          }
        })
      },
      // replaceWith: function(newContent) {
      //   return this.before(newContent).remove()
      // },
      // wrap: function(structure) {
      //   var func = dataType.isFunction(structure)
      //   if (this[0] && !func)
      //     var dom = $(structure).get(0),
      //       clone = dom.parentNode || this.length > 1
      //
      //   return this.each(function(index) {
      //     $(this).wrapAll(
      //       func ? structure.call(this, index) :
      //       clone ? dom.cloneNode(true) : dom
      //     )
      //   })
      // },
      // wrapAll: function(structure) {
      //   if (this[0]) {
      //     $(this[0]).before(structure = $(structure))
      //     var children
      //       // drill down to the inmost element
      //     while ((children = structure.children()).length) structure = children.first()
      //     $(structure).append(this)
      //   }
      //   return this
      // },
      // wrapInner: function(structure) {
      //   var func = isFunction(structure)
      //   return this.each(function(index) {
      //     var self = $(this),
      //       contents = self.contents(),
      //       dom = func ? structure.call(this, index) : structure
      //     contents.length ? contents.wrapAll(dom) : self.append(dom)
      //   })
      // },
      // unwrap: function() {
      //   this.parent().each(function() {
      //     $(this).replaceWith($(this).children())
      //   })
      //   return this
      // },
      // clone: function() {
      //   return this.map(function() {
      //     return this.cloneNode(true)
      //   })
      // },
      hide: function() {
        return this.css("display", "none");
      },
      toggle: function(setting) {
        return this.each(function() {
          var el = $(this);
          (setting === undefined ? el.css("display") == "none" : setting) ? el.show(): el.hide();
        })
      },
      prev: function(selector) {
        return $(this.pluckonce(sobeautiful.util.getPreElement())).filter(selector || '*');
      },
      next: function(selector) {
        return $(this.pluckonce(sobeautiful.util.getNextElement())).filter(selector || '*')
      },
      html: function(html) {
        return 0 in arguments ?
          this.each(function(idx) {
            var originHtml = this.innerHTML;
            $(this).empty().append(sobeautiful.util.funcArg(this, html, idx, originHtml))
          }) :
          (0 in this ? this[0].innerHTML : null)
      },
      // text: function(text) {
      //   return 0 in arguments ?
      //     this.each(function(idx) {
      //       var newText = sobeautiful.util.funcArg(this, text, idx, this.textContent)
      //       this.textContent = newText == null ? '' : '' + newText
      //     }) :
      //     (0 in this ? this[0].textContent : null)
      // },
      attr: function(name, value) {
        var result;
        return (dataType.isString(name) && !(1 in arguments)) ?
          (!this.length || this[0].nodeType !== 1 ? undefined :
            (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
          ) :
          this.each(function(idx) {
            if (this.nodeType !== 1) return
            if (dataType.isObject(name))
              for (key in name) sobeautiful.util.setAttribute(this, key, name[key])
            else sobeautiful.util.setAttribute(this, name, sobeautiful.util.funcArg(this, value, idx, this.getAttribute(name)))
          })
      },
      removeAttr: function(name) {
        return this.each(function() {
          this.nodeType === 1 && name.split(' ').forEach(function(attribute) {
            sobeautiful.util.setAttribute(this, attribute);
          }, this)
        })
      },
      prop: function(name, value) {
        name = propMap[name] || name;
        return (1 in arguments) ?
          this.each(function(idx) {
            this[name] = sobeautiful.util.funcArg(this, value, idx, this[name])
          }) :
          (this[0] && this[0][name]);
      },
      //获取和设置自定义属性
      data: function(name, value) {
        var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();
        var data = (1 in arguments) ? this.attr(attrName, value) : this.attr(attrName);
        return data !== null ? sobeautiful.util.deserializeValue(data) : undefined;
      },
      val: function(value) {
        return 0 in arguments ?
          this.each(function(idx) {
            this.value = sobeautiful.util.funcArg(this, value, idx, this.value)
          }) :
          (this[0] && (this[0].multiple ?
            $(this[0]).find('option').filter(function() {
              return this.selected
            }).pluck('value') : this[0].value))
      },
      offset: function(coordinates) {
        if (coordinates) return this.each(function(index) {
          var $this = $(this),
            coords = sobeautiful.util.funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top: coords.top - parentOffset.top,
              left: coords.left - parentOffset.left
            }

          if ($this.css('position') == 'static') props['position'] = 'relative'
          $this.css(props)
        })
        if (!this.length) return null;
        var obj = this[0].getBoundingClientRect();
        //getBoundingClientRect获取元素位置
        //
        // getBoundingClientRect用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置。
        //getBoundingClientRect是DOM元素到浏览器可视范围的距离（不包含文档卷起的部分）。
        //该函数返回一个Object对象，该对象有6个属性：top,lef,right,bottom,width,height；
        //这里的top、left和css中的理解很相似，width、height是元素自身的宽高，
        //但是right，bottom和css中的理解有点不一样。
        //right是指元素右边界距窗口最左边的距离，bottom是指元素下边界距窗口最上面的距离。


        // var Top = ro.top;
        //
        // var Bottom = ro.bottom;
        //
        // var Left = ro.left;
        //
        // var Right = ro.right;
        //
        // var Width = ro.width || Right - Left;
        //
        // var Height = ro.height || Bottom - Top;
        //
        // 有了这个方法， 获取页面元素的位置就简单多了:
        //
        //   var X = this.getBoundingClientRect().left + document.documentElement.scrollLeft;
        //
        // var Y = this.getBoundingClientRect().top + document.documentElement.scrollTop;
        //设置或返回当前页面相对于窗口显示区左上角的 X 位置
        return {
          left: obj.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft),
          top: obj.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop),
          width: Math.round(obj.width || obj.right - obj.left),
          height: Math.round(obj.height || obj.bottom - obj.top)
        }
      },
      css: function(property, value) {
        if (arguments.length < 2) {
          var computedStyle, element = this[0];
          if (!element) {
            return;
          }
          computedStyle = sobeautiful.util.getStyle(element, '');
          if (typeof property == 'string') {
            return element.style[sobeautiful.util.camelize(property)] || sobeautiful.util.getStyle(element, property);
          } else if (dataType.isArray(property)) {
            var props = {};
            $.each(property, function(_, prop) {
              props[prop] = (element.style[sobeautiful.util.camelize(prop)] || sobeautiful.util.getStyle(element, prop))
            })
            return props;
          }
        }
        var css = '';
        if (dataType.isString(property)) {
          if (!value && value !== 0) //删除属性
          {
            this.each(function() {
              sobeautiful.util.removeStyle(this, sobeautiful.util.dasherize(property))
            })
          } else {
            css = sobeautiful.util.dasherize(property) + ":" + sobeautiful.util.maybeAddPx(property, value);
          }
        } else {
          for (key in property)
            if (!property[key] && property[key] !== 0)
              this.each(function() {
                sobeautiful.util.removeStyle(this, sobeautiful.util.dasherize(key))
              })
            else {
              css += sobeautiful.util.dasherize(key) + ':' + sobeautiful.util.maybeAddPx(key, property[key]) + ';'
            }
        }

        return this.each(function() {
          this.style.cssText += ';' + css
        })
      },
      index: function(element) {
        return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
      },
      hasClass: function(name) {
        var flag;
        if (!name) return false;
        return dataSet.some(this, function(el) {
          if (flag = sobeautiful.util.hasClass(el, name)) {
            sobeautiful.util.classRE(name);
          }

          return flag;
        });
      },
      addClass: function(name) {
        if (!name) return this
        return this.each(function(idx) {
          if (!('className' in this)) return;
          classList = [];
          var cls = sobeautiful.util.className(this),
            newName = sobeautiful.util.funcArg(this, name, idx, cls);
          newName.split(/\s+/g).forEach(function(klass) {
            if (!$(this).hasClass(klass)) classList.push(klass)
          }, this);
          classList.length && sobeautiful.util.className(this, cls + (cls ? " " : "") + classList.join(" "))
        })
      },
      removeClass: function(name) {
        return this.each(function(idx) {
          if (!('className' in this)) return;
          if (name === undefined) {
            return sobeautiful.util.className(this, '');
          }

          classList = sobeautiful.util.className(this);
          sobeautiful.util.funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
            classList = classList.replace(sobeautiful.util.classRE(klass), " ")
          })
          sobeautiful.util.className(this, classList.trim());
        })
      },
      //样式切换
      toggleClass: function(name, when) {
        if (!name) return this;
        return this.each(function(idx) {
          var $this = $(this),
            names = sobeautiful.util.funcArg(this, name, idx, sobeautiful.util.className(this));
          names.split(/\s+/g).forEach(function(klass) {
            (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass): $this.removeClass(klass)
          })
        })
      },
      scrollTop: function(value) {
        if (!this.length) return;
        var hasScrollTop = 'scrollTop' in this[0];
        if (value === undefined) {
          return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
        }
        return this.each(hasScrollTop ?
          function() {
            this.scrollTop = value;
          } :
          function() {
            this.scrollTo(this.scrollX, value);
          })
      },
      scrollLeft: function(value) {
        if (!this.length) return;
        var hasScrollLeft = 'scrollLeft' in this[0]
        if (value === undefined) {
          return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
        }
        return this.each(hasScrollLeft ?
          function() {
            this.scrollLeft = value;
          } :
          function() {
            this.scrollTo(value, this.scrollY);
          })
      },
      position: function() {
        if (!this.length) return;
        var elem = this[0],
          // Get *real* offsetParent
          offsetParent = this.offsetParent(),
          // Get correct offsets
          offset = this.offset(),
          parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {
            top: 0,
            left: 0
          } : offsetParent.offset()

        // Subtract element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft
        // are the same in Safari causing offset.left to incorrectly be 0
        offset.top -= parseFloat($(elem).css('margin-top')) || 0
        offset.left -= parseFloat($(elem).css('margin-left')) || 0

        // Add offsetParent borders
        parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
        parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

        // Subtract the two offsets
        return {
          top: offset.top - parentOffset.top,
          left: offset.left - parentOffset.left
        }
      },
      offsetParent: function() {
        return this.map(function() {
          var parent = this.offsetParent || document.body;
          while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
            parent = parent.offsetParent
          return parent;
        })
      }
    };

    ['width', 'height'].forEach(function(dimension) {
      var dimensionProperty =
        dimension.replace(/./, function(m) {
          return m[0].toUpperCase();
        });
      $.fn[dimension] = function(value) {
        var offset, el = this[0];

        if (value === undefined) return dataType.isWindow(el) ? el['inner' + dimensionProperty] :
          dataType.isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
          (offset = this.offset()) && offset[dimension]
        else return this.each(function(idx) {
          el = $(this)
          el.css(dimension, funcArg(this, value, idx, el[dimension]()))
        })
      }
    });
    //sobeautiful.Z.prototype = $.fn;
    //  $.sobeautiful = sobeautiful;
  return $;
})();
//这种写法降低了可读性，但是提高了性能
window.sb == undefined && (window.sb = sobeautifulQza);
