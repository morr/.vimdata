/*!
 * jQuery JavaScript Library v1.3.2
 *
 * hack for RjsTags
 *
 */
jQuery.fn.extend({
addClass: function(){},
ajaxComplete: function(){},
ajaxError: function(){},
ajaxSend: function(){},
ajaxStart: function(){},
ajaxStop: function(){},
ajaxSuccess: function(){},
appendTo: function(){},
blur: function(){},
change: function(){},
children: function(){},
click: function(){},
contents: function(){},
dblclick: function(){},
empty: function(){},
error: function(){},
fadeIn: function(){},
fadeOut: function(){},
focus: function(){},
innerHeight: function(){},
innerWidth: function(){},
insertAfter: function(){},
insertBefore: function(){},
keydown: function(){},
keypress: function(){},
keyup: function(){},
load: function(){},
mousedown: function(){},
mouseenter: function(){},
mouseleave: function(){},
mousemove: function(){},
mouseout: function(){},
mouseover: function(){},
mouseup: function(){},
next: function(){},
nextAll: function(){},
outerHeigth: function(){},
outerWidth: function(){},
parent: function(){},
parents: function(){},
prependTo: function(){},
prev: function(){},
prevAll: function(){},
remove: function(){},
removeAttr: function(){},
removeClass: function(){},
replaceAll: function(){},
resize: function(){},
scroll: function(){},
scrollLeft: function(){},
scrollTop: function(){},
select: function(){},
siblings: function(){},
slideDown: function(){},
slideToggle: function(){},
slideUp: function(){},
submit: function(){},
toggleClass: function(){},
unload: function(){}
});


jQuery.fn.extend({
        init: function( selector, context ) {
                // Make sure that a selection was provided
                selector = selector || document;

                // Handle $(DOMElement)
                if ( selector.nodeType ) {
                        this[0] = selector;
                        this.length = 1;
                        this.context = selector;
                        return this;
                }
                // Handle HTML strings
                if ( typeof selector === "string" ) {
                        // Are we dealing with HTML string or an ID?
                        var match = quickExpr.exec( selector );

                        // Verify a match, and that no context was specified for #id
                        if ( match && (match[1] || !context) ) {

                                // HANDLE: $(html) -> $(array)
                                if ( match[1] )
                                        selector = jQuery.clean( [ match[1] ], context );

                                // HANDLE: $("#id")
                                else {
                                        var elem = document.getElementById( match[3] );

                                        // Handle the case where IE and Opera return items
                                        // by name instead of ID
                                        if ( elem && elem.id != match[3] )
                                                return jQuery().find( selector );

                                        // Otherwise, we inject the element directly into the jQuery object
                                        var ret = jQuery( elem || [] );
                                        ret.context = document;
                                        ret.selector = selector;
                                        return ret;
                                }

                        // HANDLE: $(expr, [context])
                        // (which is just equivalent to: $(content).find(expr)
                        } else
                                return jQuery( context ).find( selector );

                // HANDLE: $(function)
                // Shortcut for document ready
                } else if ( jQuery.isFunction( selector ) )
                        return jQuery( document ).ready( selector );

                // Make sure that old selector state is passed along
                if ( selector.selector && selector.context ) {
                        this.selector = selector.selector;
                        this.context = selector.context;
                }

                return this.setArray(jQuery.isArray( selector ) ?
                        selector :
                        jQuery.makeArray(selector));
        },

        // Start with an empty selector
        selector: "",

        // The current version of jQuery being used
        jquery: "1.3.2",

        // The number of elements contained in the matched element set
        size: function() {
                return this.length;
        },

        // Get the Nth element in the matched element set OR
        // Get the whole matched element set as a clean array
        get: function( num ) {
                return num === undefined ?

                        // Return a 'clean' array
                        Array.prototype.slice.call( this ) :

                        // Return just the object
                        this[ num ];
        },

        // Take an array of elements and push it onto the stack
        // (returning the new matched element set)
        pushStack: function( elems, name, selector ) {
                // Build a new jQuery matched element set
                var ret = jQuery( elems );

                // Add the old object onto the stack (as a reference)
                ret.prevObject = this;

                ret.context = this.context;

                if ( name === "find" )
                        ret.selector = this.selector + (this.selector ? " " : "") + selector;
                else if ( name )
                        ret.selector = this.selector + "." + name + "(" + selector + ")";

                // Return the newly-formed element set
                return ret;
        },

        // Force the current matched set of elements to become
        // the specified array of elements (destroying the stack in the process)
        // You should use pushStack() in order to do this, but maintain the stack
        setArray: function( elems ) {
                // Resetting the length to 0, then using the native Array push
                // is a super-fast way to populate an object with array-like properties
                this.length = 0;
                Array.prototype.push.apply( this, elems );

                return this;
        },

        // Execute a callback for every element in the matched set.
        // (You can seed the arguments with an array of args, but this is
        // only used internally.)
        each: function( callback, args ) {
                return jQuery.each( this, callback, args );
        },

        // Determine the position of an element within
        // the matched set of elements
        index: function( elem ) {
                // Locate the position of the desired element
                return jQuery.inArray(
                        // If it receives a jQuery object, the first element is used
                        elem && elem.jquery ? elem[0] : elem
                , this );
        },

        attr: function( name, value, type ) {
                var options = name;

                // Look for the case where we're accessing a style value
                if ( typeof name === "string" )
                        if ( value === undefined )
                                return this[0] && jQuery[ type || "attr" ]( this[0], name );

                        else {
                                options = {};
                                options[ name ] = value;
                        }

                // Check to see if we're setting style values
                return this.each(function(i){
                        // Set all the styles
                        for ( name in options )
                                jQuery.attr(
                                        type ?
                                                this.style :
                                                this,
                                        name, jQuery.prop( this, options[ name ], type, i, name )
                                );
                });
        },

        css: function( key, value ) {
                // ignore negative width and height values
                if ( (key == 'width' || key == 'height') && parseFloat(value) < 0 )
                        value = undefined;
                return this.attr( key, value, "curCSS" );
        },

        text: function( text ) {
                if ( typeof text !== "object" && text != null )
                        return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );

                var ret = "";

                jQuery.each( text || this, function(){
                        jQuery.each( this.childNodes, function(){
                                if ( this.nodeType != 8 )
                                        ret += this.nodeType != 1 ?
                                                this.nodeValue :
                                                jQuery.fn.text( [ this ] );
                        });
                });

                return ret;
        },

        wrapAll: function( html ) {
                if ( this[0] ) {
                        // The elements to wrap the target around
                        var wrap = jQuery( html, this[0].ownerDocument ).clone();

                        if ( this[0].parentNode )
                                wrap.insertBefore( this[0] );

                        wrap.map(function(){
                                var elem = this;

                                while ( elem.firstChild )
                                        elem = elem.firstChild;

                                return elem;
                        }).append(this);
                }

                return this;
        },

        wrapInner: function( html ) {
                return this.each(function(){
                        jQuery( this ).contents().wrapAll( html );
                });
        },

        wrap: function( html ) {
                return this.each(function(){
                        jQuery( this ).wrapAll( html );
                });
        },

        append: function() {
                return this.domManip(arguments, true, function(elem){
                        if (this.nodeType == 1)
                                this.appendChild( elem );
                });
        },

        prepend: function() {
                return this.domManip(arguments, true, function(elem){
                        if (this.nodeType == 1)
                                this.insertBefore( elem, this.firstChild );
                });
        },

        before: function() {
                return this.domManip(arguments, false, function(elem){
                        this.parentNode.insertBefore( elem, this );
                });
        },

        after: function() {
                return this.domManip(arguments, false, function(elem){
                        this.parentNode.insertBefore( elem, this.nextSibling );
                });
        },

        end: function() {
                return this.prevObject || jQuery( [] );
        },

        // For internal use only.
        // Behaves like an Array's method, not like a jQuery method.
        push: [].push,
        sort: [].sort,
        splice: [].splice,

        find: function( selector ) {
                if ( this.length === 1 ) {
                        var ret = this.pushStack( [], "find", selector );
                        ret.length = 0;
                        jQuery.find( selector, this[0], ret );
                        return ret;
                } else {
                        return this.pushStack( jQuery.unique(jQuery.map(this, function(elem){
                                return jQuery.find( selector, elem );
                        })), "find", selector );
                }
        },

        clone: function( events ) {
                // Do the clone
                var ret = this.map(function(){
                        if ( !jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this) ) {
                                // IE copies events bound via attachEvent when
                                // using cloneNode. Calling detachEvent on the
                                // clone will also remove the events from the orignal
                                // In order to get around this, we use innerHTML.
                                // Unfortunately, this means some modifications to
                                // attributes in IE that are actually only stored
                                // as properties will not be copied (such as the
                                // the name attribute on an input).
                                var html = this.outerHTML;
                                if ( !html ) {
                                        var div = this.ownerDocument.createElement("div");
                                        div.appendChild( this.cloneNode(true) );
                                        html = div.innerHTML;
                                }

                                return jQuery.clean([html.replace(/ jQuery\d+="(?:\d+|null)"/g, "").replace(/^\s*/, "")])[0];
                        } else
                                return this.cloneNode(true);
                });

                // Copy the events from the original to the clone
                if ( events === true ) {
                        var orig = this.find("*").andSelf(), i = 0;

                        ret.find("*").andSelf().each(function(){
                                if ( this.nodeName !== orig[i].nodeName )
                                        return;

                                var events = jQuery.data( orig[i], "events" );

                                for ( var type in events ) {
                                        for ( var handler in events[ type ] ) {
                                                jQuery.event.add( this, type, events[ type ][ handler ], events[ type ][ handler ].data );
                                        }
                                }

                                i++;
                        });
                }

                // Return the cloned set
                return ret;
        },

        filter: function( selector ) {
                return this.pushStack(
                        jQuery.isFunction( selector ) &&
                        jQuery.grep(this, function(elem, i){
                                return selector.call( elem, i );
                        }) ||

                        jQuery.multiFilter( selector, jQuery.grep(this, function(elem){
                                return elem.nodeType === 1;
                        }) ), "filter", selector );
        },

        closest: function( selector ) {
                var pos = jQuery.expr.match.POS.test( selector ) ? jQuery(selector) : null,
                        closer = 0;

                return this.map(function(){
                        var cur = this;
                        while ( cur && cur.ownerDocument ) {
                                if ( pos ? pos.index(cur) > -1 : jQuery(cur).is(selector) ) {
                                        jQuery.data(cur, "closest", closer);
                                        return cur;
                                }
                                cur = cur.parentNode;
                                closer++;
                        }
                });
        },

        not: function( selector ) {
                if ( typeof selector === "string" )
                        // test special case where just one selector is passed in
                        if ( isSimple.test( selector ) )
                                return this.pushStack( jQuery.multiFilter( selector, this, true ), "not", selector );
                        else
                                selector = jQuery.multiFilter( selector, this );

                var isArrayLike = selector.length && selector[selector.length - 1] !== undefined && !selector.nodeType;
                return this.filter(function() {
                        return isArrayLike ? jQuery.inArray( this, selector ) < 0 : this != selector;
                });
        },

        add: function( selector ) {
                return this.pushStack( jQuery.unique( jQuery.merge(
                        this.get(),
                        typeof selector === "string" ?
                                jQuery( selector ) :
                                jQuery.makeArray( selector )
                )));
        },

        is: function( selector ) {
                return !!selector && jQuery.multiFilter( selector, this ).length > 0;
        },

        hasClass: function( selector ) {
                return !!selector && this.is( "." + selector );
        },

        val: function( value ) {
                if ( value === undefined ) {                    
                        var elem = this[0];

                        if ( elem ) {
                                if( jQuery.nodeName( elem, 'option' ) )
                                        return (elem.attributes.value || {}).specified ? elem.value : elem.text;
                                
                                // We need to handle select boxes special
                                if ( jQuery.nodeName( elem, "select" ) ) {
                                        var index = elem.selectedIndex,
                                                values = [],
                                                options = elem.options,
                                                one = elem.type == "select-one";

                                        // Nothing was selected
                                        if ( index < 0 )
                                                return null;

                                        // Loop through all the selected options
                                        for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
                                                var option = options[ i ];

                                                if ( option.selected ) {
                                                        // Get the specifc value for the option
                                                        value = jQuery(option).val();

                                                        // We don't need an array for one selects
                                                        if ( one )
                                                                return value;

                                                        // Multi-Selects return an array
                                                        values.push( value );
                                                }
                                        }

                                        return values;                          
                                }

                                // Everything else, we just grab the value
                                return (elem.value || "").replace(/\r/g, "");

                        }

                        return undefined;
                }

                if ( typeof value === "number" )
                        value += '';

                return this.each(function(){
                        if ( this.nodeType != 1 )
                                return;

                        if ( jQuery.isArray(value) && /radio|checkbox/.test( this.type ) )
                                this.checked = (jQuery.inArray(this.value, value) >= 0 ||
                                        jQuery.inArray(this.name, value) >= 0);

                        else if ( jQuery.nodeName( this, "select" ) ) {
                                var values = jQuery.makeArray(value);

                                jQuery( "option", this ).each(function(){
                                        this.selected = (jQuery.inArray( this.value, values ) >= 0 ||
                                                jQuery.inArray( this.text, values ) >= 0);
                                });

                                if ( !values.length )
                                        this.selectedIndex = -1;

                        } else
                                this.value = value;
                });
        },

        html: function( value ) {
                return value === undefined ?
                        (this[0] ?
                                this[0].innerHTML.replace(/ jQuery\d+="(?:\d+|null)"/g, "") :
                                null) :
                        this.empty().append( value );
        },

        replaceWith: function( value ) {
                return this.after( value ).remove();
        },

        eq: function( i ) {
                return this.slice( i, +i + 1 );
        },

        slice: function() {
                return this.pushStack( Array.prototype.slice.apply( this, arguments ),
                        "slice", Array.prototype.slice.call(arguments).join(",") );
        },

        map: function( callback ) {
                return this.pushStack( jQuery.map(this, function(elem, i){
                        return callback.call( elem, i, elem );
                }));
        },

        andSelf: function() {
                return this.add( this.prevObject );
        },

        domManip: function( args, table, callback ) {
                if ( this[0] ) {
                        var fragment = (this[0].ownerDocument || this[0]).createDocumentFragment(),
                                scripts = jQuery.clean( args, (this[0].ownerDocument || this[0]), fragment ),
                                first = fragment.firstChild;

                        if ( first )
                                for ( var i = 0, l = this.length; i < l; i++ )
                                        callback.call( root(this[i], first), this.length > 1 || i > 0 ?
                                                        fragment.cloneNode(true) : fragment );
                
                        if ( scripts )
                                jQuery.each( scripts, evalScript );
                }

                return this;
                
                function root( elem, cur ) {
                        return table && jQuery.nodeName(elem, "table") && jQuery.nodeName(cur, "tr") ?
                                (elem.getElementsByTagName("tbody")[0] ||
                                elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
                                elem;
                }
        }
});
