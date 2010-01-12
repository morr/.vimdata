/*
  Основной объект
*/
var suilib = {collector:{events:[], elements:[]}, registered:0, version:'1.3.231', packed:true, debug:true, $debug:[]};

/*
  Определение поддержки новых методов
*/
suilib.features = {
  gebcn: !!(document.getElementsByClassName && document.getElementsByClassName.toString().match(/native/)),
  io:    !!([].indexOf && [].indexOf.toString().match(/native/)),
  map:   !!([].map && [].map.toString().match(/native/))
}

/*
  debug
*/
var debug = {
  info: window.console && console.firebug ? window.console.info : function(){},
  error: window.console && console.firebug ? window.console.error : function(){},
  log: window.console && console.firebug ? window.console.log : function(){},
  warn: window.console && console.firebug ? window.console.warn : function(){}
};

/*
  Новая отладка - псевдо-firebug для неподдерживающих его браузеров
*/
/*try {
if(!window.console || !console.firebug) {
  (function(){
    suilib.pseudoconsole = true;
    var log  = function(args, type) {
      var tmp = '', color = '#3A3A3A', backcolor = '#FAFCFA';
      for(var i=0,l=args.length; i<l; i++)
        tmp += dump(args[i]) + ' ';
      switch(type) {
        case 'debug':
        break;
        case 'info':
          backcolor = '#33F'
        break;
        case 'warning':
          backcolor = 'cyan'
        break;
        case 'error':
          color = '#F00'
        break;
      }
      suilib.$debug.push('<span style="padding-left:5px;color:'+color+';background-color:'+backcolor+'">'+tmp+'</span>');
    }
    var dump = function(obj) {
      var result = obj+'';
      if(obj) {
        if(obj.tagName) result = '[node <b>'+(obj.tagName.toUpperCase())+'</b>]';
        else if(obj instanceof Array && obj.join) result = 'array: [<b>'+obj.join(', ')+'</b>]';
      }
      return result
    }

    window.console = {
      firebug: '1.1-pseudo',
      log: function(){
        log(arguments, '');
      },
      debug: function(){
        log(arguments, 'debug');
      },
      info: function(){
        log(arguments, 'info');
      },
      warn: function(){
        log(arguments, 'warning');
      },
      error: function(){
        log(arguments, 'error');
      },
      assert: function(truth, message){
      },
      dir: function(object){
      },
      dirxml: function(node){
      },
      trace: function(){
      },
      group: function(){
      },
      time: function(name){
      },
      timeEnd: function(name){
      },
      profile: function(){
        this.warn(['profile() not supported!']);
      },
      profileEnd: function(){
        this.warn(['profileEnd() not supported!']);
      },
      count: function(){
        this.warn(['count() not supported!']);
      }
    }
  })()
}} catch(e) { //document.location.reload(); alert('You\'re using bad ie console!') }
*/
/*
  Параметры инициализации модулей
*/
suilib.modArgs = {};

/*
  Загрузчик
*/  
suilib.load = function(module, args, nocache, sys) {
  var self = this; if(this.have(module)) return false;
  var rand = nocache ? '?'+(new Date().getTime()) : '';
  var scr  = document.createElement('script');
  scr.setAttribute('type', 'text/javascript');
  if(sys) {
    scr.setAttribute('src',  this.scriptPath+'sys_'+module+'.js'+rand);
  } else {
    scr.setAttribute('src',  this.scriptPath+'mod_'+module+'.js'+rand);
    this.forInit.push(module); this.modArgs[module] = args;
  }
  this.rootScript.parentNode.appendChild(scr);
}

/*
  Запуск модуля
*/
suilib.initModule = function(mname) {
  (this.have(mname) ? this[mname].init(this.modArgs[mname]) : alert('Ошибка инициализации модуля '+mname+'!'));
  if($('loading')) $('loading').innerHTML+='<br />Инициализация '+mname+'...';
  if(this.packed) return null;
  var nextModule = this.forInit.shift();
  if(nextModule) this.initModule(nextModule);
  else {
    if($('loading')) $('loading').hide();
    if($('page')) $('page').show();
    this.waitForInitialize.walkwith(function(method) {
      suilib.collector.elements.push(method);
      method.apply(suilib, [])});
    this.libLoaded = true;
  }
}

/*
  Проверка наличия модуля
*/
suilib.have = function(mname) {
  return (this[mname] && this[mname].init);
}

/*
  Инициализация
*/
suilib.init = function(args, nocache) {
  // Предотвращение повторной инициализации 
  if(arguments.callee.libready) return false;
  arguments.callee.libready = true;
  // Определяем браузер
  var ua = {}, self = this; this.forInit = []; 
  if(!this.waitForInitialize) this.waitForInitialize = [];
  ua.isDOM    = (document.getElementById ? true : false);
  ua.isOpera  = ((window.opera && ua.isDOM) ? true : false);
  ua.isOpera6 = ((ua.isOpera && window.print) ? true : false);
  ua.isOpera7 = ((ua.isOpera && document.readyState) ? true : false);
  ua.isOpera9 = ((ua.isOpera && window.Audio) ? true : false);
  ua.isMSIE   = ((document.all && document.all.item && !ua.isOpera) ? true : false);
  ua.isMSIE5  = ((ua.isDOM && ua.isMSIE) ? true : false);
  ua.isMSIE7  = (ua.isMSIE && window.XMLHttpRequest ? true : false);
  ua.isMSIE8  = (ua.isMSIE && window.postMessage ? true : false);
  ua.isSafari  = (navigator.vendor && navigator.vendor.toLowerCase().find('apple') ? true : false)
  ua.isNetscape4 = (document.layers ? true : false);
  ua.isMozilla = ((ua.isDOM && navigator.appName=="Netscape" && !ua.isSafari) ? true : false);
  ua.isFirefox = ((ua.isDOM && document.addEventListener && !ua.isOpera && !ua.isSafari) ? true : false);
  ua.isFirefox3 = ((ua.isFirefox && window.applicationCache) ? true : false);
  this.UserAgent = ua;
  if(!ua.isDOM) {
    alert('Слишком старая версия браузера!\nКорректная работа невозможна.');
    return false;
  } var tmp = ''; this.scriptPath = '';
  this.rootScript = {};
  this.includeNotify = function(module) {
    if(self.packed) return null;
    if($('loading')) $('loading').innerHTML+='<br />Подключение '+module+'...';
    self.forLoad--;
  }
  this.capturedClick = {}
  this.clickCapture = function(e) {
    self.capturedClick = e;
  }
  this.clickCapture.$('click', window, document);
  var dscripts = $(document).getTags('script');
  for(var i=0,l=dscripts.length; i<l; i++) {
    tmp = dscripts[i].getAttribute('src');
    if(tmp && tmp.search && tmp.search(/suilib\.js$/i)>=0) {
      this.scriptPath = tmp.substr(0, tmp.length-9);
      this.rootScript = dscripts[i];
      break;
    }
  }
  if(!this.packed) {
    this.load('queue', null, nocache, true); // timeout's & interval's wrapper
    this.load('style', null, nocache, true); // dynamic stylesheets
  }  
  if(ua.isMSIE && !ua.isMSIE7 && !ua.isMSIE8) {
    //this.load('ieselect', null, nocache, true); // fix IE select elements zIndex
    $(document.body).filter('img',null,null,true).walkwith(function(el) {
      var tmp = el.getAttribute('src');
      if(tmp.search && tmp.search(/\.png$/i)>=0) {
        el.src = 'i/sp.gif';
        el.runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + tmp + '",sizingMethod="scale")'; }
    });
  }
  this.forLoad = 0;
  for(var i in args) this.forLoad++;
  if(this.forLoad && !this.packed) {
    var self = this;
    var checkLoad = function() { // проверка загрузки модулей
      if(self.forLoad==0) {
        arguments.callee.$un('interval');
        breaker.$un('timeout');
        var nextModule = self.forInit.shift();
        if(nextModule) self.initModule(nextModule);
      }
    }
    var breaker = function() { // ошибка загрузки
      checkLoad.$un('interval');
      if(self.forLoad > 0) {
        if(confirm('Не удалось загрузить некоторые модули!\nОбновить страницу?')) document.location.reload();
      }
    }
    checkLoad.$('interval', 100);
    breaker.$('timeout', this.forLoad*5000);
  } else {
    if(this.packed)
      for(var i in args) {
        this.modArgs[i] = args[i];
        this.initModule(i, args[i], nocache);
      }  
    if($('loading')) $('loading').hide();
    if($('page')) $('page').show();
    this.waitForInitialize.walkwith(function(method) {
      suilib.collector.elements.push(method);
      method.apply(suilib, [])});
    this.libLoaded = true;
  }
  if(!this.packed) for(var i in args) this.load(i, args[i], nocache);
}

/*
  Номер таймаута
*/
Function.prototype.TMT = 0;

/*
  Номер таймера
*/
Function.prototype.IVS = 0;

/*
  Кэш объектов
*/
window.$cache = {};
 
/*
  Дополнение объектов новыми свойствами и методами
*/
Object.extend = function(d, s) {
  for(var p in s) d[p] = s[p];
  return d;
}

/*
  Возвращает объект. Если передана строка, ищет его в кэше,
  либо пытается получить его с помощью getElementById и записывает в кэш
  Если входной аргумент - не строка, возвращает его
  Если аргументов несколько, обходит их в цикле и возвращает массив объектов
*/
function $(el) {
  if(arguments.length>1) {
    for (var i=0, els=[], len=arguments.length; i<len; i++)
      els.push($(arguments[i]));
    return els;
  }
  if(typeof el=='string') {
    if(!window.$cache[el]) {
      var t = document.getElementById(el);
      if(!t) {
        debug.warn("function $: 'Object with id '"+el+"' not found!'");
        return null;
      }
      window.$cache[el] = t.__extended__ ? t : Object.extend(t, $EOProto);
    } el = window.$cache[el];
  } else {
    if(!el) {
      debug.warn("function $: 'Argument isn't object!'");
      return null
    }
    el = el.__extended__ ? el : Object.extend(el, $EOProto);
  }
  return el;
}

/*
  Универсальный метод вызова функций.
   - по таймауту
   - с интервалом
   - запуск с массивом аргументов (для каждого)
   - присваивание событию
   
   Возвращает саму функцию
*/
suilib.$mem = !!document.attachEvent;
suilib.$wem = !!document.addEventListener;
if(!suilib.$mem && !suilib.$wem) alert(':-(');

Function.prototype.$ = function(mode) { 
  var self = this;
  if(typeof arguments.callee.uats=='undefined') arguments.callee.uats = 
    (navigator.vendor && navigator.vendor.toLowerCase().find('apple')) ? true : false;
  switch(mode) { 
    case 'suilibLoaded':
      if(!suilib.waitForInitialize) suilib.waitForInitialize = []
      suilib.waitForInitialize.push(this);
    break;
    case 'timeout': 
      this.TMT = setTimeout(this, arguments[1]);
      suilib.collector.events.push([this, '', '']);
    break; 
    case 'interval': 
      this.IVS = setInterval(this, arguments[1]); 
      suilib.collector.events.push([this, '', '']);
    break; 
    case 'each': 
      for(var i=1,l=arguments.length; i<l; i++) {
        this(arguments[i]); 
        suilib.collector.elements.push(arguments[i])
      }
      suilib.collector.elements.push(this)  
    break; 
    default: 
      for(var i=1,l=arguments.length; i<l; i++) {
        var tmp = arguments[i];
        arguments[i] = $(arguments[i]); suilib.registered++;
        if(!arguments[i]) {
          alert('Объект: '+tmp+' не существует!'); continue;
        }
        if(!arguments[i].$eventCollector) arguments[i].$eventCollector = [];
        if(suilib.$mem) arguments[i].attachEvent('on'+mode, this)
        else arguments[i].addEventListener(mode, this, false);
        if(mode=='load' && !arguments.callee.uats) {
          this.$('DOMContentLoaded', arguments[i]);
          if(arguments[i].removeEventListener) arguments[i].removeEventListener(mode, this, false);
        }  
        if(mode!='unload') arguments[i].$eventCollector.push(suilib.collector.events.push([this, mode, arguments[i]])-1);
      }  
    break; 
  }
  return this; 
}

/*
  Отменяет всё, на что была повешена функция
*/
Function.prototype.$un = function(mode) {
  if(mode) {
    for(var i=1,l=arguments.length; i<l; i++) {
      arguments[i] = $(arguments[i]); suilib.registered--;
      if(suilib.$mem) arguments[i].detachEvent('on'+mode, this)
      else arguments[i].removeEventListener(mode, this, false);
    }
  }
  clearTimeout(this.TMT);
  clearInterval(this.IVS);
  return this; 
}

/*
  Хэш прототипа для расширения объектов
*/
var $EOProto = {

  __extended__: true, // для определения, был ли уже расширен объект

  /*
    filter (see suilib_lite)
  */
  filter: function(tag, cls, attr, deep) {
    if(this instanceof Array) {
      var result = [];
      for(var i=0,l=this.length; i<l; i++)
        if(this[i] && this[i].filter)
          result = result.concat(this[i].filter(tag, cls, attr, deep));
      return result;
    }
    var g = suilib.features.gebcn;
    var list = (deep ? ((g && cls /*&& ((tag && tag=='*') || !tag)*/) ? this.getElementsByClassName(cls) : this.getElementsByTagName(tag || '*')) : this.childNodes), result = [];
    outerLoop:
    for(var i=0,l=list.length; i<l; i++) {
      if(!list[i] || list[i].nodeType!=1) continue;
      if(!deep && tag && tag!='*' && list[i].tagName.toLowerCase()!=tag.toLowerCase()) continue;
      if(cls && (!g ||tag) && list[i].className.split(' ').hasa(cls)===false) continue;
      if(attr) for(var j in attr) try {
        if(list[i].getAttribute(j).toLowerCase()!==attr[j].toLowerCase()) continue outerLoop;
      } catch(e) { continue outerLoop; }
      result.push($(list[i]));
    }
    return result;
  },

  // Begin compatibility with version 1.0
  getChilds: function(cls, deep) {
    return this.filter('*', cls, null, deep);
  },

  getByClass: function(cls, root) {
    return ((root ? $(root) : false) || this).filter('*', cls, null, true);
  },
  
  getTags: function(tag, cls, pid) {
    var ret = [];
    if(tag instanceof Array)
      for(var i=0,l=tag.length; i<l; i++) ret = ret.concat(this.getTags(tag[i], cls, pid));
    else
      ret = (pid ? this : document).filter(tag, cls, null, true);
    return ret;
  },

  getByAttr: function(hash, root) {
    return ((root ? $(root) : false) || this).filter('*', null, hash, true);
  },
  // End compatibility with version 1.0

  /*
    Является ли элемент потомком текущего
  */
  pid: function(el) {
    el = $(el);
    if(el.parentNode==null) return false;
    if(el.parentNode==this) return true;
    else return this.pid(el.parentNode);
  },

  /*
    Соответствие тега узла заданному
  */
  isa: function(tag) {
    return (this.tagName && this.tagName.toLowerCase()===tag.toLowerCase() ? true : false);
  },

  /*
    Создает элемент el и добавляет его потомком текущего
    При необходимости, присваивает ему атрибуты из хеша attr
    Возвращает созданный элемент
  */
  add: function(el, attr, childs) {
    var child = document.createElement(el);
    if(attr) for(var a in attr) {
      switch(a) {
        case 'class': $(child).classAdd(attr[a]);
        break;
        case 'style': $(child).setstyle(attr[a]);
        break;
        case 'innerHTML': child.innerHTML = attr[a];
        break;
        default: child.setAttribute(a, attr[a]);
      }
    }
    if(childs) for(var i=0,len=childs.length; i<len; i++) child.appendChild(childs[i])
    if(this && this!=window && this!=document && this.appendChild)
      this.appendChild(child);
    return child;
  },

  /*
    Создает текстовый узел и возвращает его
  */
  addtext: function(text) {
    var child = document.createTextNode(text);
    if(this && this!=window && this!=document && this.appendChild) this.appendChild(child);
    return child;
  },

  /*
    Устанавливает прозрачность элемента (если это возможно)
    Может создавать fading - при передаче второго аргумента
    По завершении, может вызывать callback-функцию
  */
  setop: function(op, st, cb) {
    if(!this.style) return false;
    if(st) {
      var curop = this.getstyle('opacity');
      var el = this; var dir = op > curop;
      var ivl = setInterval(function() {
        //dir ? curop+=st : curop-=st;
              if((dir && curop>=op) || (!dir && curop<=op)) {
                clearInterval(ivl);
                if(cb) cb();
              }  
              el.setop(curop);
            }, 100);
    } else
    if(document.body.filters) {
      var alph = this.filters['DXImageTransform.Microsoft.alpha'] || this.filters.alpha;
      if(alph) alph.opacity = op;
      else this.style.filter += "progid:DXImageTransform.Microsoft.Alpha(opacity="+op+")";
    } else {
      var aop = op/100;
      this.style.opacity = aop;
      this.style.MozOpacity = aop;
      this.style.KhtmlOpacity = aop;
    }
  },

  /*
    Растягивает/сжимает элемент по ширине/высоте
    первый параметр - хеш вида {h:'40', w:'129'}
    если значение - false, значит менять размеры не надо
    Остальные аргументы - то же, что и для setop
    Значения задаются в пикселах.
  */
  stretch: function(pr, st, cb) {
    if(!this.style) return false;
    if(st) {
      var curh = parseInt((pr.h ? this.getstyle('height') : 0), 10);
      var curw = parseInt((pr.w ? this.getstyle('width')  : 0), 10);
      var el = this; 
      var dirh = parseInt(pr.h, 10) > curh;
      var dirw = parseInt(pr.w, 10) > curw;
      pr.h = parseInt(pr.h, 10);
      pr.w = parseInt(pr.w, 10);
      var ivl = setInterval(function() {
              //dirh ? curh+=st : curh-=st;
              //dirw ? curw+=st : curw-=st;
              var sob = {}; var f1 = f2 = false;
              if((dirh && curh>=pr.h) || (!dirh && curh<=pr.h)) f1 = true;
              else sob.h = curh;
              if((dirw && curw>=pr.w) || (!dirw && curw<=pr.w)) f2 = true;
              else sob.w = curw;
              if(f1 && f2) {
                clearInterval(ivl);
                if(cb) cb();
              }  
              el.stretch(sob);
            }, 100);
    } else {
      if(pr.h) {
        if(parseInt(pr.h, 10)) this.style.height = parseInt(pr.h, 10)+'px';
      }
      if(pr.w) {
        if(parseInt(pr.w, 10)) this.style.width  = parseInt(pr.w, 10)+'px';
      }
    }
  },

  /*
    Интерфейс для работы с анимационным фреймворком jTweener.
  */
  tweener: function(obj, options) {
    var anonymous = function(){};
    if('jTweener' in window) return $t(obj && typeof(obj)=='object' && options ? obj : this, !options ? obj : options); else
    return {
      'tween'         : anonymous,
      'percent'       : anonymous,
      'stop'          : anonymous,
      'addOptions'    : anonymous,
      'clearOptions'  : anonymous,
      'removeOptions' : anonymous
    }
  },

  /*
    Скрывает элемент
  */
  hide: function() {
    this.style.display = 'none';
  },

  /*
    Показывает элемент
  */
  show: function() {
    this.style.display = '';
  },

  /*
    Удаляет элемент
  */
  remove: function(rmid) {
    var tmp = [];
    if(this.$eventCollector && this.$eventCollector.length)
      for(var i=0,len=this.$eventCollector.length,evts=suilib.collector.events; i<len; i++)
        tmp.push(evts[this.$eventCollector[i]]);
    if(tmp.length) unloadGarbage.apply({events:tmp, elements:[]}, []);
    if(rmid && this.removeAttribute) {
      var oid = this.getAttribute('id');
      if(window.$cache[oid]) delete(window.$cache[oid]);
      this.removeAttribute('id');
    }
    if(this.parentNode) this.parentNode.removeChild(this);
  },

  /*
    Удаляет всех потомков элемента
  */
  removeChilds: function(rmid) {
    if(this && this.childNodes)
      while(this.childNodes.length) {
        if(this.lastChild.nodeType==1)
          arguments.callee.apply(this.lastChild, [rmid]);
        var tmp = [];
        if(this.lastChild.$eventCollector && this.lastChild.$eventCollector.length)
          for(var i=0,len=this.lastChild.$eventCollector.length,evts=suilib.collector.events; i<len; i++)
            tmp.push(evts[this.lastChild.$eventCollector[i]]);
        if(tmp.length) unloadGarbage.apply({events:tmp, elements:[]}, []);
        if(rmid && this.lastChild.removeAttribute) {
          var oid = this.lastChild.getAttribute('id');
          if(window.$cache[oid]) delete(window.$cache[oid]);
          this.lastChild.removeAttribute('id');
        }
        this.removeChild(this.lastChild);
      } 
  },

  /*
    Возвращает значение нужного стиля элемента
  */
  getstyle: function(stn) {
    var val = this.style[stn];
    if(!val) {
      if(document.defaultView && document.defaultView.getComputedStyle) {
        var css = document.defaultView.getComputedStyle(this, null);
        val = css ? css[stn] : null;
      } else if(this.currentStyle) {
        val = this.currentStyle[stn];
      }
    }
    if((val=='auto') && ['width','height'].hasa(stn) && (this.getstyle('display')!='none'))
      val = this['offset'+stn.capitalize()]+'px';
    if(stn=='opacity') {
      if(val) return parseFloat(val)*100;
      if(val = (this.filters['DXImageTransform.Microsoft.alpha'] || this.filters.alpha))
        if(val.opacity) return parseFloat(val.opacity);
      if(val = (this.getstyle('filter') || '').match(/alpha\(opacity=(.*)\)/i))
        if(val[1]) return parseFloat(val[1]);
      return 100;  
    }    
    return val=='auto' ? null : val;    
  },

  /*
    Задает элементу стили, переданные обычной css-строкой
  */
  setstyle: function(style) {
    var rules = style.split(';')
    for(var i=0,l=rules.length; i<l; i++) {
      var hash = rules[i].split(':')
      var prop = hash[0].camelize().trim()
      try { switch(prop) {
        case 'float':
          this.style['styleFloat'] = hash[1].trim()
          this.style['cssFloat']   = hash[1].trim()
        break;
        case 'opacity':
          var op = parseInt(hash[1], 10)
          if(document.body.filters) {
            var alph = (this.filters['DXImageTransform.Microsoft.alpha'] || this.filters.alpha)
            if(alph) alph.opacity = op
            else this.style.filter += "progid:DXImageTransform.Microsoft.Alpha(opacity="+op+")"
          } else {
            var aop = op / 100
            this.style.opacity = aop;
            this.style.MozOpacity = aop;
            this.style.KhtmlOpacity = aop;
          }
        break;
        default:
          this.style[prop] = hash[1].trim()
      } } catch(exc) {  }
    }
    return this
  },

  /*
    Добавляет новый класс, сохраняя остальные
  */
  classAdd: function(cls) {
    var allCls = (this.className.split(' ') || []);
    if(allCls.hasa(cls)) return false;
    allCls.push(cls);
    this.className = allCls.join(' ').trim();
  },

  /*
    Добавляет новый класс, удаляя один или несколько заданных
  */
  classReplace: function(clsNew, clsOld) {
    if(typeof clsOld=='object' && clsOld.length)
      for(var i=0,l=clsOld.length; i<l; i++) this.classRemove(clsOld[i]);
    else this.classRemove(clsOld);
    this.classAdd(clsNew);
  },

  /*
    Удаляет класс у элемента, сохраняя остальные
  */
  classRemove: function(cls) {
    var allCls = (this.className.split(' ') || []);
    for(var i=0,l=allCls.length; i<l; i++)
      if(allCls[i]==cls) allCls.splice(i,1);
    this.className = allCls.join(' ');    
  },

  /*
    Возвращает позицию элемента на странице
  */
  getoffset: function(deep) {
    if(deep && this.getBoundingClientRect) {
      var box = this.getBoundingClientRect();
      var x = box.left + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft) - document.documentElement.clientLeft;
      var y = box.top  + Math.max(document.documentElement.scrollTop,  document.body.scrollTop)  - document.documentElement.clientTop;
    } else {
      var x  = this.offsetLeft;
      var y  = this.offsetTop;
      if(this.offsetParent && deep) {
        var pos = $(this.offsetParent).getoffset(deep);
        x += pos[0];
        y += pos[1];
      }
    }
    return [x,y];
  },

  /*
    Возвращает корректные ширину и высоту окна браузера и всего документа
  */
  getsizes: function() {
    document.body.style.padding = 0;
    document.body.style.margin  = 0;
    var wW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0;
    var wH = window.innerHeight ||  document.documentElement.clientHeight || document.body.clientHeight || 0;
    var dW = Math.min(document.body.scrollWidth, wW), dH = Math.max(document.body.scrollHeight, wH);
    document.body.style.padding = '';
    document.body.style.margin  = '';

    return [wW,wH,dW,dH];
  },

  /*
    Выравнивает параметры событий в разных браузерах
  */
  handyevent: function(e) {
    var scrlX  = document.documentElement.scrollLeft + document.body.scrollLeft;
    var scrlY  = document.documentElement.scrollTop  + document.body.scrollTop;
    var x      = e.pageX  ? e.pageX  : e.x+scrlX;
    var y      = e.pageY  ? e.pageY  : e.y+scrlY;
    var target = e.target || e.srcElement;
    return {x:x, y:y, target:target};
  }
}

$EOProto.removeElement = $EOProto.remove;

if(window.HTMLElement && window.HTMLElement.prototype)
  Object.extend(window.HTMLElement.prototype, $EOProto);

$(document);

/*
  Проверяет, есть ли в массиве значение
*/
Array.prototype.hasa = function(val) {
  if(suilib.features.io) {
    var i = this.indexOf(val);
    return i==-1 ? false : i;
  }
  for(var i=0,l=this.length; i<l; i++)
    if(this[i]===val) return i;
  return false;  
}

/*
  Проходит по массиву и вызывает callback-функцию
  для каждого элемента
*/
Array.prototype.walkwith = function(cb, context) {
  if(suilib.features.map) {
    return this.map(cb, context);
  }
  var ret = [];
  for(var i=0,l=this.length; i<l; i++)
    ret.push(cb.call(context, this[i], i, this))
  return ret;  
}

/*
  Конвертация в тип sEnum
*/
Array.prototype.tosEnum = function() {
  return new sEnum(this);
}

/*
  Wrap to node.filter method
*/
Array.prototype.filter = function() {
  return $EOProto.filter.apply(this, (new sEnum(arguments)).flat());
}

/*
  Wrap to node.tweener method
*/
Array.prototype.tweener = function(obj, options) {
  return $EOProto.tweener.call(this, obj && options ? obj : null, !options ? obj : options);
}

/*
  Делает первый символ в строке заглавным
*/
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase()+this.substring(1).toLowerCase();
}

/*
  Простой поиск в строке
*/
String.prototype.find = function(what) {
  return(this.indexOf(what)>=0 ? true : false);
}

/*
  Преобразует строку стилевого свойства в подходящее свойство JS
*/
String.prototype.camelize = function() {
  var parts = this.split('-'), len = parts.length;
  if(len == 1) return parts[0];
  var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];
  for(var i=1; i<len; i++)
    camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
  return camelized.toString();
}

/*
  Аналог php-шной функции
*/
String.prototype.trim = function(what) {
  var sym = [' ', '\r', '\n'];
  if(what) for(var i=0,l=what.length; i<l; i++) sym.push(what.charAt(i));
  var result = this;
  while(sym.hasa(result.charAt(0))!==false) result = result.substr(1);
  while(sym.hasa(result.charAt(result.length-1))!==false) result = result.substr(0, result.length-1);
  return result.toString();
}

/*
  Выполняет код, найденный между тегами script в строке
  Может понадобиться для динамического выполнения JS-функций с сервера
*/
String.prototype.evalScripts = function() {
  var reg = new RegExp('(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)', 'gim');
  var jscode = reg.exec(this)[1];
  if(jscode) eval('try{'+jscode+'}catch(e){}');
}

String.prototype.escapeHTML = function() {
  var div = document.createElement('div');
  var text = document.createTextNode(this);
  div.appendChild(text);
  text = div.innerHTML;
  div = null;
  return text;
}

/*
  Конвертация в тип sEnum
*/
String.prototype.tosEnum = function() {
  return new sEnum(this.split(''));
}

/*
  Округление до необходимого количества символов после запятой
*/
Math.fix = function(fl, ep) {
  var fp = Math.pow(10, ep);
  return Math.round(fl * fp) / fp;
}

/*
  Возвращает количество дней в месяце, определяемом объектом
*/
Date.prototype.getDaysInMonth = function() {
  var dayCount = [31,28,31,30,31,30,31,31,30,31,30,31];
  if(this.isLeapYear()) dayCount[1] = 29;
  return dayCount[this.getMonth()];
}

/*
  Возвращает русифицированное значение месяца/дня недели
  формат:
    M   - полное название месяца, именительный падеж
    Mr  - полное название месяца, родительный падеж
    D   - полное название дня недели
    sD  - краткое название дня недели
    
    Английские тоже надо было куда-нибудь запихнуть =)
    DE  - полное название дня недели (анг)
    sDE - краткое название дня недели (анг)
  Если mode равен true, возвращает массив названия целиком, независимо от даты  
*/
Date.prototype.getRuLabel = function(f, mode) {
  var forms = {
    'M':   ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    'Mr':  ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
    'D':   ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    'sD':  ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    'ME':  ['January','February','March','April','May','June','July','August','September','October','November','December'],
    'sME': ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    'DE':  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'sDE': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }
  if(!forms[f]) return false;
  var month = this.getMonth();
  var day   = this.getDay();
  return (mode ? forms[f] : 
         ((['M', 'Mr', 'ME', 'sME'].hasa(f)!==false) ? forms[f][month] : forms[f][day]));
}

/*
  Возвращает true, если год високосный и false в противном случае
*/
Date.prototype.isLeapYear = function() {
  var year = this.getFullYear();
  return ((((year%4==0) && (year%100!=0)) || (year%400==0)) ? true : false);
}

/*
  Попытка эмулировать некий тип данных а-ля замкнутая кольцевая структура
*/
var sEnum = function() { this.initialize(arguments) }
sEnum.prototype = {
  initialize: function(args) {
    this.storage = {}; this.current = null;
    if(args.length==1) {
      args = args[0];
      switch(typeof args) {
        case 'object':
          if('length' in args) {
            for(var i=0,l=args.length; i<l; i++)
              this.storage[i] = args[i];
            this.current = 0;
          }
        break;
        case 'string':
          for(var i=0,l=args.length; i<l; i++)
            this.storage[i] = args.charAt(i);
          this.current = 0;
        break;
        default:
      }
    } else {
      for(var i=0,l=args.length; i<l; i++)
        this.storage[i] = args[i];
      this.current = 0;
    }
    return this;
  },

  next: function() {
    var result = null, flag = false;
    for(var i in this.storage) {
      if(flag) {
        result = this.storage[i];
        this.current = i;
        flag = false
        break;
      }
      if(i==this.current) flag = true
    }
    if(flag)
      for(var i in this.storage) {
        result = this.storage[i];
        this.current = i;
        break;
      }
    return result;
  },

  prev: function() {
    var result = null, flag1 = false, flag2 = false, p;
    for(var i in this.storage) {
      if(i==this.current) {
        if(!flag1) break;
        this.current = p;
        result = this.storage[p];
        flag2 = true;
        break;
      }
      p = i; flag1 = true;
    }
    if(!flag2) {
      for(var i in this.storage) {}
      this.current = i;
      result = this.storage[i];
    }
    return result;
  },

  add: function(key, value) {
    this.storage[key] = value;
    this.current = key;
    return this;
  },

  rem: function(key, value) {
    if(key) delete this.storage[key];
    else for(var i in this.storage)
      if(this.storage[i]==value) delete this.storage[i];
    for(var i in this.storage) {
      this.current = i;
      break;
    }
    return this;
  },

  item: function(key) {
    key = key || this.current
    return this.storage[key];
  },

  move: function(key) {
    this.current = key;
    return this.storage[key];
  },

  flat: function() {
    var result = [];
    for(var i in this.storage)
      result.push(this.storage[i])
    return result;
  }
}

// Begin compatibility with version 1.0
var $D = function() {
  (new sEnum(arguments)).flat().walkwith(function(el){ debug.log(el) })
}
var $$D = function() {}
// End compatibility with version 1.0

// Final cleanup
var unloadGarbage = function() {
  for(var i=0,l=this.events.length; i<l; i++) {
    if(!this.events[i][0] || !this.events[i][0].$un || !this.events[i][1] || !this.events[i][2]) continue;
    this.events[i][0].$un(this.events[i][1], this.events[i][2]);
    this.events[i][0] = null;
    this.events[i][2] = null;
    this.events[i] = null;
  }
  for(var i=0,l=this.elements.length; i<l; i++) {
    this.elements[i] = null;
  }
};(function(){suilib.$debug=[];unloadGarbage.apply(suilib.collector)}).$('unload', window);
if(suilib.pseudoconsole && suilib.debug) {
  (function(){
    var d = $(document.body).add('div', {style:'position:fixed;bottom:0;left:0;background-color:#FAFCFA;width:100%;height:400px;display:none;overflow:auto;margin:0;padding:5px;font-family:Lucida Grande,Tahoma,sans-serif;font-size:11px;line-height:16px;border-top:1px solid black;'});
    (function(e){
      if((e.ctrlKey || e.ctrlLeft) && e.shiftKey && [96,126,192,1105,1025].hasa(e.keyCode || e.which)!==false) {
        d.style.display = d.style.display=='none' ? 'block' : 'none';
        e.cancelBubble = true; e.returnValue = false;
        if(e.preventDefault) e.preventDefault();
        if(e.stopPropagation) e.stopPropagation();
      }
    }).$('keydown', window, document, document.body);
    (function(){
      d.innerHTML = suilib.$debug.join('<br />');
    }).$('interval', 1000);
    suilib.console = d;
  }).$('load', window)};
/*

    Queue - замена стандартных таймеров

    @version $Id$

*/

new function() {
  var self = this;
  var _setTimeout    = window.setTimeout;
  var _clearTimeout  = window.clearTimeout;
  var _setInterval   = window.setInterval;
  var _clearInterval = window.clearInterval;
  var queue   = [];
  var timer   = 0;
  var cleanup = 0;
  var id = 0;
  var intervalId = null
  var addToQueue = function(m, i, t) {
    id++;
    var ret = queue.length;
    queue[ret] = {'id': id,
                  'method': m,
                  'interval': i,
                  'timeout': t,
                  'timer': 0,
                  'deleted': false
                 }
    if(ret > 10) cleanup = 1;
    if(null == intervalId) {
      timer = (new Date()).getTime();
      intervalId = _setInterval(queueRunner, 1);
    }
    return id;
  }
  var removeFromQueue = function(id, f) {
    var ret = false;
    for(var i=0,qL=queue.length; i<qL; i++) {
      if(id!=null && queue[i].id==id) {
        ret = true; 
        queue[i].deleted = true;
      }
      if(f!=null && queue[i].deleted) {
        queue.splice(i, 1);
        qL--;
        i--;
      }
    }
    if(f) cleanup = 0;
    return ret;
  }
  var queueRunner = function() {
    if(!cleanup) {
      var delta = (new Date()).getTime()-timer;
      for(var i=0,qL = queue.length; i<qL; i++) {
        if(!queue[i].deleted) {
          if(!(queue[i].timer ^ queue[i].interval) ) {
            if(typeof queue[i].method == 'function') queue[i].method()
            else if(typeof queue[i].method == 'string') eval(queue[i].method);
            if(queue[i].timeout) queue[i].deleted = true;
            queue[i].timer = 0;
          }
          queue[i].timer = queue[i].timer+delta > queue[i].interval ? queue[i].interval : queue[i].timer+delta;
        }
      }
      timer = (new Date()).getTime();
    } else if(cleanup == 1) {
      cleanup = 2;
      removeFromQueue(null, true);
    }
  }
  this.setInterval = function(m, i) {
    return addToQueue(m, i, false);
  }
  window._setInterval = window.setInterval;
  window.setInterval = this.setInterval;
  this.clearInterval = function(id) {
    return removeFromQueue(id);
  }
  window.clearInterval = this.clearInterval;
  this.setTimeout = function(m, i) {
    return addToQueue(m, i, true);
  }
  window._setTimeout = window.setTimeout;
  window.setTimeout = this.setTimeout;
  this.clearTimeout = function(id) {
    return removeFromQueue(id);
  }
  window.clearTimeout = this.clearTimeout;
}
/*

    Style - динамические таблицы стилей

    @version $Id$

*/

Object.extend(suilib, {
  addStyle: function(sa) {
    if(!document.styleSheets) return null;
    if(!document.styleSheets.length) {
      var s = $(document.body).add('style');
      s.setAttribute('type', 'text/css');
    }
    sa.walkwith(function(hash) {
      document.styleSheets[0].insertRule &&
      document.styleSheets[0].insertRule(hash.selector+'{'+hash.rule+'}', 0) ||
      document.styleSheets[0].addRule &&
      document.styleSheets[0].addRule(hash.selector, hash.rule, 0)
    })
  },
  
  /*
    Получить стили для данного селектора (если null, возвращаются ВСЕ стили)
  */
  getFullStyle: function(selector, cssid, names, doc) {
    if(!doc) doc = document;
    if(!doc.styleSheets) return null;
    var result = [], nresult = [], cs = '';
    for(var i=0,l=doc.styleSheets.length; i<l; i++) {
      if(cssid && cssid!=i) continue;
      try { cs = doc.styleSheets[i].cssRules || doc.styleSheets[i].rules; } catch(e) {}
      for(var j=0,ln=cs.length; j<ln; j++) {
              if(!selector || selector===cs[j].selectorText){
          result.push(cs[j].style);
          if(names) nresult.push(cs[j].selectorText);
        }
      }
    }
    return names ? [nresult, result] : result;
  }
});

/*/ Кешируем картинки !!!падение производительности на методе find!!!
suilib.imgcache = {};
suilib.getFullStyle().walkwith(function(el){
  for(var i in el) {
    if(typeof el[i]=='string' && el[i].find('url')) {
      var isrc = el[i].match(/url\(([^\)]+)\)/i)[1];
      isrc = isrc.trim('\'"');
      if(suilib.imgcache[isrc] && (typeof suilib.imgcache[isrc]=='object')) continue;
      suilib.imgcache[isrc]     = new Image();
      suilib.imgcache[isrc].src = isrc;
      $(suilib.imgcache[isrc]).hide();
      document.body.appendChild(suilib.imgcache[isrc]);
}}});//*/
if(!window.opera && !!document.execCommand) // опера, как всегда отличилась, и от этой команды удалила весь текст =)
  try { document.execCommand("BackgroundImageCache", false, true) } catch(e) {}
/*

    AJAX-интерфейс

    @version $Id$

*/

Object.extend(suilib, {
ajax:{
  init: function(args) {
    this.provider = null;
    if(args) this.url = args.url || document.location.href;
    this.method  = 'get';
    this.async = true;
    this.IFRuploadedFileName = {}; this.IFRuploadedError = ''; var self = this;
    this.headers = ['Accept', 'text/javascript, text/html, application/xml, text/xml, */*',
                    'Connection', 'close'];
    if(!this.loaders) this.loaders = ['loader.gif'];
    if(args) {
      this.imgPath  = args.ipt || 'ajax/';
      if(args.loaders && args.loaders.length) args.loaders.walkwith(function(el){self.loaders.push(el)});
    }  
    for(var i=0,l=this.providers.length; i<l; i++) {
      try {
      this.provider = this.providers[i]();
      } catch(e) {continue}
      break;
    }
    this.floatMover = function(e) {
      var scrlX  = document.documentElement.scrollLeft + document.body.scrollLeft;
      var scrlY  = document.documentElement.scrollTop  + document.body.scrollTop;
      self.floatloader.style.left = parseInt(e.pageX ? e.pageX : e.x+scrlX, 10) - 16 + 'px';
      self.floatloader.style.top  = parseInt(e.pageY ? e.pageY : e.y+scrlY, 10) - 15 + 'px';
    }
  },
  
  /*
    Транспорты
  */
  providers: [
    function() {return new XMLHttpRequest()},
    function() {return new ActiveXObject("Msxml2.XMLHTTP")},
    function() {return new ActiveXObject("Msxml3.XMLHTTP")},
    function() {return new ActiveXObject("Microsoft.XMLHTTP")}
  ],

  /*
    Задает параметры запроса
  */
  prepare: function(url, method, async, headers) {
    if(url) this.url = url.replace(/#.*$/, '');
    if(method && (method=='get' || method=='post')) this.method = method;
    this.async = async;
    if(headers) {
      for(var i=0,l=headers.length; i<l; i+=2) {
        this.headers.unshift(headers[i], headers[i+1]);
      }
    }
  },
    
  /*
    Производит запрос
    параметр tn используется только при загрузке файла
  */
  request: function(params, addtime, callback, tn, loader) {
    var self = this; var url = this.url.replace(/#.*$/, '');
    if(params.type && params.type=='file') {
      if(!params.value) {
        alert('Выберите файл для загрузки!');
        return false;
      }
      this.switchWait(true, loader);
      this.sendFile(params, addtime, callback, tn, loader);
      return false;
    } else if(params.type) params = params.id+'='+encodeURIComponent(params.value);
    this.switchWait(true, loader);
    if(this.method=='get') {
      url += (url.match(/\?/)?'&':'?')+params;
    } else {
      this.headers.push('Content-type', 'application/x-www-form-urlencoded');
    }
    url += (url.match(/\?/)?'&':'?')+'$js'+(addtime?'='+new Date().getTime():'');
    try {
      this.provider.open(this.method, url, this.async);
      if(this.async) {
        var xmlhttp = this.provider; var buildJS = this.buildJS;
        this.provider.onreadystatechange = function() {
          if(xmlhttp.readyState==4) self.switchWait(false, loader);
          callback({readyState: xmlhttp.readyState,
          statusCode:(xmlhttp.readyState==4) ? xmlhttp.status : null,
          responseJS:(xmlhttp.readyState==4 && xmlhttp.status==200) ? buildJS(xmlhttp) : null
          });
        }
      }
      for(var i=0,l=this.headers.length,tp=this.provider; i<l; i+=2) {
        tp.setRequestHeader(this.headers[i], this.headers[i+1]);
      }
      this.provider.send(this.method=='post'?params:null);
    } catch(e) {}
    if(!this.async) {
      var xmlhttp = {responseText:this.provider.responseText};
      this.init();
      self.switchWait(false, loader);
      return this.buildJS(xmlhttp);
    } this.init();
  },
    
  /*
    Отправка файла в динамическом ифрейме
  */
  sendFile: function(finp, addtime, callback, tn, loader) {
    var url = this.url.replace(/#.*$/, '');
    var self = this;
    var f = finp.cloneNode(true);
    var s = $(document.createElement('div'));
    s.style.position   = 'absolute'; 
    s.style.visibility = 'hidden';
    var ifrid = (new Date()).getTime();
    var params   = finp.sendParams ? finp.sendParams+'&$js&$file' : '$js&$file';
    s.innerHTML  = '<form action="'+url+(url.match(/\?/)?'&':'?')+params+'" method="post" enctype="multipart/form-data" target="suilib_sf_iframe_'+ifrid+'"></form><iframe name="suilib_sf_iframe_'+ifrid+'" id="suilib_sf_iframe_'+ifrid+'" style="width:0;height:0;overflow:hidden;border:none;"></iframe>';
    document.body.insertBefore(s, document.body.lastChild);
    var frm = s.firstChild;
    var rs  = finp.previousSibling, ns = finp.nextSibling;
    var pfl = finp.parentNode ? finp.parentNode : document.body;
    var plh = (rs && rs.nextSibling ) ? pfl.insertBefore(f, rs.nextSibling) : (ns?pfl.insertBefore(f, ns):pfl.appendChild(f));
    frm.appendChild(finp);
//    (function(){}).$('timeout', 100);
    (function() {
      frm.submit(); frm.reset();
      if(rs && rs.nextSibling) pfl.insertBefore(finp, rs.nextSibling);
      else if(ns) pfl.insertBefore(finp, ns);
      else pfl.appendChild(finp);
      $(plh).remove()
    }).$('timeout', 100);
    var di = setInterval(function() { 
      callback(false); 
      if(self.IFRuploadedFileName[tn] || self.IFRuploadedError.length) {
        clearInterval(di); 
        s.removeChilds(); frm = null;
        s.remove(); s = null;
        if(self.IFRuploadedError.length) alert(self.IFRuploadedError);
        else callback(self.IFRuploadedFileName[tn]); 
        self.IFRuploadedFileName[tn] = '';
        self.IFRuploadedError = '';
        self.switchWait(false, loader);
      }
    }, 1000);
  },
    
  /*
    Выполняет полученный JSON-объект
  */
  buildJS: function(xmlhttp) {
    // Удаляем возможные utf8 заголовки из ответа
    var utf8_header = String.fromCharCode(0xEF)+String.fromCharCode(0xBB)+String.fromCharCode(0xBF);
    var re = new RegExp("^"+utf8_header);
    while( re.test(xmlhttp.responseText) )
      xmlhttp.responseText = xmlhttp.responseText.replace(re, '');

    // Обрабатываем ответ
    var response;
    try { eval('try{response='+(xmlhttp.responseText || 'null')+'}catch(e){ alert("buildJS: "+e) }');
    } catch(e) { alert(e+'\n\n'+xmlhttp.responseText) }
    return response;
  },
    
  /*
    Собирает данные инпутов и строит из них строку запроса
  */
  buildParams: function(id, cls) {
    var ret = []; if(!id) id = document.body;
    var inputs = $(id).getTags(['input', 'textarea', 'select'], cls, true);
    for(var i in inputs) {
    if(inputs[i].id && !inputs[i].disabled) 
    switch(inputs[i].type) {
      case 'text': case 'password': case 'textarea': 
        ret.push(inputs[i].id+'='+encodeURIComponent(inputs[i].value));
      break;
      case 'checkbox': case 'radio': ret.push(inputs[i].id+'='+inputs[i].checked);
      break;
      case 'select-one': ret.push(inputs[i].id+'='+inputs[i].value);
      break;
      case 'select-multiple': {
        var vals = [];
         for(var j=0,l=inputs[i].length; j<l; j++) {
          if(inputs[i].options[j].selected) vals.push(inputs[i].options[j].value);
        }
        ret.push(inputs[i].id+'='+vals.join(','));
      }
      break;
    } }
    return ret.join('&');
  },
  
  /*
    "Пожалуйста, подождите"
  */
  switchWait: function(mode, loader) {
    var self = this, ie = suilib.UserAgent.isMSIE, szs = suilib.UserAgent.isMSIE ? document.getsizes() : [];
    if(mode) {
      if(loader && this.loaders[loader]) {
        this.floatloader = new Image();
        this.floatloader.src = this.imgPath + this.loaders[loader];
        this.floatloader.style.position = 'absolute';
        this.floatloader.style.zIndex = '200';
        document.body.appendChild(this.floatloader);
        var evt = (window.event || suilib.capturedClick);
        try { if(evt.type!='click') evt = (ie ? window.event : suilib.capturedClick) } catch(e) {}
        var scrlX  = document.documentElement.scrollLeft + document.body.scrollLeft;
        var scrlY  = document.documentElement.scrollTop  + document.body.scrollTop;
        if(evt) {
          var sl = parseInt(evt.pageX ? evt.pageX : evt.x+scrlX, 10) - 16;
          var st = parseInt(evt.pageY ? evt.pageY : evt.y+scrlY, 10) - 15;
          szs[2] = ie ? szs[2] : Math.max(document.body.scrollWidth, window.innerWidth);
          szs[3] = ie ? szs[3] : Math.max(document.body.scrollHeight, window.innerHeight);
          if(isNaN(sl)) sl = Math.ceil(szs[2]/2) - 16;
          if(isNaN(st)) st = Math.ceil(szs[3]/2) - 16;
          this.floatloader.style.left = sl + 'px';
          this.floatloader.style.top  = st + 'px'; }
        this.floatMover.$('mousemove', window, document);
      } else if(loader) { /* невидимый запрос */ } else { // дефолтный статусбар
        // Нефиг их плодить при каждом запросе =)
        var create = !(this.wdiv && this.wdiv);
        this.wdiv = this.wdiv ? document.body.appendChild(this.wdiv) : document.body.appendChild(document.createElement('div'));
        this.idiv = this.idiv ? document.body.appendChild(this.idiv) : document.body.appendChild(document.createElement('div'));
        with(this.wdiv.style) {
          position  = ie ? 'absolute' : 'fixed';
          left   = '0';
          top    = '0';
          zIndex = '9998';
          width  = ie ? szs[2]+'px' : '100%';
          height = ie ? szs[3]+'px' : '100%';
          backgroundColor = '#000000';
          margin = '0'; }
        with(this.idiv.style) {
          position  = ie ? 'absolute' : 'fixed';
          zIndex = '9999';
          textAlign  = 'center';
          paddingTop = '20%';
          width  = '100%';
          color = '#EBEBEB';
          left   = '0';
          top    = ie ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop)+'px' : '0'; }
        if(create) {
          this.idiv.appendChild(document.createTextNode('Пожалуйста, подождите...'));
          this.idiv.appendChild(document.createElement('br'));
          var img = this.idiv.appendChild(document.createElement('img'));
          img.setAttribute('src', this.imgPath+'loader.gif'); }
        $(this.wdiv).setop(30);
      }
    } else {
      if(loader && this.loaders[loader]) {
        this.floatMover.$un('mousemove', window, document);
        try { document.body.removeChild(this.floatloader) } catch(e) {}
      } else if(loader) { /* невидимый запрос */ } else { // дефолтный статусбар
        $(self.wdiv).remove();
        $(self.idiv).remove();
        window.scrollBy(1,1);
        window.scrollBy(-1,-1);
      }
    }
  }
}});
/*

    Календарь

    @version $Id$

*/

Object.extend(suilib, {
calendar:{
  init: function(args) {
    if(!args.apply || !args.apply.length) return false;
    args.apply.walkwith(this.createCalendar);
    this.changehandler = args.onchange || function(){}
    if(!this.clickObserver.oList) this.clickObserver.oList = [];
    this.clickObserver.$('click', (suilib.UserAgent.isMSIE ? document.body : window));
  },

  clickObserver: function() {
    var fn = arguments.callee;
    if(!fn.oList) {
      fn.oList = []; return null
    }
    for(var i=0,l=fn.oList.length,cal=suilib.calendar; i<l; i++) {
      if(!fn.oList[i]) continue;
      if(fn.oList[i].hash.el && fn.oList[i].div.getstyle('display')!=='none') fn.oList[i].div.$_hide();
      if(fn.oList[i].div.reDraw) {
        cal.draw(fn.oList[i].div, fn.oList[i].div.CDate);
        fn.oList[i].div.reDraw = false;
      }
    }
  },

  destroy: function(cid) {
    var o = this.clickObserver.oList[cid];
    o.div.removeChilds();
    o.div.remove(); o.div = null;
    this.clickObserver.oList[cid] = null;
  },

  /*
    Создает слой с календарем, задает необходимые обработчики и привязки объектов
  */
  createCalendar: function(hash) {
    if(hash.el) hash.el = $(hash.el);
    var tct = $(hash.container || document.body);
    var div = $(tct.appendChild(document.createElement('div')));
    if(hash.el) with(div.style) {
      position = 'absolute';
      display = 'none';
    }
    div.className = 'SUI_cal_div';
    try {
    switch(typeof hash.init) {
      case 'boolean':
        var calDate  = new Date((hash.el.value ? hash.el.value : hash.el.innerHTML));
      break;
      case 'string':
        var calDate  = new Date(hash.init);
      break;
      default:
        var calDate  = new Date();
    } } catch(e) {alert('Неверный формат даты!')}
    if(hash.effect) {
      var ename   = hash.effect.split(':');
      var evalue  = ename[1] || null;
      ename = ename[0];

      var show_fn = function() {
        var el = $(this);
        switch(ename) {
          case 'opacity':
            el.setop(1); el.show(); el.setop(99, evalue || 15);
          break;
          default:
            el.show();
        }
      }
      var hide_fn = function() {
        var el = $(this);
        switch(ename) {
          case 'opacity':
            el.setop(99); el.setop(1, evalue || 15, function(){ el.hide() });
          break;
          default:
            el.hide();
        }
      }
    } else {
      var show_fn = function() { $(this).show() }
      var hide_fn = function() { $(this).hide() }
    }
    Object.extend(div, {CDateFormat: (hash.format || 'r'),
                        CDestination: (hash.dest ? $(hash.dest) : $(hash.el)),
                        CDate: new Date(calDate.getTime()),
                        reDraw: false,
                        $_show: show_fn,
                        $_hide: hide_fn,
                        change: hash.change ? hash.change : function() {}
                       });
    if(hash.el) { (function(e) {
      e.cancelBubble = true;
      var pos = $(e.target || e.srcElement).getoffset(true);
      with(div.style) {
        left = pos[0] + 'px';
        top  = pos[1] + $(e.target || e.srcElement).offsetHeight + 'px';
      }

      // если источник календаря текстовое поле, то пробуем инициализировать календарь значением текстового поля
      if( $(e.target || e.srcElement).tagName.match(/input/i) )
      {
        var cur_value = $(e.target || e.srcElement).value;
        var matches;
        if( matches = cur_value.match(/(\d{4})\D(\d{2})\D(\d{2})/) )
        {
          calDate = new Date();
          calDate.setYear(matches[1]);
          calDate.setMonth(matches[2].replace(/^0/, '')-1);
          calDate.setDate(matches[3].replace(/^0/, ''));
        }
        if( matches = cur_value.match(/(\d{2})\D(\d{2})\D(\d{4})/) )
        {
          calDate = new Date();
          calDate.setDate(matches[1].replace(/^0/, ''));
          calDate.setMonth(matches[2]).replace(/^0/, '')-1;
          calDate.setYear(matches[3]);
        }
      }

      suilib.calendar.draw(div, calDate);
      div.$_show();
     }).$((hash.event || 'click'), $(hash.el)); }
    else {
      suilib.calendar.draw(div, calDate);
      div.$_show(); }
    if(!suilib.calendar.clickObserver.oList) suilib.calendar.clickObserver.oList = [];
    return suilib.calendar.clickObserver.oList.push({div:div, hash:hash}) - 1;
  },

  /*
    Отрисовка календаря
  */
  draw: function(div, calDate, init) {
    var dch       = $(div).getChilds();
    var days      = calDate.getDaysInMonth();
    var nowDay    = calDate.getDate(); // 1000*60*60*24
    var firstDay  = (new Date(calDate.getTime()-((nowDay-1)*86400000))).getDay();
    var lastDay   = (new Date(calDate.getTime()+((days-nowDay)*86400000))).getDay();
    if(--firstDay < 0) firstDay = 6;
    if(--lastDay  < 0) lastDay  = 6;
    var flag = false; var num = 1;
    var weeksCount = Math.ceil(days / 7);
    var labels = calDate.getRuLabel('sD', true);
    var table  = div.appendChild(document.createElement('table'));
    $(table).hide();
    table.className = 'SUI_cal_table';
    table.setAttribute('cellSpacing', '1');
    table = table.appendChild(document.createElement('tbody'));
    var row  = table.appendChild(document.createElement('tr'));
    row.className = 'SUI_cal_month';
    var cell = row.appendChild(document.createElement('td'));
    cell.setAttribute('colSpan', 7);
    cell.setAttribute('align', 'center');

    var self = this;
    var crow = cell.appendChild(document.createElement('table')).appendChild(document.createElement('tbody')).appendChild(document.createElement('tr'));
    crow.parentNode.parentNode.style.width = '100%';
    crow.className = 'SUI_cal_month';
    cell = crow.appendChild(document.createElement('td'));
    cell.style.textAlign = 'left';
    var prevMonth = cell.appendChild(document.createElement('a'));
    prevMonth.setAttribute('href', '#');
    prevMonth.appendChild(document.createTextNode('<<'));
    (function(e){self.stepMonth(e, -1, div, calDate)}).$('click', prevMonth);

    cell = crow.appendChild(document.createElement('td'));
    cell.style.width = '99%';
    cell.style.textAlign = 'center';
    cell.appendChild(document.createTextNode(' '));
    var mnLink = cell.appendChild(document.createElement('a'));
    mnLink.setAttribute('href', '#');
    mnLink.appendChild(document.createTextNode(calDate.getRuLabel('M')));
    (function(e){self.showMonths(e, div, calDate)}).$('click', mnLink);
    $(cell).appendChild(document.createTextNode(' '));
    var yrLink = cell.appendChild(document.createElement('a'));
    yrLink.setAttribute('href', '#');
    yrLink.appendChild(document.createTextNode(calDate.getFullYear()));
    (function(e){self.showYears(e, div, calDate)}).$('click', yrLink);
    cell.appendChild(document.createTextNode(' '));

    cell = crow.appendChild(document.createElement('td'));
    cell.style.textAlign = 'right';
    var nextMonth = cell.appendChild(document.createElement('a'));
    nextMonth.setAttribute('href', '#');
    nextMonth.appendChild(document.createTextNode('>>'));
    (function(e){self.stepMonth(e, 1, div, calDate)}).$('click', nextMonth);

    row = table.appendChild(document.createElement('tr'));
    row.className = 'SUI_cal_headrow';
    for(var i=1; i<8; i++) {
      row.appendChild(document.createElement('td')).appendChild(document.createTextNode(labels[i] || labels[0]));
    }
    var setHandler = function(e){suilib.calendar.setDate(e, div, calDate)};
    var overHandler = function(e) {
      var cell = (e.target || e.srcElement);
      if(cell.innerHTML!=' ') {
        cell.parentNode.className = 'SUI_cal_row_hover';
        if(cell.className!='SUI_cal_cell_current' && cell.className!='SUI_cal_cell_inactive') cell.className = 'SUI_cal_cell_hover';
      } else cell.style.cursor = 'default';
    }
    var outHandler = function(e) {
      var cell = (e.target || e.srcElement);
      if(!$(cell.parentNode).isa('tr')) return null;
      cell.parentNode.className = 'SUI_cal_row';
      if(cell.className!='SUI_cal_cell_current' && cell.className!='SUI_cal_cell_inactive') cell.className = '';
    }
    var grid = function() {
    for(var i=0; i<weeksCount; i++) {
      row = table.appendChild(document.createElement('tr'));
      row.className = 'SUI_cal_row';
      for(var j=0; j<7; j++) {
        if(i==0 && j==firstDay) flag = true;
          cell = document.createElement('td');
          cell.appendChild(document.createTextNode(flag ? num++ : ' '));
          row.appendChild(cell);
          if(flag) {
            setHandler.$('click', cell);
          } else cell.className = 'SUI_cal_cell_inactive';
        if(flag && (num-1)==nowDay) cell.className = 'SUI_cal_cell_current';
          if(i==(weeksCount-1) && j==lastDay) {
            if(num!==days && num-1!==days && num<days) i--;
            else flag = false;
          }
      }
      if(num>days) {flag = false; i++}
      overHandler.$('mouseover', row);
      outHandler.$('mouseout', row);
    }};
    if(init) (function(){grid.apply(self, [])}).$('suilibLoaded');
    else grid();
    // Удаляем старую таблицу и показываем новую
    if(dch[0]) {
      dch[0] = $(dch[0]);
      dch[0].hide();
      dch[0].removeChilds();
      dch[0].removeElement();
    }
    $(div.getChilds()[0]).show();
  },

  /*
    +/- месяц
  */
  stepMonth: function(e, step, div, calDate) {
    e.cancelBubble = true;
    e.returnValue  = false;
    if(e.preventDefault) e.preventDefault();
    var setYear   = calDate.getFullYear();
    var setMonth  = calDate.getMonth()+step;
    if(setMonth > 11) {
      setMonth  = 0;
      setYear++;
    }
    if(setMonth < 0) {
      setMonth  = 11;
      setYear--;
    }
    suilib.calendar.draw(div, new Date(setYear, setMonth, 1));
    div.reDraw = true;
  },

  /*
    Смена месяца
  */
  changeMonth: function(e, div, calDate) {
    var sel = e.target || e.srcElement;
    calDate.setMonth(sel.value);
    $(sel.linkedlink).show();
    $(sel).removeElement();
    suilib.calendar.draw(div, new Date(calDate.getTime()));
    div.reDraw = true;
  },

  /*
    Смена года
  */
  changeYear: function(e, div, calDate) {
    var sel = e.target || e.srcElement;
    calDate.setYear(sel.value);
    $(sel.linkedlink).show();
    $(sel).removeElement();
    suilib.calendar.draw(div, new Date(calDate.getTime()));
    div.reDraw = true;
  },

  /*
    Показывает список месяцев
  */
  showMonths: function(e, div, calDate) {
    e.cancelBubble = true;
    e.returnValue  = false;
    if(e.preventDefault) e.preventDefault();
    if(e.stopPropagation) e.stopPropagation();
    var lnk = e.target || e.srcElement;
    var sel = lnk.parentNode.appendChild(document.createElement('select'));
    sel.className = 'SUI_cal_monthSel';
    var months = calDate.getRuLabel('M', true);
    var nowMonth = calDate.getMonth(); var opt = {}
    for(var i=0,l=months.length; i<l; i++) {
      opt = sel.appendChild(document.createElement('option'));
      opt.appendChild(document.createTextNode(months[i]));
      opt.setAttribute('value', i);
      if(i==nowMonth) sel.options[i].selected = true;
    }
    (function(e){suilib.calendar.changeMonth(e, div, calDate)}).$('change', sel);
    (function(e){e.cancelBubble = true;if(e.preventDefault) e.preventDefault()}).$('click', sel);
    Object.extend(sel, {linkedlink:lnk});
    lnk.parentNode.insertBefore(sel, lnk);
    $(lnk).hide();
  },

  /*
    Показывает список годов
  */
  showYears: function(e, div, calDate) {
    e.cancelBubble = true;
    e.returnValue  = false;
    if(e.preventDefault) e.preventDefault();
    if(e.stopPropagation) e.stopPropagation();
    var lnk = e.target || e.srcElement;
    var sel = lnk.parentNode.appendChild(document.createElement('select'));
    sel.className = 'SUI_cal_yearSel';
    var nowYear = calDate.getFullYear(); var opt = {}
    for(var i=nowYear-10,j=0; i<=nowYear+10; i++,j++) {
      opt = sel.appendChild(document.createElement('option'));
      $(opt).appendChild(document.createTextNode(i));
      opt.setAttribute('value', i); // a specially for IE donkey =)
      if(i==nowYear) sel.options[j].selected = true;
    }
    (function(e){suilib.calendar.changeYear(e, div, calDate)}).$('change', sel);
    (function(e){e.cancelBubble = true;if(e.preventDefault) e.preventDefault()}).$('click', sel);
    Object.extend(sel, {linkedlink:lnk});
    $(lnk).hide();
  },

  /*
    Выбор даты
  */
  setDate: function(e, div, calDate, undo) {
    var date   = parseInt((e.target || e.srcElement).innerHTML, 10);
    var dest   = div.CDestination;
    var format = div.CDateFormat;
    var output = ''; var backup = [e, div, new Date(div.CDate.getTime()), true];
    if(!undo) calDate.setDate(date); var chr = '';
    div.CDate  = new Date(calDate.getTime());
    div.reDraw = true;
    for(var i=0,l=format.length; i<l; i++) { // формат вывода
      switch(format.charAt(i)) {
        case 'a': // ante meridiem или post meridiem в нижнем регистре
          chr = calDate.getHours();
          if(chr > 12) chr = 'pm'; else chr = 'am';
        break;
        case 'A': // ante meridiem или post meridiem в верхнем регистре
          chr = calDate.getHours();
          if(chr > 12) chr = 'PM'; else chr = 'AM';
        break;
        case 'd': // день месяца, 2 цифры с ведущими нулями
          chr = calDate.getDate().toString();
          if(chr.length==1) chr = '0'+chr;
        break;
        case 'D': // сокращенное наименование дня недели, 3 символа
          chr = calDate.getRuLabel('sDE');
        break;
        case 'F': // полное наименование месяца, например January или March
          chr = calDate.getRuLabel('ME');
        break;
        case 'g': // часы в 12-часовом формате без ведущих нулей
          chr = calDate.getHours();
        if(chr > 12) chr -= 12;
        break;
        case 'G': // часы в 24-часовом формате без ведущих нулей
          chr = calDate.getHours();
        break;
        case 'h': // часы в 12-часовом формате с ведущими нулями
          chr = calDate.getHours();
          if(chr > 12) chr -= 12;
          if(chr.toString().length==1) chr = '0'+chr;
        break;
        case 'H': // часы в 24-часовом формате с ведущими нулями
          chr = calDate.getHours().toString();
          if(chr.length==1) chr = '0'+chr;
        break;
        case 'i': // минуты с ведущими нулями
          chr = calDate.getMinutes().toString();
          if(chr.length==1) chr = '0'+chr;
        break;
        case 'j': // день месяца без ведущих нулей
          chr = calDate.getDate();
        break;
        case 'l': // полное наименование дня недели
          chr = calDate.getRuLabel('DE');
        break;
        case 'L': // признак високосного года
          chr = calDate.isLeapYear() ? 1 : 0;
        break;
        case 'm': // порядковый номер месяца с ведущими нулями
          chr = (calDate.getMonth()+1).toString();
          if(chr.length==1) chr = '0'+chr;
        break;
        case 'M': // сокращенное наименование месяца, 3 символа
          chr = calDate.getRuLabel('sME');
        break;
        case 'n': // порядковый номер месяца без ведущих нулей
          chr = calDate.getMonth();
        break;
        case 'r': // дата в формате RFC 2822 (на самом деле здесь разные браузеры возвращают несколько различные значения, поэтому не рекомендуется ее использовать)
          chr = calDate.toString();
        break;
        case 's': // секунды с ведущими нулями
          chr = calDate.getSeconds().toString();
          if(chr.length==1) chr = '0'+chr;
        break;
        case 't': // количество дней в месяце
          chr = calDate.getDaysInMonth();
        break;
        case 'U': // количество секунд, прошедших с начала Эпохи Unix (The Unix Epoch, 1 января 1970, 00:00:00 GMT)
          chr = Math.fix(calDate.getTime()/1000, 0);
        break;
        case 'w': // порядковый номер дня недели
          chr = calDate.getDay();
        break;
        case 'Y': // порядковый номер года, 4 цифры
          chr = calDate.getFullYear();
        break;
        case 'y': // номер года, 2 цифры
          chr = calDate.getFullYear().toString();
          chr = chr.charAt(2)+chr.charAt(3);
        break;
        case 'z': // порядковый номер дня в году (нумерация с 0)
        break;
        default: chr = format.charAt(i);
      }
      output += chr; chr = '';
    }
    try {
    if(typeof dest.value=='undefined') dest.innerHTML = output;
    else dest.value = output;} catch(e) {}
    if(!undo && suilib.calendar.changehandler) suilib.calendar.changehandler(dest, backup);
    if(!undo && div.change) div.change(dest, backup);
  }
}});
/*

    Интерфейс drag'n'drop-объектов

    @version $Id$

*/

Object.extend(suilib, {
drag:{
  //---------------------------------------------------------------------------
  // init(args)
  //---------------------------------------------------------------------------
  init: function(args)
  {
    if( !arguments.callee.initialized )
    {
      if( !args )
        args = {};

      arguments.callee.initialized = true;

      // document
      this.doc = args.doc ? args.doc : document;
      // dockable&draggable nodes
      this.nodes = {};
      // dragged node
      this.dragged_node = null;
      // target node
      this.target_node = null;
      // marker
      this.marker = null;
      // is_ie?
      this.is_ie = suilib.UserAgent.isMSIE;
      this.is_ie6 = suilib.UserAgent.isMSIE && !suilib.UserAgent.isMSIE7 && !suilib.UserAgent.isMSIE8;

      // т.к. IE не поддерживает DOM 3 Events model, для него используем костыли
      if( !this.is_ie )
      {
        // event listeners
        var this_ = this;
        this.doc.body.addEventListener('mousedown', function(e){ this_._drag_start.apply(this_, [e]); }, true);
        this.doc.body.addEventListener('mouseup', function(e){ this_._drag_stop.apply(this_, [e]); }, true);
        this.doc.body.addEventListener('mousemove', function(e){ this_._drag_move.apply(this_, [e]); }, true);
      }

      // draggable elements
      if( args && args.draggable )
        for( var i = 0; i < args.draggable.length; i++ )
          this.make_draggable(args.draggable[i].node, args.draggable[i].ondrop, args.draggable[i].build_marker ? args.draggable[i].build_marker : null);
      // dockable elements
      if( args && args.dockable )
        for( var i = 0; i < args.dockable.length; i++ )
          this.make_dockable(args.dockable[i].node, args.dockable[i].ondragover ? args.dockable[i].ondragover : null);
    }
  },
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // make_draggable(node, ondrop)
  //---------------------------------------------------------------------------
  make_draggable: function(node, ondrop, build_marker)
  {
    var node_id = $(node).getAttribute('id');
    if( !this.nodes[node_id] )
      this.nodes[node_id] = {};
    this.nodes[node_id].node = $(node);
    this.nodes[node_id].is_draggable = true;
    this.nodes[node_id].ondrop = ondrop;
    this.nodes[node_id].build_marker = build_marker ? build_marker : this._build_marker;

    // костыль для IE
    if( this.is_ie )
    {
      var this_ = this;
      (function(e){ this_._drag_start.apply(this_, [e]); }).$('mousedown', node);
    }
  },
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // make_dockable(node)
  //---------------------------------------------------------------------------
  make_dockable: function(node, ondragover)
  {
    var node_id = $(node).getAttribute('id');
    if( !this.nodes[node_id] )
      this.nodes[node_id] = {};
    this.nodes[node_id].node = $(node);
    this.nodes[node_id].is_dockable = true;
    this.nodes[node_id].ondragover = ondragover ? ondragover : null;

    if( this.is_ie )
    {
      var this_ = this;
      (function(e){ this_._drag_stop.apply(this_, [e]); }).$('mouseup', node);
    }
  },
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // _build_marker
  // ф-ия возвращает html элемент, который будет отображаться рядом с курсором в момент перетаскивания
  //---------------------------------------------------------------------------
  _build_marker: function(node)
  {
    // костыль для 6го осла
    var position = this.is_ie6 ? 'absolute' : 'fixed';
    var marker = $(this.doc.body).add('div', {'class': 'SUI_draggable', 'style': 'position: '+position+'; z-index: 200;'}, [
          node.cloneNode(true)
        ]);

    marker.childNodes[0].removeAttribute('id');
    return marker;
  },
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // _drag_start(e)
  //---------------------------------------------------------------------------
  _drag_start: function(e)
  {
    // release nodes
    if( this.dragged_node )
    {
      this._release_nodes();
    }

    var activator = $(e.target || e.srcElement);
    activator_id = activator.getAttribute ? activator.getAttribute('id') : 0;
    if( this.nodes[activator_id] && this.nodes[activator_id].is_draggable )
    {
      // prevent bubbling
      if( e.stopPropagation )
        e.stopPropagation();
      e.cancelBubble = true;
      // prevent executing
      if( e.preventDefault )
        e.preventDefault();
      e.returnValue  = false;

      // костыль для IE
      if( this.is_ie )
      {
        activator.setCapture();
        if( !this.nodes[activator_id].ie_move_event )
        {
          var this_ = this;
          this.nodes[activator_id].ie_move_event = (function(e){ this_._drag_move.apply(this_, [e]); });
          this.nodes[activator_id].ie_move_event.$('mousemove', activator);
        }
      }

      // node
      this.dragged_node = activator;
      // highlight dragged node
      this.dragged_node.classAdd('SUI_dragged');
    }
  },
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // _drag_stop(e)
  //---------------------------------------------------------------------------
  _drag_stop: function(e)
  {
    if( this.dragged_node )
    {
      // prevent bubbling
      if( e.stopPropagation )
        e.stopPropagation();
      e.cancelBubble = true;
      // prevent executing
      if( e.preventDefault )
        e.preventDefault();
      e.returnValue  = false;

      var activator = $(e.target || e.srcElement);
      activator_id = activator.getAttribute('id');

      if( this.target_node )
        this._drag_over(this.target_node, false);
      // user-defined callback
      if( this.nodes[activator_id] && this.nodes[activator_id].is_dockable && activator != this.dragged_node )
        this.nodes[this.dragged_node.getAttribute('id')].ondrop(this.dragged_node, activator);

      // release nodes
      this._release_nodes();
    }
  },
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // _drag_move(e)
  //---------------------------------------------------------------------------
  _drag_move: function(e)
  {
    if( !this.dragged_node )
      return;

    // prevent bubbling
    if( e.stopPropagation )
      e.stopPropagation();
    e.cancelBubble = true;

    var activator = $(e.target || e.srcElement);

    var activator_id = activator.getAttribute('id');
    var drag_id = this.dragged_node.getAttribute('id');

    if( !this.marker )
      this.marker = this.nodes[drag_id].build_marker.apply(this, [this.dragged_node]);

    // move marker to cursor's position
    if( this.is_ie6 ) // костыль для 6го осла
    {
      var scrlX = this.doc.documentElement.scrollLeft + this.doc.body.scrollLeft;
      var scrlY = this.doc.documentElement.scrollTop  + this.doc.body.scrollTop;

      this.marker.style.left = (e.pageX ? e.clientX : e.x+scrlX)+2+'px';
      this.marker.style.top  = (e.pageY ? e.clientY : e.y+scrlY)+2+'px';
    }
    else
    {
      this.marker.style.left = e.clientX+2+'px';
      this.marker.style.top  = e.clientY+2+'px';
    }

    // update current target if activator is dockable
    if( this.nodes[activator_id] && this.nodes[activator_id].is_dockable && activator != this.dragged_node )
    {
      // release previous target node
      if( this.target_node && this.target_node != activator )
        this._drag_over(this.target_node, false);

      // choose current target node and highlight it
      this.target_node = activator;
      this._drag_over(this.target_node, true);
    }
    else // release target node
    {
      if( this.target_node && activator != this.marker && activator.parentNode != this.marker )
      {
        this._drag_over(this.target_node, false);
      }
    }
  },
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // _drag_over(node, state)
  // в зависимости от значения state ф-ия либо отмечает node элемент,
  // над которым перетаскивают this.dragged_node элемент, либо снимает выделение с него
  //---------------------------------------------------------------------------
  _drag_over: function(node, state)
  {
    // если элемент перетаскивается над родителем, то ничего не делать
    if( node == this.dragged_node.parentNode )
      return;

    var src_id = this.dragged_node.getAttribute('id');
    var dst_id = node.getAttribute('id');

    if( state )
    {
      if( this.nodes[dst_id].drag_over_marked )
        return;

      this.nodes[dst_id].drag_over_marked = true;

      // если задан обработчик, то используем его, иначе дефолтное действие
      if( this.nodes[dst_id].ondragover )
        this.nodes[dst_id].ondragover(this.dragged_node, node, state);
      else
        node.classAdd('SUI_draggable_target');
    }
    else
    {
      if( !this.nodes[dst_id].drag_over_marked )
        return;

      this.nodes[dst_id].drag_over_marked = false;

      // если задан обработчик, то используем его, иначе дефолтное действие
      if( this.nodes[dst_id].ondragover )
        this.nodes[dst_id].ondragover(this.dragged_node, node, state);
      else
        node.classRemove('SUI_draggable_target');
    }
  },
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // _release_nodes
  // ф-ия возвращает в исходное состояние используемые модулем html элементы
  //---------------------------------------------------------------------------
  _release_nodes: function()
  {
    // remove highlight from dragged node
    if( this.dragged_node )
      this.dragged_node.classRemove('SUI_dragged');
    // remove highlight from target node
    if( this.target_node )
      this._drag_over(this.target_node, false);

    // костыль для IE
    if( this.dragged_node && this.is_ie )
    {
      this.dragged_node.releaseCapture();
      this.nodes[this.dragged_node.getAttribute('id')].ie_move_event.$un('mousemove', this.dragged_node);
      this.nodes[this.dragged_node.getAttribute('id')].ie_move_event = null;
    }

    // dragged node
    this.dragged_node = null;
    // target node
    this.target_node = null;
    // marker
    if( this.marker )
      this.marker.remove(true);
    this.marker = null;
  }
  //---------------------------------------------------------------------------
}});
/*

    Визуальный редактор

    @version $Id$

*/

Object.extend(suilib, {
editor:{
  init: function(args) {
    if(!document.designMode) {
      alert('Визуальное редактирование невозможно!\nСлишком старая версия браузера.');
      return false;
    }
    this.isGecko = navigator.userAgent.toLowerCase().indexOf("gecko") != -1;
    if(!this.outStyle)   this.outStyle = args.ost   || false;
    if(!this.baseURL)    this.baseURL  = args.base  || false;
    if(!this.imgPath)    this.imgPath  = args.ipt   || 'editor/';
    if(!this.codemirror) this.codemirror = args.cm  || false;
    if(args.save)        this.save   = args.save;
    if(args.saveapply)   this.saveapply = args.saveapply;
    if(args.apply)       this.apply  = args.apply;
    if(args.change)      this.change = args.change;
    if(args.oncreate)    this.oncreate   = args.oncreate;
    if(args.builder)     this.selbuilder = args.builder;
    if(args.idl)
      for(var i=0,l=args.idl.length,ae=args.exclude; i<l; i++) {
        this.createInstance($(args.idl[i]), i, (ae && ae[i] ? ae[i] : []));
      }
    var cst = '', chk = false, hash = [];
    if(args.onfly)
      for(var i=0,l=args.onfly.length,aos=args.onfly.styles,aoc=args.onfly.checks; i<l; i++) {
        if(aos && aos[i]) cst = aos[i];
        if(aoc && aoc[i]) chk = aoc[i];
        hash.push({cls:args.onfly[i], chk:chk, cst:cst, type:'createOnFlyEditing'}); cst = 0; chk = 0;
      }
    if(args.selectors)
      for(var i=0,l=args.selectors.length,ass=args.selectors.styles; i<l; i++) {
        if(ass && ass[i]) cst = ass[i];
        hash.push({cls:args.selectors[i], cst:cst, type:'createOnFlySelector'}); cst = 0;
      }
    var els = ((args.onfly && args.onfly.length) || (args.selectors && args.selectors.length)) ? (args.rootFilter || document).getElementsByTagName(args.tagFilter || '*') : [];
    for(var i=0, len=els.length; i<len; i++) {
      if(!els[i].className) continue;
      for(var j=0,l=hash.length; j<l; j++)
        if(els[i].className.split(' ').hasa(hash[j].cls)!==false)
          this[hash[j].type](els[i], hash[j].cls, hash[j].cst, (hash[j].type == 'createOnFlyEditing' ? hash[j].chk : null));
    }
    var self = this;
    this.$inputs = [];
    (function(e) {
      var unc = !!(e.type=='mousemove')
      if(['SUI_editor_selector', 'SUI_editor_onfly'].hasa((e.target || e.srcElement).className)!==false) return null
      self.$inputs.walkwith(function(el, idx){
        if(!el) return null
        if(unc && el.$ofNoClose) return null
        if(el.nextSibling) {
          $(el.nextSibling).show();
          $(el).removeElement()
        } else self.$inputs.splice(idx, 1)
      })
    }).$('click',     (suilib.UserAgent.isMSIE ? document.body : window))
      .$('mousemove', (suilib.UserAgent.isMSIE ? document.body : window));
  },

  fields : {},
  places : {},
  areas  : {},
  mirrors: {},
  press  : {},
  windows: {},
  currentState: 'editor',

  /*
    Доступные команды
  */
  handlers: [
    ['Жирный', 'bold.gif', 'bold', 'data:image/gif;base64,R0lGODlhFAAUAJAAAE1NTQAAACH5BAEAAAEALAAAAAAUABQAAAIkjI+py+0PowQ0VArezVXzH2GYZI2TmEFbqYJdM24pSdf2jdsFADs='],
    ['Курсив', 'italic.gif', 'italic', 'data:image/gif;base64,R0lGODlhFAAUAJAAAE1NTQAAACH5BAEAAAEALAAAAAAUABQAAAIljI+py+0PozSgAlphDvtZfkVZ51mhGJLNh2lnu7KgOtX2jedTAQA7'],
    ['Подчеркнутый', 'underline.gif', 'underline', 'data:image/gif;base64,R0lGODlhFAAUAJAAAE1NTQAAACH5BAEAAAEALAAAAAAUABQAAAIkjI+py+0PowQUhGofPRv2m2nh53xkiYUSuHKqh7VrGsv2jT8FADs='],
    ['По левому краю', 'left.gif', 'aleft', 'data:image/gif;base64,R0lGODlhFAAUAJABAAAAAAEBASH5BAEAAAEALAAAAAAUABQAAAIejI+py+0PE5i01hitxTzoD3QOOIkZeZkLqrbuCxsFADs='],
    ['По центру', 'center.gif', 'acenter', 'data:image/gif;base64,R0lGODlhFAAUAJABAAAAAAEBASH5BAEAAAEALAAAAAAUABQAAAIdjI+py+0PE5i01oiDtTnuD3QQOIkPyZkNqrbuCxcAOw=='],
    ['По правому краю', 'right.gif', 'aright', 'data:image/gif;base64,R0lGODlhFAAUAJABAAAAAAEBASH5BAEAAAEALAAAAAAUABQAAAIdjI+py+0PE5i01oiPtfntD3QYOIkNyZkeqbbu6xYAOw=='],
    ['По ширине', 'full.gif', 'afull', 'data:image/gif;base64,R0lGODlhFAAUAIAAAAAAAP///yH5BAUUAAEALAAAAAAUABQAAAIejI+py+0PE5i01hitphju3T2fFjqjVTbnlbbuCxsFADs='],
    '/',
    ['Вставить ссылку', 'link.gif', 'link', 'data:image/gif;base64,R0lGODlhFAAUAMMFABcvTHSMosfLz0JTb6Szyfb8/m55j4aYrtDf9LK7zZOjtVNjfczS37LH4penxAAAACH5BAEAAA8ALAAAAAAUABQAAARc8MlJq7046827/xOTOIojPCKpJJaIFEUTEMkbByxVK8NC/A1CT0EwVByFgSABKyAQBoECMagQGIqAAsAFDLQEx6KCrTEOC8UKcU5bBOiBgfCAL+QKkH7P7/v/GxEAOw=='],
    ['Убрать ссылку', 'unlink.gif', 'unlink', 'data:image/gif;base64,R0lGODlhFAAUAMMEADZLbYOWq7vCzmh9mfn8/kNhgaq3ys7OztLf8lNkfY+iuFJykpunub3K4tTW2AAAACH5BAEAAA8ALAAAAAAUABQAAARr8MlJq732FCyL65Kzcd23iSS1rWl7OQKjMEM4zILlGAhBLB/HwNcIGCo8BSDxeSwSS4ahRmEQAIfLQYEAIB2KG8D7ECoMikRly2sAggtEMcHIBBKeTgE/qLv+Ex4sLnknIyR5DyMogI2OjhEAOw=='],
    '/',
    ['Вставить/убрать нумерованный список', 'numlist.gif', 'numlist', 'data:image/gif;base64,R0lGODlhFAAUAKIAANLY6Ky50YaaylJ810puvTxZmgICAv///yH5BAUUAAcALAAAAAAUABQAAAM1eLrc/jBKCMZ8gyzDe3cAEVwNURRkKg2DoC4Beni0E4jvYcp5z2q5wWhG+zgEvJRp2Gs6VQkAOw=='],
    ['Вставить/убрать маркированный список', 'bullist.gif', 'bullist', 'data:image/gif;base64,R0lGODlhFAAUAKIAALK70H+QvFKC12J6oiI6giIycgICAv///yH5BAUUAAcALAAAAAAUABQAAAMweLrc/jBKCAKYLgiijP/eAxABZp7oUl2pxh0gKJJpbTvAwKKDUHSxEK5QuhmPyEkCADs='],
    '/',
    ['Вставить картинку', 'image.gif', 'image', 'data:image/gif;base64,R0lGODlhFAAUAMMAAP///5zO9GaZAJmZmZzOFeDg4CVjAACZAJw4KjMzMwEAAQAAAAAAAAAAAAAAAAAAACH5BAEAAAoALAAAAAAUABQAAARvUMlJq734gs27r0AgjuQIgKUQCAN5UqGoEoRgF+I7xQLtG6ocauUjGA4uVNBnOwphgYKNEDgIrAJDQSfZ2G6HAqJg3YC8AIQVYeucO4iExwwr0hIIO1cB+NrYbH57AAdHhoWIR4NzjHsZj5CRkhIRADs='],
    ['Классы',  'classes.gif', 'classes', 'data:image/gif;base64,R0lGODlhFAAUAMQAAP+cnHPGQv9jYxCU9wicAP85MQBr5wBrzgh7AOcxMRBzCABjzsYxMaUxMQBKAAg5e////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAUUABAALAAAAAAUABQAAAVjICSOZGmeaKquo+K+76oEdB04ckDsO4KrM17vZzqIgkLf6TB4QJA8ZYlpWDwEhWyUKKIaDAIAtsBAmLnMhTo8zjYccNLhQb+23azCPdHIZ7MJfCwQf4F9gxAMDA2HiI6PkCMhADs='],
    '/',
    ['HTML / Visual', 'code.gif', 'code', 'data:image/gif;base64,R0lGODlhFAAUALIDACFChCFSpUJzxl6O0AAAAAAAAAAAAAAAACH5BAEAAAQALAAAAAAUABQAAAMzSLrc/jDKSau9uAG1gydCGBIDsxFnoAhgWy5AnK4t+3I4odaume+sIGlwyxiPyKRyaUwAADs='],
    ['Codepress HTML / Visual',  'codepress.gif', 'codep', 'data:image/gif;base64,R0lGODlhFAAUAKIAAODRwbKysl6O0EJzxiFSpSFChP///wAAACH5BAUUAAYALAAAAAAUABQAAANSaLrc/jBKGaoNUwXAec2bBYTT1o2WUyhFQLzBIMuGwKxGCxDcAPiD2q1A3BAqg9hPuMDpeL9o0NZkGZHKqYDKMJ08FNRlFP6CI5c0JsNuu9/tBAA7'],
    ['Codemirror HTML / Visual', 'codemirror.gif', 'codem', 'data:image/gif;base64,R0lGODlhFAAUANUAAP//////+/z7+/r5+/Pz8uvq7ejo6efo6Obk5+Tj4uDh5N/f4tza2dna2drY19rY3tjZ2NnX2dXW1dbU1tXT1c7MzM/MzsrKzMfHx8bGyMTExcPDw8PBv7+/vbu7vLm6uLm4urm3uLa3uLS0tLOys7GysaampqWjpKKjpJmZmW6Z1Y+Pj1WBzDdjrjdVkP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAUUAC8ALAAAAAAUABQAAAaGwJdwSCwaj8ikcslEYkyrqAnDHKU0B8BBkxopMSkIABAQCCYpatEldGlacAJrPn+piOyX6zBoFRAsEiwLLHZ4LogABi0PFCwbLAKFd0N5LgkKLRccLCQsDJN4bR0ILSAlLCgsIZMqlENgFQ4eJyQWGWlKVh8NAhEiXUxPUStTTcfIycrLx0EAOw=='],
  ],

  /*
    Доступные css-классы
  */
  classes: {
    tags: ['img', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'b', 'i', 'u', 'span'],
    classes: []
  },

  /*
    Описания стандартных классов
  */
  classTitles: {
    '^zero$':'Для <table>. Убирает все границы, отступы и расстояния между ячейками',
    '^bord$':'Для <table> (вместе с zero). Задает границы шириной в 1px',
    '^bb$':'Для строчных. Выделяет текст жирным',
    '^m([0-9]+)$':'Для блочных. Задает отступ снизу на $1px',
    '^s([0-9]+)$':'Для любых. Устанавливает размер шрифта в $1px',
    '^z([0-9]+)$':'Для <table> (вместе с zero). Задает отступы в ячейках на $1px',
    '^hr([0-9]{0,})$':'Для <div>. Рисует линейку',
    '^mrk([0-9]+)$':'Для блочных. Рисует маркер',
    '^inp$':'Для <input>. Оформляет поля ввода под дизайн сайта',
    '^srch$':'Для <input>. Оформляет поле ввода как поиск в шапке',
    '^left$':'Для <img>. Выравнивает по левому краю с обтеканием справа',
    '^right$':'Для <img>. Выравнивает по правому краю с обтеканием слева'
  },

  /*
    Метод управления классами
  */
  classChange: function(cls, set) {
    if(!arguments.callee.objlink) {
      alert('Целевой объект не определен!');
      return null;
    }
    var obj = $(arguments.callee.objlink);
    if(set) obj.classAdd(cls);
    else obj.classRemove(cls);
  },

  /*
    Запоминает последний кликнутый объект
  */
  clickListener: function(e, tn) {
    var fn = arguments.callee;
    if(fn.mutex) return null
    fn.mutex = true;
    if(!fn.lastTarget) fn.lastTarget = [];
    fn.lastTarget[tn] = (e.target || e.srcElement);
    var hint = $('suilib_editor_curel_'+tn);
    if(hint) hint.innerHTML = (e.target || e.srcElement).tagName.toLowerCase();
    fn.mutex = false;
  },

  /*
    Создает редактор
  */
  createInstance: function(ta, tn, exc) {
    var self = this; if(!ta) {
      alert("mod_editor: объект не является текстовым полем!");
      return null;
    }
    if(!ta.getAttribute('name')) ta.setAttribute('name', 'autonamefortextarea_'+tn);
    if(!ta.getAttribute('id'))   ta.setAttribute('id',   'autoidfortextarea_'+tn);
    ta.classAdd('code');
    var origin = ta.value;
    var div = document.createElement('div');
    div.style.position = 'relative';
    div.style.border = 'none';
    var ifr = document.createElement('iframe');
    ifr.className = ta.className;
    ifr.setAttribute('scrolling', 'auto');
    ifr.setAttribute('frameborder', '0');
    ifr.setAttribute('src', 'javascript:void(0)');
    ifr.setAttribute('width', ta.style.width);
    ifr.setAttribute('height', ta.style.height || ta.offsetHeight || ta.offsetParent);
    ifr.setAttribute('id', 'suilibeditoriframe_'+tn);
    ifr.setAttribute('name', 'suilibeditoriframe_'+tn);
    ta.style.display = 'none';
    div.appendChild(ifr);
    ta.parentNode.insertBefore(div, ta);
    ifr = this.isGecko ? document.getElementById('suilibeditoriframe_'+tn) : window.frames['suilibeditoriframe_'+tn];
    var ihtml = '<html><head>';
    if(this.baseURL) {
      ihtml += '<base href="'+this.baseURL+'" />';
    }
    if(this.outStyle) {
      ihtml += '<link rel="stylesheet" href="'+this.outStyle+'" />';
      ihtml += '<style type="text/css">';
      ihtml += 'body { background:#FFFFFF; color:#162B3F; }';
    } else {
      ihtml += '<style type="text/css">';
      ihtml += '* { font:12px Tahoma; margin:0; padding:0; }';
      ihtml += 'body { margin:5px; }';
    }
    ihtml += '</style>';
    ihtml += '</head><body style="margin:2px;border-width:0;">';
    ihtml += origin;
    ihtml += '</body></html>';
    var iwin = (this.isGecko) ? ifr.contentWindow : ifr.window;
    var idoc = (this.isGecko) ? ifr.contentDocument : ifr.document;
    this.fields[tn] = ta;
    this.places[tn] = div;
    this.areas[tn]  = idoc;
    this.windows[tn] = iwin;
    try {
      idoc.open(); idoc.write(ihtml); idoc.close();
    } catch(e) {}
    (function(ignore) {
      var idoc = self.render(tn), fn = arguments.callee;
      try {
        idoc.execCommand('useCSS', false, true);
        idoc.execCommand('LiveResize', false, true);
        idoc.execCommand('PlayImage', false, true);
      } catch(e) {}
      if(fn.toolbarCreated) return null;
      // Парсим CSS
      var styles = suilib.getFullStyle(null, null, true, idoc)[0];
      if(!styles.length) {
        setTimeout(function(){fn(true)}, 500);
        return null;
      }
      self.classes.classes[tn] = [];
      for( var i = 0, l = styles.length, scc = self.classes.classes; i < l; i++ )
        if( styles[i] && styles[i].match(/^\.[a-z]+[0-9]?$/i) )
          scc[tn].push(styles[i].replace(/\./, ''));
      self.createToolbar(div, idoc, iwin, tn, exc);
      fn.toolbarCreated = true;
    }).$('load', iwin).$('timeout', 500);
    this.obsup = function(){idoc.body.innerHTML=ta.value}
    this.obsdn = function(e) {
      var idoc = (e.target || e.srcElement)
      if(suilib.UserAgent.isMSIE && e.type=='keydown') return null;
      idoc     = idoc.document ? idoc.document : idoc.parentNode;
      var tn   = idoc.linkedID;
      var iwin = self.windows[tn];
      var bounds = self.getBounds(iwin);
      if(bounds && bounds.root) self.clickListener({target:bounds.root}, tn);
      var ta   = idoc.linkedArea;
      //ta.value = self.convert(idoc);
      // Сохраняем по Ctrl + Shift + S
      var type = suilib.UserAgent.isMSIE ? 'keyup' : 'keydown';
      if(((e.ctrlKey || e.ctrlLeft) && e.shiftKey) && ([83,115,1067,1099].hasa((e.keyCode || e.which))!==false)) {
        e.cancelBubble = true;
        if(e.preventDefault) e.preventDefault();
        if(e.type==type && self.save && self.save.apply) self.save(tn, idoc);
      }
      // Сохраняем по Ctrl + Shift + A
      if(((e.ctrlKey || e.ctrlLeft) && e.shiftKey) && ([97,65,1092,1060].hasa((e.keyCode || e.which))!==false)) {
        e.cancelBubble = true;
        if(e.preventDefault) e.preventDefault();
        if(e.type==type && self.saveapply && self.saveapply.apply) self.saveapply(tn, idoc);
        else if(e.type==type && self.save && self.save.apply) self.save(tn, idoc);
      }
    }; // fixme: в осле ну никак не получается отловить клик ни на одном элементе; еще это глючит в опере 9.52 (надо бы подождать релиз)
    ['click', 'mouseup', 'mousedown'].walkwith(function(evt){(function(e){self.clickListener.call(self, e, tn)}).$(evt, idoc)});
    idoc.listenersApplied = false;
    this.obsup.$('keyup', ta); this.obsup.$('keydown', ta); this.obsup.$('keypress', ta);
    this.observe = function(idoc, tn) {
    (function() {
      if(idoc.listenersApplied) return null;
      ['keyup', 'keydown', 'keypress'].walkwith(function(evt){self.obsdn.$(evt, idoc)});
      Object.extend(idoc, {linkedArea:ta, linkedID:tn});
      idoc.listenersApplied = true;
    }).$('load', iwin).$('timeout', 1000);
    }; this.observe(idoc, tn);
  },

  /*
    Преобразует всякие strong, em и прочую хню в нормальный код
  */
  convert: function(idoc) {
    var newtag = false;
    var els = idoc.getElementsByTagName('strong');
    for(var i=0,l=els.length; i<l; i++) {
      newtag = idoc.createElement('b');
      newtag.innerHTML = els[i].innerHTML;
      els[i].parentNode.insertBefore(newtag, els[i]);
      $(els[i]).remove();
    }
    var els = idoc.getElementsByTagName('em');
    for(var i=0,l=els.length; i<l; i++) {
      newtag = idoc.createElement('i');
      newtag.innerHTML = els[i].innerHTML;
      els[i].parentNode.insertBefore(newtag, els[i]);
      $(els[i]).remove();
    }
    var els = idoc.getElementsByTagName('p');
    for(var i=0,l=els.length; i<l; i++) {
      if(!els[i].getAttribute('align')) continue;
      newtag = idoc.createElement('div');
      newtag.innerHTML = els[i].innerHTML;
      els[i].parentNode.insertBefore(newtag, els[i]);
      $(els[i]).remove();
    }

    // Специфичные для разных браузеров фиксы
    if(suilib.UserAgent.isFirefox) {
      var els = idoc.getElementsByTagName('*');
      for(var i=0,len=els.length; i<len; i++) {
        var st = els[i].style;
        for(var j in st) if(j.substr(0, 3)=='Moz') st[j] = null;
      }
    }

    var html = idoc.body.innerHTML;

    return html;
  },

  /*
    Создает панель инструментов
  */
  createToolbar: function(div, idoc, iwin, tn, exc) {
    var self = this;
    var bt = false; var img = false;
    var clickHandler = function(e){self.execCommand((e.target || e.srcElement).getAttribute('command'), idoc, iwin, tn)};
    var overHandler = function(e){(e.target || e.srcElement).className='SUI_editor_btn_active'};
    var outHandler = function(e){(e.target || e.srcElement).className='SUI_editor_btn'};
    var useDirectImages = suilib.UserAgent.isMSIE;
    var separator_src = useDirectImages ? this.imgPath + 'separator.gif' : 'data:image/gif;base64,R0lGODlhAwAUALMAALCpjaqjhKmihKCYdp+XdZ6Wc5SLZZCHYoR8WoB4V4B4WHJrTmhiR////wAAAAAAACH5BAUUAA0ALAAAAAADABQAAAQZEITSqqRVkFPbMEn3hdUogp2BLJ2yMO3bRQA7';
    for(var i in this.handlers) {
      try {
        img = this.handlers[i];
        if(!(img instanceof Array)&&img!='/') continue;
        if(exc && exc.length && exc.hasa(img[2])!==false) continue;
        if(img[2]=='codep')
          if(!('CodePress' in window)) continue;
        else if(img[2]=='codem')
          if(!('CodeMirror' in window) || !('CodeMirrorConfig' in window)) continue;
        bt = new Image();
        if (img == '/') { bt.src = separator_src; bt.setAttribute('align', 'absmiddle'); bt.className = 'SUI_editor_btn'; bt.style.marginBottom = '3px'; div.insertBefore(bt, div.lastChild); continue; }
        bt.src = useDirectImages ? this.imgPath + img[1] : [img[3]];
        bt.setAttribute('alt', img[0]);
        bt.setAttribute('title', img[0]);
        bt.setAttribute('command', img[2]);
        bt.setAttribute('align', 'absmiddle');
        bt.className = 'SUI_editor_btn';
        bt.style.marginBottom = '3px';
        clickHandler.$('click', bt);
        bt.style.cursor = 'pointer';
        overHandler.$('mouseover', bt);
        outHandler.$('mouseout', bt);
        div.insertBefore(bt, div.lastChild);
        if(img[2]=='image') { // всплывающий слой для загрузки файлов
          var upl = document.createElement('div');
          Object.extend(upl, {linkedbt:bt})
          $(upl).setstyle('display:none;position:absolute;text-align:center');
          $(upl).className = 'SUI_editor_popup';
          var hd = document.createElement('div');
          hd.className = 'header';
          hd.style.marginBottom = '4px';
          hd.appendChild(document.createTextNode('Новая картинка'));
          upl.appendChild(hd);
          var fi = document.createElement('input');
          fi.setAttribute('type', 'file');
          fi.setAttribute('id', 'ffuplid_'+tn);
          fi.setAttribute('name', 'suilibfupl_'+tn);
          fi.style.margin = '4px';
          if(this.save) Object.extend(fi, {$muisavehandler:this.save});
          upl.appendChild(fi);
          upl.appendChild(document.createElement('br'));
          var si = document.createElement('input');
          si.setAttribute('type', 'button');
          si.setAttribute('value', 'Загрузить');
          if(suilib.UserAgent.isOpera) si.style.padding = '0 4px 0 4px';
          si.style.marginBottom = '4px';
          (function(){$(upl).hide();$(fi).$muisavehandler(tn, idoc)}).$('click', si);
          upl.appendChild(si);
          upl.appendChild(document.createTextNode(' '));
          var si = document.createElement('input');
          si.setAttribute('type', 'button');
          si.setAttribute('value', 'Отмена');
          if(suilib.UserAgent.isOpera) si.style.padding = '0 4px 0 4px';
          si.style.marginBottom = '4px';
          (function(){$(upl).hide()}).$('click', si);
          upl.appendChild(si);
          div.insertBefore(upl, div.lastChild);
        }
        if(img[2]=='classes') { // всплывающий слой для управления классами
          var handler = (function(e){
            var ch = (e.target || e.srcElement);

            var cls = ch.nextSibling.nextSibling.firstChild.nodeValue;
            self.classChange(cls, ch.checked);
          });
          var container = document.createElement('div');
          container.setAttribute('id', 'suilib_editor_classlayer_'+tn);
          Object.extend(container, {linkedbt:bt})
          $(container).setstyle('display:none;position:absolute;text-align:center');
          $(container).className = 'SUI_editor_popup';
          var hd = document.createElement('div');
          hd.className = 'header';
          hd.style.marginBottom = '4px';
          hd.appendChild(document.createTextNode('CSS классы элемента '));
          var chead = document.createElement('span');
          chead.setAttribute('id', 'suilib_editor_classheader_'+tn)
          hd.appendChild(chead);
          container.appendChild(hd);
          var cls = this.classes.classes[tn];
          var tbl = document.createElement('div');
          for(var j=0,l=cls.length; j<l; j++) {
            var uniqid = 'suilib_editor_classcheckbox_'+tn+'_'+j;
            var checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            checkbox.setAttribute('id', uniqid);
            var label = document.createElement('label')
            label.appendChild(document.createTextNode(cls[j]));
            label.setAttribute('for', uniqid);
            handler.$('change', checkbox);
            tbl.style.textAlign = 'left'; tbl.style.padding = '4px';
            var block = document.createElement('div');
            block.style.width = '60px'; block.style.styleFloat = 'left'; block.style.cssFloat = 'left'; block.style.marginBottom = '2px';
            block.appendChild(checkbox);
            block.appendChild(document.createTextNode(' '));
            block.appendChild(label); var tf = false;
            for(var t in this.classTitles) {
              var regexp  = new RegExp(t, '');
              var replace = this.classTitles[t];
              if(cls[j].match(regexp)) {
                block.setAttribute('title', cls[j].replace(regexp, replace));
                tf = true; break;
              }
            }
            if(!tf) block.setAttribute('title', 'Специфический класс, возможно задает цвет шрифта. Использовать осторожно!');
            if((j % 6)==0 && j) {
              var br = document.createElement('br');
              br.style.clear = 'both';
              tbl.appendChild(br);
            }
            tbl.appendChild(block);
          }
          var br = document.createElement('br');
          br.style.clear = 'both';
          tbl.appendChild(br);
          container.appendChild(tbl);
          var closebt = document.createElement('input');
          closebt.setAttribute('type',  'button');
          closebt.setAttribute('value', 'Закрыть');
          if(suilib.UserAgent.isOpera) closebt.style.padding = '0 4px 0 4px';
          closebt.style.marginBottom = '4px';
          (function(e){$(container).hide()}).$('click', closebt);
          container.appendChild(closebt);
          div.insertBefore(container, div.lastChild);
        }
      } catch(e) {}
    }
    bt = new Image(); bt.setAttribute('align', 'absmiddle');
    bt.src = separator_src; bt.className = 'SUI_editor_btn';
    bt.style.marginBottom = '3px'; div.insertBefore(bt, div.lastChild);
    div.insertBefore(document.createTextNode(' '), div.lastChild);
    var hint = $(document.createElement('span'));
    hint.classAdd('s11');
    hint.appendChild(document.createTextNode('['));
    bt = document.createElement('b');
    bt.innerHTML = '---';
    bt.setAttribute('id', 'suilib_editor_curel_'+tn);
    hint.appendChild(bt);
    hint.appendChild(document.createTextNode(']'));
    div.insertBefore(hint, div.lastChild);
    div.insertBefore(document.createElement('br'), div.lastChild);
  },

  /*
    Вставка изображения
  */
  pasteImage: function(isrc, tn, attr) {
    idoc = this.areas[tn];
    var im = idoc.createElement('img')
    im.setAttribute('src', isrc);
    //im.style.position = 'absolute';
    for(var i in attr) im.setAttribute(i, attr[i]);
    if(window.opera) {
      var moveimage = function(e) {
        var el = (e.target || e.srcElement);
        el.style.left = (e.pageX ? e.pageX : e.x)-5;
        el.style.top  = (e.pageY ? e.pageY : e.y)-5;
      }
      /*
        Сцуко, тупая Опера не хочет таскать картинки мышкой
        и грит фсякую хню, когда картинке пытаешься задать moveimage на onmousemove
        А точнее, она передает в хэндлер не объект event, а ссылку на саму функцию O_o
        Поэтому в Опере картинки таскаццо не будут... Может потом что придумаю...
        Сцуко, убивать разработчиков Оперы надо медленно и мучительно :-[
      */
    }
    idoc.body.appendChild(im);
    /*/ закрыл абсолютное позиционирование
    try {
      if(idoc.queryCommandSupported('2D-Position'))
      idoc.execCommand('2D-Position', false, true);
    } catch(e) {} //*/
    this.fields[tn].value=this.convert(idoc);
  },

  /*
    Выполнение команды
  */
  execCommand: function(comm, idoc, iwin, tn) {
    iwin.focus(); var d = iwin.document, cl = this.clickListener.lastTarget;
    var self = this, aobj = cl && cl[tn] ? $(cl[tn]) : {tagName:'',isa:function(){return false}};
    switch(comm) {
      case 'bold':
        d.execCommand('Bold', false, '');
      break;
      case 'italic':
        d.execCommand('Italic', false, '');
      break;
      case 'underline':
        d.execCommand('Underline', false, '');
      break;
      case 'aleft':
        d.execCommand('JustifyLeft', false, '');
      break;
      case 'acenter':
        d.execCommand('JustifyCenter', false, '');
      break;
      case 'aright':
        d.execCommand('JustifyRight', false, '');
      break;
      case 'afull':
        d.execCommand('JustifyFull', false, '');
      break;
      case 'link':
        var url = false;
        do { url = prompt('Введите URL:', 'http://'); } while (url == 'http://');
        if (url != 'http://') d.execCommand('Createlink', false, url);
      break;
      case 'unlink':
        d.execCommand('Unlink', false, '');
      break;
      case 'numlist':
        d.execCommand('InsertOrderedList', false, '');
      break;
      case 'bullist':
        d.execCommand('InsertUnorderedList', false, '');
      break;
      case 'image':
        var upl = $('ffuplid_'+tn).parentNode;
        var coords = $(upl.linkedbt).getoffset();
        $(upl).style.top = coords[1] + $(upl.linkedbt).offsetHeight + 'px';
        $(upl).style.left = coords[0] + 'px';
        $(upl).show();
      break;
      case 'classes':
        var tag = aobj.tagName.toLowerCase();
        if(this.classes.tags.hasa(tag)===false) alert('Недопустимый элемент!');
        else {
          this.classChange.objlink = aobj;
          var cont = $('suilib_editor_classlayer_'+tn), header = '';
          var coords = $(cont.linkedbt).getoffset();
          $(cont).style.top  = coords[1] + $(cont.linkedbt).offsetHeight + 'px';
          $(cont).style.left = coords[0] + 'px';
          var cls = this.classes.classes[tn];
          for(var j=0,l=cls.length; j<l; j++) {
            var uniqid = $('suilib_editor_classcheckbox_'+tn+'_'+j);
            uniqid.checked = !(aobj.className.split(' ').hasa(cls[j])===false);
          }
          header = tag;
          $('suilib_editor_classheader_'+tn).innerHTML = header;
          $(cont).show();
        }
      break;
      case 'code':
        $(this.fields[tn]).show();
        $(this.places[tn]).hide();
          this.fields[tn].focus();
          this.fields[tn].value = self.getContent(tn);
        self.currentState = 'html';
        (function(e){
          if(e.keyCode==27) {
          $(self.fields[tn]).hide();
          $(self.places[tn]).show();
            self.currentState = 'editor';
        }}).$('keydown', this.fields[tn]);
      break;
      case 'codep':
        var ta = $(this.fields[tn]); ta.show(); $(this.places[tn]).hide();
        if(this.press[tn]) {
          ta.disabled = true; ta.parentNode.insertBefore(this.press[tn], ta);
          try{this.press[tn].setCode(self.getContent(tn));}catch(e){} ta.hide();
          self.currentState = 'codepress'; self.focus(tn);
        } else {
        ta.classAdd('codepress'); $(ta).classAdd('php');
        ta.classAdd('linenumbers-on'); ta.classAdd('autocomplete-off');
        var editor = CodePress.create(ta, function(){
          $(self.fields[tn]).hide();
          $(self.places[tn]).show();
          self.currentState = 'editor';
          self.setContent(tn, editor.getCode());
          editor.parentNode.removeChild(editor);
          $(self.fields[tn]).disabled = false;
        }); 
        this.press[tn] = editor;
        self.currentState = 'codepress';
        }
      break;
      case 'codem':
        $(this.places[tn]).hide();
        if(this.mirrors[tn]) {
          $(this.fields[tn]).hide();
          $(this.mirrors[tn].win.frameElement).show();
          this.mirrors[tn].setCode(self.getContent(tn));
          self.currentState = 'codemirror'; self.focus(tn);
        } else {
          $(this.fields[tn]).show();
          var editor = new CodeMirror(function(frame){self.fields[tn].parentNode.insertBefore(frame, self.fields[tn])}, {
          parserfile: "parsexml.js",
          path: this.codemirror,
          stylesheet: this.codemirror+'css/xmlcolors.css',
          content: this.fields[tn].value,
          width:  $(this.fields[tn]).clientWidth +'px',
          height: $(this.fields[tn]).clientHeight +'px',
          escapeCallback: function(){
            $(self.fields[tn]).hide();
            $(self.places[tn]).show();
            self.currentState = 'editor';
            $(editor.win.frameElement).hide();
            self.setContent(tn, editor.getCode());
          } 
          });
          editor.win.frameElement.className = 'SUI_editor_area';
          this.mirrors[tn] = editor;
          $(this.fields[tn]).hide();
          self.currentState = 'codemirror';
        }
      break;
      default: alert('Неизвестная команда!');
    }
    this.fields[tn].value=this.convert(idoc);
  },

  getBounds: function(iwin) {
    var range, root, start, end;
    if(iwin.getSelection) {
      var selection = iwin.getSelection();
      range = selection.getRangeAt(0);
      start = range.startContainer;
      end = range.endContainer;
      root = range.commonAncestorContainer;
      if(start.nodeName.toLowerCase() == "body") return null;
      if(start.nodeType==3) start = start.parentNode;
      if(end.nodeType==3) end = end.parentNode;
      if(start == end) root = start
      return {
        range: range,
        root: root,
        start: start,
        end: end
      }
    } else if(iwin.document.selection) {
      range = iwin.document.selection.createRange();
      var r1 = range.duplicate();
      var r2 = range.duplicate();
      r1.collapse(true);
      r2.moveToElementText(r1.parentElement());
      r2.setEndPoint("EndToStart", r1);
      start = r1.parentElement();
      r1 = range.duplicate();
      r2 = range.duplicate();
      r2.collapse(false);
      r1.moveToElementText(r2.parentElement());
      r1.setEndPoint("StartToEnd", r2);
      end = r2.parentElement();
      root = range.parentElement();
      if(start == end) root = start;
      return {
        range: range,
        root: root,
        start: start,
        end: end
      }
    }
    return null;
  },

  /*
    Преобразует инлайновые выделения с заданным классом
    в динамически возникающие поля ввода
  */
  createOnFlyEditing: function(el, cls, cst, chk) {
    var self = this;
    el.style.cursor = 'pointer';
    el.className = 'SUI_editor_onfly';
    if(this.apply) Object.extend(el, {$muisavehandler:this.apply});
    (function(e) {
      e.cancelBubble = true;
      if(e.stopPropagation) e.stopPropagation();
      self.buildInput(e, cls, cst, chk); suilib.capturedClick = {pageX:e.pageX, pageY:e.pageY};
    }).$('mouseover', el);
  },

  /*
    Скрывает элемент и создает на его месте поле ввода
  */
  buildInput: function(e, cls, cst, chk) {
    var org = (e.target || e.srcElement);
    if(org.previousSibling &&
       org.previousSibling.className &&
       org.previousSibling.className=='SUI_editor_onfly_input') return false;
    var inp = document.createElement('input');
    suilib.editor.$inputs.push(inp);
    var iid = suilib.editor.$inputs.length - 1;
    inp.setAttribute('type', 'text');
    inp.setAttribute('value', org.innerHTML);
    inp.setAttribute('autocomplete', 'off');
    inp.className = 'SUI_editor_onfly_input';
    inp.style.fontFamily = $(org).getstyle('fontFamily');
    inp.style.fontSize = $(org).getstyle('fontSize');
    inp.style.padding = 0; if(cst) $(inp).setstyle(cst);
    org.parentNode.insertBefore(inp, org);
    (function(e) {
      var inp = (e.target || e.srcElement);
      if(inp.$ofNoClose) return null;
      $(org).show(); $(inp).removeElement();
      suilib.editor.$inputs.splice(iid, 1);
    }).$('mouseout', inp);
    (function(e) {
      var inp = (e.target || e.srcElement);
      e.cancelBubble = true;
      if(e.stopPropagation) e.stopPropagation();
      if(e.type=='click') {
        inp.$ofNoClose = true;
        inp.className = 'SUI_editor_onfly_input_fixed';
        if(chk) check(inp.value);
      }
    }).$('click', inp).$('mousemove', inp);
    $(org).hide(); inp.focus();
    if(this.oncreate) this.oncreate(cls, org, inp);
    if(chk) { // проверяем введенный текст регуляркой
      var rc = false, am = null;
      for(var t in chk) {
        var regexp  = new RegExp(t, '');
        if(chk[t]) am = chk[t]; }
    }    
    var check = function(it) {
      if(it && !it.match(regexp)) {
        inp.classAdd('SUI_editor_onfly_input_incorrect'); rc = true; }
      else rc = false;
    }

    var keyHandler = function(e) {
      var inp = (e.target || e.srcElement);
      inp.$ofNoClose = true;
      if(!e.ctrlKey && !e.altKey && !e.shiftKey)
      switch(e.keyCode) {
        case 27:
          $(org).show();
          $(inp).remove();
        break;

        case 10:
        case 13:
          var oldval = org.innerHTML;
          if(!inp.value || !inp.value.trim().length) return null;
          if(chk && rc) {
            if(am) { alert(am); inp.focus(); }
            return null; }
          org.innerHTML = inp.value;
          inp.value = '';
          $(org).show(); $(inp).remove();
          if(org.$muisavehandler) org.$muisavehandler(oldval, cls);
        break;
      }
    }
    keyHandler.$('keydown', inp);
    (function(e){ // для Оперы родимой, чтоб форму не отправляла
      inp.className = 'SUI_editor_onfly_input_fixed';
      if(chk) check(inp.value);
      if([10,13].hasa(e.keyCode)) {
        e.returnValue = false;
        if(e.preventDefault) e.preventDefault(); }
    }).$('keyup', inp).$('keypress', inp);
  },

  /*
    Преобразует инлайновые выделения с заданным классом
    в динамически возникающие селекторы
  */
  createOnFlySelector: function(el, cls, cst) {
    var self = this;
    el.style.cursor = 'pointer';
    el.className = 'SUI_editor_selector';
    if(this.change) Object.extend(el, {$muisavehandler:this.change});
    (function(e) {
      e.cancelBubble = true;
      if(e.stopPropagation) e.stopPropagation();
      self.buildSelect(e, cls, cst); suilib.capturedClick = {pageX:e.pageX, pageY:e.pageY};
    }).$('mouseover', el);
  },

  /*
    Скрывает элемент и создает на его месте селектор
  */
  buildSelect: function(e, cls, cst) {
    var org = (e.target || e.srcElement);
    if(org.previousSibling &&
       org.previousSibling.className &&
       org.previousSibling.className=='SUI_editor_selector_select') return false;
    var inp = document.createElement('select');
    suilib.editor.$inputs.push(inp);
    inp.className = 'SUI_editor_selector_select';
    if(cst) $(inp).setstyle(cst); var opt = {};
    var opts = this.selbuilder ? this.selbuilder(cls, org) : [];
    var close = function(e) {
      $(org).show();
      $(inp).removeElement();
    }
    //if(suilib.UserAgent.isFirefox) close.$('popuphiding', inp);
    for(var i=0,l=opts.length; i<l; i++) {
      opt = new Option();
      if(typeof opts[i]=='string') {
        opt.appendChild(document.createTextNode(opts[i]));
        opt.value = opts[i];
        if(opts[i]==org.innerHTML) opt.selected = opt.defaultSelected = true;
      } else for(var j in opts[i]) {
        if(j=='text') {
          opt.appendChild(document.createTextNode(opts[i][j]));
          opt.value = opts[i][j];
          if(opts[i][j]==org.innerHTML) opt.selected = opt.defaultSelected = true;
        } else opt[j] = opts[i][j];
      }
      inp.appendChild(opt);
      close.$('click', opt); // внимание - в IE и Safari элементам option событие click не вешается
    }
    org.parentNode.insertBefore(inp, org);
    var changehandler = function(e) {
      var sel = (e.target || e.srcElement);
      var opt = sel.options[sel.selectedIndex];
      var oldval = org.innerHTML;
      org.innerHTML = sel.value;
      $(org).show(); $(inp).removeElement();
      if(org.$muisavehandler && sel.value!=oldval) org.$muisavehandler(oldval, opt, cls);
    }
    changehandler.$('change', inp);
    (function(e) {
      e.cancelBubble = true;
      if(e.stopPropagation) e.stopPropagation();
      if(e.type=='click') inp.$ofNoClose = true;
    }).$('click', inp).$('mousemove', inp);
    $(org).hide(); inp.focus();
  },

  /*
    Устанавливает заново contentEditable
  */
  render: function(tn) {
    var idoc = this.areas[tn];
    if(!idoc) return false;
    var self = this;
    (function() {
      try {
        idoc.designMode = self.isGecko ? 'on' : 'On';
        idoc.contentEditable = true;
      } catch(e){}
    }).$('timeout', 500);
    try { this.observe(idoc, tn) } catch(e) {}
    return idoc;
  },

  // Вызывает небольшую утечку памяти! Почему - непонятно =(
  renderAll: function() {
    for(var i in this.areas)
      this.render(i);
  },

  getContent: function(tn) {
    var content = this.convert(this.areas[tn]);
    this.setContent(tn, content);
    return content;
  },

  setContent: function(tn, content) {
    this.fields[tn].value = content;
    this.areas[tn].body.innerHTML = content;
  },

  focus: function(tn) {
    try { switch(this.currentState) {
      case 'editor':
        this.windows[tn].focus();
      break;
      case 'html':
        this.fields[tn].focus();
      break;
      case 'codepress':
        this.press[tn].contentWindow.focus();
      break;
      case 'codemirror':
        this.mirrors[tn].win.focus();
      break;
    } } catch(e) {}
  }
}});
/*

    Динамическое всплывающее меню

    @version $Id$

*/

Object.extend(suilib, {
menu:{
  init: function(args) {
    if(!args.apply || !args.apply.length) return false;
    args.apply.walkwith(this.buildMenu);
  },
  
  buildMenu: function(hash) {
    var el = $(hash.el);
    if(!el || !el.isa('ul')) return false;
    suilib.menu.hover = (hash.cls || '');
    suilib.menu.callback = (hash.callback || function(){});
    suilib.menu.create   = (hash.create   || function(){});
    var activators = el.getChilds();
    activators.walkwith(suilib.menu.applyRecursive);
  },
  
  level: 0, hover: '', callback: function(){}, create: function(){},
  
  applyRecursive: function(li) {
    if(!$(li).isa('li')) return false;
    var inners = $(li).getChilds();
    with(li.style) {
      position = 'relative';
    }
    suilib.menu.create(li);
    suilib.menu.level++;
    for(var i=0,l=inners.length; i<l; i++) {
      inners[i] = $(inners[i]);
      if(!inners[i].isa('ul')) continue;
      inners[i].getChilds().walkwith(arguments.callee);
      inners[i].hide();
      inners[i].setstyle('position:absolute;z-index:'+(10+suilib.menu.level));
    }
    suilib.menu.level--;
    var oClass = suilib.menu.hover;
    var oCall  = suilib.menu.callback;
    // Event handlers
    var hidewrap = function() {
      var list = arguments.callee.list;
        for(var i=0,l=list.length; i<l; i++) {
          if(!$(list[i]).isa('ul')) continue;
          $(list[i]).hide();
        }
    }; 

    (function(e){
      var et = (e.target || e.srcElement);
      if(oClass) li.className = oClass;
      if(oCall)  oCall(li, 'over');
      for(var i=0,l=inners.length; i<l; i++) {
        if(!$(inners[i]).isa('ul')) continue;
        inners[i].style.display = 'block';
        if(et==li) {
        // Fading-меню хреново работает в осле =(
        //$(inners[i]).setop(10);
        //$(inners[i]).setop(100, 15);
        }  
        arguments.callee.hidewrap.$un('timeout');
      }
      if(suilib.UserAgent.isMSIE) {
        var siblings = $(li.parentNode).getChilds();
        for(var i=0,l=siblings.length; i<l; i++) {
          if(siblings[i]==li) continue;
          siblings[i].style.position = 'static';
        }
      }
    }).$('mouseover', li).hidewrap = hidewrap;

    (function(e){
      if(oClass) li.className = '';
      if(oCall)  oCall(li, 'out');
      arguments.callee.hidewrap.list = inners;
      if(suilib.UserAgent.isMSIE) {
        var siblings = $(li.parentNode).getChilds();
        for(var i=0,l=siblings.length; i<l; i++) {
          if(siblings[i]==li) continue;
          siblings[i].style.position = 'relative';
        }
        arguments.callee.hidewrap();
      } else arguments.callee.hidewrap.$('timeout', 1);
    }).$('mouseout', li).hidewrap = hidewrap;
  }
}});
/*

    Nifty - закругленные углы

    @version $Id$

*/

Object.extend(suilib, {
nifty: {
  init: function(args) {
    var self = this;
    if(!args || !args.apply || !args.apply.length) return null;
    suilib.addStyle(this.cssRules);
    args.apply.walkwith(self.makeNifty);
  },

  cssRules: [
    {selector: 'b.niftycorners',   rule: 'display:block;'},
    {selector: 'b.niftyfill',      rule: 'display:block;'},
    {selector: 'b.niftycorners *', rule: 'display:block;height:1px;line-height:1px;font-size:1px;overflow:hidden;border-style:solid;border-width:0 1px;'},
    {selector: 'b.r1',             rule: 'margin:0 3px;border-width:0 2px;'},
    {selector: 'b.r2',             rule: 'margin:0 2px;'},
    {selector: 'b.r3',             rule: 'margin:0 1px;'},
    {selector: 'b.r4',             rule: 'height:2px;'},
    {selector: 'b.rb1',            rule: 'margin:0 8px;border-width:0 2px;'},
    {selector: 'b.rb2',            rule: 'margin:0 6px;border-width:0 2px;'},
    {selector: 'b.rb3',            rule: 'margin:0 5px;'},
    {selector: 'b.rb4',            rule: 'margin:0 4px;'},
    {selector: 'b.rb5',            rule: 'margin:0 3px;'},
    {selector: 'b.rb6',            rule: 'margin:0 2px;'},
    {selector: 'b.rb7',            rule: 'margin:0 1px;height:2px;'},
    {selector: 'b.rb8',            rule: 'margin:0;height:2px;'},
    {selector: 'b.rs1',            rule: 'margin:0 1px;'},
    {selector: 'b.t1',             rule: 'border-width:0 5px;'},
    {selector: 'b.t2',             rule: 'border-width:0 3px;'},
    {selector: 'b.t3',             rule: 'border-width:0 2px;'},
    {selector: 'b.t4',             rule: 'height:2px;'},
    {selector: 'b.tb1',            rule: 'border-width:0 10px;'},
    {selector: 'b.tb2',            rule: 'border-width:0 8px;'},
    {selector: 'b.tb3',            rule: 'border-width:0 6px;'},
    {selector: 'b.tb4',            rule: 'border-width:0 5px;'},
    {selector: 'b.tb5',            rule: 'border-width:0 4px;'},
    {selector: 'b.tb6',            rule: 'border-width:0 3px;'},
    {selector: 'b.tb7',            rule: 'border-width:0 2px;height:2px;'},
    {selector: 'b.tb8',            rule: 'border-width:0 1px;height:2px;'},
    {selector: 'b.ts1',            rule: 'border-width:0 2px;'}
  ],

  makeNifty: function(hash) {
    if(!hash.selector) return null;
    var i, v = hash.selector.split(','), h = 0;
    if(hash.options==null) hash.options = '';
    if(hash.options.find('fixed-height')) h = suilib.nifty.getBySelector(v[0])[0].offsetHeight;
    for(i=0; i < v.length; i++) suilib.nifty.rounded(v[i], hash.options);
    if(hash.options.find('height')) suilib.nifty.sameHeight(hash.selector, h);
  },

  rounded: function(selector, options) {
    var i, top = '', bottom = '', v = new Array();
    if(options!='') {
      options = options.replace('left',        'tl bl');
      options = options.replace('right',       'tr br');
      options = options.replace('top',         'tr tl');
      options = options.replace('bottom',      'br bl');
      options = options.replace('transparent', 'alias');
      if(options.find('tl')) {
        top = 'both';
        if(!options.find('tr')) top = 'left';
      } else if(options.find('tr')) top = 'right';
      if(options.find('bl')) {
        bottom = 'both';
        if(!options.find('br')) bottom = 'left';
      } else if(options.find('br')) bottom = 'right';
    }
    if(top=='' && bottom=='' && !options.find('none')) {top = 'both'; bottom = 'both'}
    v = this.getBySelector(selector)
    for(i = 0; i < v.length; i++) {
      this.fixIE(v[i]);
      if(top!='') this.addTop(v[i], top, options);
      if(bottom!='') this.addBottom(v[i], bottom, options);
    }
  },

  fixIE: function(el) {
    if(el.currentStyle!=null && el.currentStyle.hasLayout!=null && el.currentStyle.hasLayout==false)
      el.style.display = 'inline-block';
  },

  addTop: function(el, side, options) {
    var d = this.createEl('b'), lim = 4, border = '', p, i, btype = 'r', bk, color;
    d.style.marginLeft  = "-" + this.getPadding(el, 'Left')  + 'px';
    d.style.marginRight = "-" + this.getPadding(el, 'Right') + 'px';
    if(options.find('alias') || (color = this.getBk(el))=='transparent') {
      color  = 'transparent';
      bk     = 'transparent';
      border = this.getParentBk(el);
      btype  = 't';
    } else {
      bk     = this.getParentBk(el);
      border = this.mix(color, bk);
    }
    d.style.background = bk;
    d.className = 'niftycorners';
    p = this.getPadding(el, 'Top');
    if(options.find('small')) {
      d.style.marginBottom = (p-2) + 'px';
      btype+='s'; lim = 2;
    } else if(options.find('big')) {
      d.style.marginBottom = (p-10) + 'px';
      btype+='b'; lim=8;
    } else d.style.marginBottom=(p-5) + 'px';
    for(i = 1; i <= lim; i++) d.appendChild(this.createStrip(i, side, color, border, btype));
    el.style.paddingTop = '0';
    el.insertBefore(d, el.firstChild);
  },

  addBottom: function(el, side, options) {
    var d = this.createEl('b'), lim = 4, border = '', p, i, btype = 'r', bk, color;
    d.style.marginLeft  = '-' + this.getPadding(el, 'Left')  + 'px';
    d.style.marginRight = '-' + this.getPadding(el, 'Right') + 'px';
    if(options.find('alias') || (color = this.getBk(el))=='transparent') {
      color  = 'transparent';
      bk     = 'transparent';
      border = this.getParentBk(el);
      btype  = 't';
    } else {
      bk = this.getParentBk(el)
      border = this.mix(color, bk);
    }
    d.style.background = bk;
    d.className = 'niftycorners';
    p = this.getPadding(el, 'Bottom');
    if(options.find('small')) {
      d.style.marginTop = (p-2) + 'px';
      btype+='s'; lim = 2;
    } else if(options.find('big')) {
      d.style.marginTop = (p-10) + 'px';
      btype+='b'; lim = 8;
    } else d.style.marginTop = (p-5) + 'px';
    for(i = lim; i > 0; i--) d.appendChild(this.createStrip(i, side, color, border, btype))
    el.style.paddingBottom = 0;
    el.appendChild(d);
  },

  createEl: function(el) {
    return document.createElement(el);
  },

  createStrip: function(index, side, color, border, btype) {
    var x = this.createEl('b');
    x.className = btype+index;
    x.style.backgroundColor = color;
    x.style.borderColor = border;
    if(side=='left') {
      x.style.borderRightWidth = '0';
      x.style.marginRight = '0';
    } else if(side=='right') {
      x.style.borderLeftWidth = '0';
      x.style.marginLeft = '0';
    }
    return x;
  },

  getPadding: function(x, side) {
    var p = this.getStyleProp(x, 'padding'+side);
    if(p==null || !p.find('px')) return 0;
    return parseInt(p, 10);
  },

  getStyleProp: function(x, prop) {
    if(x.currentStyle) return x.currentStyle[prop];
    if(document.defaultView.getComputedStyle)
      return document.defaultView.getComputedStyle(x, '')[prop];
    return null;
  },

  getParentBk: function(x) {
    var el = x.parentNode, c;
    while(!$(el).isa('html') && (c = this.getBk(el))=='transparent')
      el = el.parentNode;
    if(c=='transparent') c = '#FFFFFF';
    return c;
  },

  getBk: function(x) {
    var c = this.getStyleProp(x, 'backgroundColor');
    if(c==null || c=='transparent' || c.find('rgba(0, 0, 0, 0)'))
      return 'transparent';
    if(c.find('rgb')) c = this.rgb2hex(c);
    return c;
  },

  rgb2hex: function(value) {
    var hex = '', v, h, i;
    var regexp = /([0-9]+)[, ]+([0-9]+)[, ]+([0-9]+)/;
    var h = regexp.exec(value);
    for(i = 1; i < 4; i++) {
      v = parseInt(h[i], 10).toString(16);
      if(v.length==1) hex+='0'+v;
      else hex+=v;
    }
    return '#'+hex;
  },

  mix: function(c1, c2) {
    var i, step1, step2, x, y, r = new Array(3);
    if(c1.length==4) step1 = 1;
    else step1 = 2;
    if(c2.length==4) step2 = 1;
    else step2 = 2;
    for(i = 0; i < 3; i++) {
      x = parseInt(c1.substr(1+step1*i, step1), 16);
      if(step1==1) x = 16*x+x;
      y = parseInt(c2.substr(1+step2*i, step2), 16);
      if(step2==1) y = 16*y+y;
      r[i] = Math.floor((x*50+y*50)/100);
      r[i] = r[i].toString(16);
      if(r[i].length==1) r[i]='0'+r[i];
    }
    return '#'+r[0]+r[1]+r[2];
  },

  sameHeight: function(selector, maxh) {
    var i, v = selector.split(','), t, j, els = [], gap;
    for(i = 0; i < v.length; i++) {
      t   = this.getBySelector(v[i]);
      els = els.concat(t);
    }
    for(i = 0; i < els.length; i++) {
      if(els[i].offsetHeight > maxh) maxh = els[i].offsetHeight;
      els[i].style.height = 'auto';
    }
    for(i = 0; i < els.length; i++) {
      gap = maxh - els[i].offsetHeight;
      if(gap > 0) {
        t = this.createEl('b');
        t.className    = 'niftyfill';
        t.style.height = gap+'px';
        nc = els[i].lastChild;
        if(nc.className=='niftycorners') els[i].insertBefore(t, nc);
        else els[i].appendChild(t);
      }
    }
  },

  getBySelector: function(selector) {
    var i, j, selid = '', selclass = '', tag = selector;
    var tag2 = '', v2, k, f, a, s = [], objlist = [], c;
    if(selector.find('#')) {
      if(selector.find(' ')) {
        s = selector.split(' ');
        var fs = s[0].split('#');
        if(fs.length==1) return(objlist);
        f = $(fs[1]);
        if(f) {
          v = f.getElementsByTagName(s[1]);
          for(i=0; i<v.length; i++) objlist.push(v[i]);
        }
        return(objlist);
      } else {
        s   = selector.split('#');
        tag = s[0];
        selid = s[1];
        if(selid!='') {
          f = $(selid);
          if(f) objlist.push(f);
          return(objlist);
        }
      }
    }
    if(selector.find('.')) {
      s   = selector.split('.');
      tag = s[0];
      selclass = s[1];
      if(selclass.find(' ')) {
        s = selclass.split(' ');
        selclass = s[0];
        tag2 = s[1];
      }
    }
    var v = document.getElementsByTagName(tag);
    if(selclass=='') {
      for(i=0; i<v.length; i++) objlist.push(v[i]);
      return(objlist);
    }
    for(i=0; i<v.length; i++) {
      c = v[i].className.split(' ');
      for(j=0;j<c.length;j++) {
        if(c[j]==selclass) {
          if(tag2=='') objlist.push(v[i]);
          else {
            v2 = v[i].getElementsByTagName(tag2);
            for(k=0; k<v2.length; k++) objlist.push(v2[k]);
          }
        }
      }
    }
    return(objlist);
  }    
}});
/*

    Автодополнение, а-ля google search

    @version $Id$

*/

Object.extend(suilib, {
suggest:{
  init: function(args) {
    if(!args.apply || !args.apply.length) return false;
    args.apply.walkwith(this.create);
  },
  storage: [],
  create: function(hash) {
    var auto = function(el, callback, select_handler){this.build(el, callback, select_handler)};
    auto.prototype = {
      all: [], current: null, aborted: false,
      build: function(el, callback, select_handler) {
        this.callback = callback;
        this.select_handler = select_handler || function(){};
        this.element  = $(el);
        this.layer    = document.createElement('div');
        this.layer.className = 'SUI_suggest_div';
        this.value    = this.element.value;
        (!!document.body ? document.body : document.getElementsByTagName('body')[0]).appendChild(this.layer);
        with(this.layer.style) {
          display  = 'none';
          position = 'absolute';
          zIndex = 9999;
        } var self = this;
        (function(e){self.keyup(e, self.element, self.layer)}).$('keyup', this.element);
        (function(e){self.hide();}).$('blur', this.element);
        auto.prototype.all.push(this.layer);
      },
      keyup: function(e, f, l) {
        if(this.value==f.value) return null;
        this.hide(); var item, self = this;
        this.value  = f.value;
        var suggestion = function() {
          var result  = self.callback(f.value);
          if(self.aborted) {
            self.aborted = false;
            return null;
          }
          if(!result || !result.length) return null;
          var offset  = $(self.element).getoffset(true);
          $(l).removeChilds();
          with(l.style) {
            display = '';
            width   = f.offsetWidth + 'px';
            left    = offset[0] + 'px';
            top     = offset[1] + f.offsetHeight + 'px';
          }  
          for(var i=0,len=result.length; i<len; i++) {
            item = document.createElement('div');
            item.className = 'SUI_suggest_item';
            item.innerHTML   = result[i].text;
            self.choose(item, result[i].value);
            l.appendChild(item);
          }
        }
        if(this.current) this.current.$un('timeout');
        suggestion.$('timeout', 500);
        this.current = suggestion
      },
      choose: function(item, value) {
        var self = this;
        (function(e){item.className = 'SUI_suggest_item_hover'}).$('mouseover', item);
        (function(e){item.className = 'SUI_suggest_item'}).$('mouseout', item);
        (function(e){self.element.value = value;self.select_handler(self.element, item)}).$('mousedown', item);
      },
      hide: function() {
        var e = auto.prototype.all;
        for(var i=0,l=e.length; i<l; i++)
          $(e[i]).hide();
      },
      cancel: function() {
        this.aborted = true;
      }
    }
    suilib.suggest.storage.push(new auto($(hash.element), hash.handler, hash.onselect));
  },
  cancel: function() {
    this.storage.walkwith(function(el)
    {
      el.cancel();
      el.hide();
    });
  }
}});
/*

    Динамические вкладки

    @version $Id$

*/

Object.extend(suilib, {
tabs:{
  init: function(args) {
    if(!args.apply) return false;
    var allNodes = args.apply.length ? document.getElementsByTagName('*') : [];
    var len = allNodes.length;
    for(var i=0; i<args.apply.length; i++) {
      this.all[i] = {};
      if(!args.apply[i].els && !args.apply[i].hds) continue;
      if(typeof args.apply[i].els=='string') {
        var tmp = [];
        for(var j=0; j<len; j++) 
          if(allNodes[j] && allNodes[j].className && allNodes[j].className.split(' ').hasa(args.apply[i].els)!==false)
            tmp.push(allNodes[j]);
        this.all[i].els = tmp;
      } else if(typeof args.apply[i].els=='object' && args.apply[i].els.length)
        this.all[i].els = args.apply[i].els;
      if(args.apply[i].hds) {
        if(typeof args.apply[i].hds=='string') {
          var tmp = [];
          for(var j=0; j<len; j++) 
            if(allNodes[j] && allNodes[j].className && allNodes[j].className.split(' ').hasa(args.apply[i].hds)!==false)
              tmp.push(allNodes[j]);
          this.all[i].hds = tmp;
        } else if(typeof args.apply[i].hds=='object' && args.apply[i].hds.length)
          this.all[i].hds = args.apply[i].hds;
      }
      if(args.apply[i].open && this.all[i].els) {
        if(typeof args.apply[i].open=='string')
          this.all[i].open = $(args.apply[i].open);
        else if(typeof args.apply[i].open=='number' && args.apply[i].open<=this.all[i].els.length)
          this.all[i].open = $(this.all[i].els[args.apply[i].open-1]);
      }
      this.all[i].callback = (args.apply[i].callback || function(){});
      this.buildTabs(this.all[i]);
    }
  },

  all: [],
  cls: ['SUI_tabs_inactive', 'SUI_tabs_current', 'SUI_tabs_hover'],

  buildTabs: function(tArr) {
    var tHd = [], len = tArr.els ? tArr.els.length : tArr.hds.length;
    for(var i=0; i<len; i++) {
      var el = tArr.els ? $(tArr.els[i]) : null, hd = false;
      if(tArr.hds) hd = $(tArr.hds[i]); else hd = el.getChilds()[0];
      tHd.push(hd);
      if(!tArr.hds) el.parentNode.insertBefore(hd, $(tArr.els[0]));
      if(tArr.open && el==tArr.open) tArr.open = hd;
      if(el) el.hide();
    }

    var handlerClick = [], handlerOver = [], handlerOut = [];
    for(var i=0; i<tHd.length; i++) {
      handlerClick[i] = (function(){suilib.tabs.openTab(tArr, tHd, arguments.callee.obj);});
      handlerOver[i]  = (function(){var el = arguments.callee.obj, allCls = (el.className.split(' ') || []); if (allCls.hasa(suilib.tabs.cls[1])===false) el.classReplace('SUI_tabs_hover', suilib.tabs.cls);});
      handlerOut[i]   = (function(){var el = arguments.callee.obj, allCls = (el.className.split(' ') || []); if (allCls.hasa(suilib.tabs.cls[1])===false) el.classReplace('SUI_tabs_inactive', suilib.tabs.cls);});
      handlerClick[i].obj = handlerOver[i].obj = handlerOut[i].obj = tHd[i];
      handlerClick[i].$('click', tHd[i]);
      handlerOver[i].$('mouseover', tHd[i]);
      handlerOut[i].$('mouseout', tHd[i]);
    }

    this.openTab(tArr, tHd, tArr.open ? tArr.open : tHd[0]);
  },

  openTab: function(tArr, tHd, tOpen) {
    var index = 0;
    for(var i=0; i<tHd.length; i++) {
      var allCls = (tHd[i].className.split(' ') || []);
      if(tHd[i]==tOpen) {
        tHd[i].style.cursor = 'default';
        if(allCls.hasa(suilib.tabs.cls[1])!==false) return false;
        tHd[i].classReplace('SUI_tabs_current', this.cls);
        index = i;
      } else {
        tHd[i].style.cursor = 'pointer';
        if(allCls.hasa(suilib.tabs.cls[0])!==false) continue;
        tHd[i].classReplace('SUI_tabs_inactive', this.cls);
        if(tArr.els) $(tArr.els[i]).hide();
      }
    }
    var el = tArr.els ? tArr.els[index] : null;
    if(tArr.callback) tArr.callback(tHd[index], el, index+1);
    if(el) $(tArr.els[index]).show();
  }
}});
