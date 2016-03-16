var addEvent = (function(){
    if (window.addEventListener) {
        return function(el, sType, fn, capture) {
            el.addEventListener(sType, function(e) {
                fn.call(el, e);
            }, (capture));
        };
    } else if (window.attachEvent) {
        return function(el, sType, fn, capture) {
            el.attachEvent("on" + sType, function(e) {
                fn.call(el, e);
            });
        };
    }
})();


var pageWidth = window.innerWidth,
    pageHeight = window.innerHeight;

   //IE、Firefox、Chrome、Safari、Opera 支持 ;
   if(typeof pageWidth != 'number')
   {
    // CSS1Compat：标准兼容模式开启。
    if(document.compatMode == 'CSS1Compat'){
     pageWidth = document.documentElement.clientWidth;
     pageHeight = document.documentElement.clientHeight;
    } else {
    // BackCompat：标准兼容模式关闭。
     pageWidth = document.body.clientWidth;
     pageHeight = document.body.clientHeight;
    }
   }
