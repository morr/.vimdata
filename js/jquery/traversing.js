var runtil = /Until$/,
  rparentsprev = /^(?:parents|prevUntil|prevAll)/,
  // Note: This RegExp should be improved, or likely pulled from Sizzle
  rmultiselector = /,/,
  slice = Array.prototype.slice;

// Implement the identical functionality for filter and not
var winnow = function( elements, qualifier, keep ) {
  if ( jQuery.isFunction( qualifier ) ) {
    return jQuery.grep(elements, function(elem, i) {
      return !!qualifier.call( elem, i, elem ) === keep;
    });

  } else if ( qualifier.nodeType ) {
    return jQuery.grep(elements, function(elem, i) {
      return (elem === qualifier) === keep;
    });

  } else if ( typeof qualifier === "string" ) {
    var filtered = jQuery.grep(elements, function(elem) {
      return elem.nodeType === 1;
    });

    if ( isSimple.test( qualifier ) ) {
      return jQuery.filter(qualifier, filtered, !keep);
    } else {
      qualifier = jQuery.filter( qualifier, elements );
    }
  }

  return jQuery.grep(elements, function(elem, i) {
    return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
  });
};

jQuery.fn.extend({
  find: function( selector ) {
    var ret = this.pushStack( "", "find", selector ), length = 0;

    for ( var i = 0, l = this.length; i < l; i++ ) {
      length = ret.length;
      jQuery.find( selector, this[i], ret );

      if ( i > 0 ) {
        // Make sure that the results are unique
        for ( var n = length; n < ret.length; n++ ) {
          for ( var r = 0; r < length; r++ ) {
            if ( ret[r] === ret[n] ) {
              ret.splice(n--, 1);
              break;
            }
          }
        }
      }
    }

    return ret;
  },

  has: function( target ) {
    var targets = jQuery( target );
    return this.filter(function() {
      for ( var i = 0, l = targets.length; i < l; i++ ) {
        if ( jQuery.contains( this, targets[i] ) ) {
          return true;
        }
      }
    });
  },

  contains: function( target ) {
    return this.has( target ).length > 0;
  },

  not: function( selector ) {
    return this.pushStack( winnow(this, selector, false), "not", selector);
  },

  filter: function( selector ) {
    return this.pushStack( winnow(this, selector, true), "filter", selector );
  },

  closest: function( selectors, context ) {
    if ( jQuery.isArray( selectors ) ) {
      var ret = [], cur = this[0], match, matches = {}, selector;

      if ( cur && selectors.length ) {
        for ( var i = 0, l = selectors.length; i < l; i++ ) {
          selector = selectors[i];

          if ( !matches[selector] ) {
            matches[selector] = jQuery.expr.match.POS.test( selector ) ? 
              jQuery( selector, context || this.context ) :
              selector;
          }
        }

        while ( cur && cur.ownerDocument && cur !== context ) {
          for ( selector in matches ) {
            match = matches[selector];

            if ( match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match) ) {
              ret.push({ selector: selector, elem: cur });
              delete matches[selector];
            }
          }
          cur = cur.parentNode;
        }
      }

      return ret;
    }

    var pos = jQuery.expr.match.POS.test( selectors ) ? 
      jQuery( selectors, context || this.context ) : null;

    return this.map(function(i, cur){
      while ( cur && cur.ownerDocument && cur !== context ) {
        if ( pos ? pos.index(cur) > -1 : jQuery(cur).is(selectors) ) {
          return cur;
        }
        cur = cur.parentNode;
      }
      return null;
    });
  },

  add: function( selector, context ) {
    var set = typeof selector === "string" ?
        jQuery( selector, context || this.context ) :
        jQuery.makeArray( selector ),
      all = jQuery.merge( this.get(), set );

    return this.pushStack( set[0] && (set[0].setInterval || set[0].nodeType === 9 || (set[0].parentNode && set[0].parentNode.nodeType !== 11)) ?
      jQuery.unique( all ) :
      all );
  },

  eq: function( i ) {
    return i === -1 ?
      this.slice( i ) :
      this.slice( i, +i + 1 );
  },

  first: function() {
    return this.eq( 0 );
  },

  last: function() {
    return this.eq( -1 );
  },

  slice: function() {
    return this.pushStack( slice.apply( this, arguments ),
      "slice", slice.call(arguments).join(",") );
  },

  map: function( callback ) {
    return this.pushStack( jQuery.map(this, function(elem, i){
      return callback.call( elem, i, elem );
    }));
  },

  andSelf: function() {
    return this.add( this.prevObject );
  },

  end: function() {
    return this.prevObject || jQuery(null);
  }
});

jQuery.each({
  parent: function(elem){return elem.parentNode;},
  parents: function(elem){return jQuery.dir(elem,"parentNode");},
  parentsUntil: function(elem,i,until){return jQuery.dir(elem,"parentNode",until);},
  next: function(elem){return jQuery.nth(elem,2,"nextSibling");},
  prev: function(elem){return jQuery.nth(elem,2,"previousSibling");},
  nextAll: function(elem){return jQuery.dir(elem,"nextSibling");},
  prevAll: function(elem){return jQuery.dir(elem,"previousSibling");},
  nextUntil: function(elem,i,until){return jQuery.dir(elem,"nextSibling",until);},
  prevUntil: function(elem,i,until){return jQuery.dir(elem,"previousSibling",until);},
  siblings: function(elem){return jQuery.sibling(elem.parentNode.firstChild,elem);},
  children: function(elem){return jQuery.sibling(elem.firstChild);},
  contents: function(elem){return jQuery.nodeName(elem,"iframe")?elem.contentDocument||elem.contentWindow.document:jQuery.makeArray(elem.childNodes);}
}, function(name, fn){
  jQuery.fn[ name ] = function( until, selector ) {
    var ret = jQuery.map( this, fn, until );
    
    if ( !runtil.test( name ) ) {
      selector = until;
    }

    if ( selector && typeof selector === "string" ) {
      ret = jQuery.filter( selector, ret );
    }

    ret = this.length > 1 ? jQuery.unique( ret ) : ret;

    if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
      ret = ret.reverse();
    }

    return this.pushStack( ret, name, slice.call(arguments).join(",") );
  };
});

jQuery.extend({
  filter: function( expr, elems, not ) {
    if ( not ) {
      expr = ":not(" + expr + ")";
    }

    return jQuery.find.matches(expr, elems);
  },
  
  dir: function( elem, dir, until ) {
    var matched = [], cur = elem[dir];
    while ( cur && cur.nodeType !== 9 && (until === undefined || !jQuery( cur ).is( until )) ) {
      if ( cur.nodeType === 1 ) {
        matched.push( cur );
      }
      cur = cur[dir];
    }
    return matched;
  },

  nth: function( cur, result, dir, elem ) {
    result = result || 1;
    var num = 0;

    for ( ; cur; cur = cur[dir] ) {
      if ( cur.nodeType === 1 && ++num === result ) {
        break;
      }
    }

    return cur;
  },

  sibling: function( n, elem ) {
    var r = [];

    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType === 1 && n !== elem ) {
        r.push( n );
      }
    }

    return r;
  }
});
