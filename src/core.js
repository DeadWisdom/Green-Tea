/** Tea
    
    Complex UI framework based on jQuery.

    Copyright (c) 2008 Brantley Harris. All rights reserved.
 **/

var Tea = {root: ''};

/** Tea.require(...)
    Imports the given arguments by appending <script> or <style> tags to the head.
    Note: Perhaps it is too obvious: but importing is done relative to the page we're on.
    Note: The required script is loaded sometime AFTER the requiring script, so you can't use
          the provided namespace (functions and variables) right away.
    
    arguments:
        Strings of urls to the given resource.  If the string ends with .css, it is added with
        a <style> tag; if it's a .js, it is added with a <script> tag.
 **/
Tea.require = function()
{
	for(var i=0; i < arguments.length; i++)
	{
		var src = Tea.root + arguments[i];
		if (Tea.require.map[src])
			return;
		Tea.require.map[src] = true;
		try {
			extension = src.match(/.*?\.(js|css)/i)[1];
		} catch(e) { throw "Can only import .css or .js files, not whatever this is: " + src; }
		if (extension == 'js')
			document.write('<script type="text/javascript" src="' + src + '"></script>\n');
		else if (extension == 'css')
			document.write('<link rel="stylesheet" href="' + src + '" type="text/css"/>\n');
	}
}
Tea.require.map = {}

jQuery.fn.be = function(type, options)
{
    var options = options || {};
    options.source = this;
    if (typeof type == 'string') type = Tea.getClass(type);
    var obj = new type(options);
    obj.render();
    return obj;
}

// Classes //////////
Tea.classes = {};

/** Tea.registerClass(name, type)
    Registeres a class with Tea, so that it can be found by name.
    
    name:
        Name of the class.
        
    type:
        The class.
 **/
Tea.registerClass = function(name, type) { Tea.classes[name] = type }

/** Tea.getClass(name)
    Returns a class with the given name.
 **/
Tea.getClass = function(cls)
{ 
    if (jQuery.isFunction(cls)) return cls;
    return Tea.classes[cls];
}

/** Tea.isInstance(instance, cls)
    If instance is an instance of cls, then we return true, otherwise false.
 **/
Tea.isInstance = function(instance, cls)
{
    if (!cls.prototype) return false;
    
    for(var p = cls.prototype; p.supertype; p = p.supertype)
        if (p.constructor == cls)
            return true;
    
    return false;
}


/** Tea.overrideMethod(super_function, function)
    Creates a callback that when run, provides a {{{__super__}}} on *this* which points to 
    {{{super_function}}}, and then runs {{{func}}}.  A great way to do inheritance.
 **/
Tea.overrideMethod = function(super_func, func)
{
    return function()
    {
        this.__super__ = function() { return super_func.apply(this, arguments) };
        var r = func.apply(this, arguments);
        delete this.__super__;
        return r;
    }
}

/** Tea.manifest(obj)
 **/
Tea.manifest = function(obj)
{
    if (search_space == null) search_space = Tea.classes;
    if (typeof obj == 'string') {
        cls = Tea.getClass(obj);
        if (!cls) { throw new Error("Unable to find class: " + obj); }
        obj = cls;
    }
    if (jQuery.isFunction(obj)) return new obj();
    if (obj.constructor != Object) return obj;
    
    var cls = obj.type;
    if (typeof cls == 'string')
        cls = search_space[cls];
    if (!cls) 
    {
        throw new Error("Unable to instantiate object: " + cls);
    }
    return new cls(obj);
}

/** Tea.extend(receiver, donator)
    
    Very much like jQuery.extend(receiver, donator), except that it will 
    combine functions to be able to use __super__().
 **/

Tea.extend = function(receiver, donator) {
    $.each(donator, function(k, d) {
        var r = receiver[k];
        if (jQuery.isFunction(d) && jQuery.isFunction(r)) {
            receiver[k] = Tea.overrideMethod(r, d);
        } else {
            receiver[k] = d;
        }
    });
}

/** Tea.extender(object)
    
    A Tea.Extender is a basic javascript class that encapsulates an object
    such that when it is extended via Tea.extend(), it will not replace
    the value, as normal, but rather "extend" the value.  So if we imagine a 
    class:

        A = Tea.Class('A', {
            list: [1, 2, 3]
        })
        
    By extending, B will replace the value of list to [4, 5, 6]:
    
        B = A.extend('B', {
            list: [4, 5, 6]  // B.prototype.list == [4, 5, 6]
        })
        
    However, if we make A thusly:
        
        A = Tea.Class('A', {
            list: Tea.extender([1, 2, 3])
        })
        
    Now, by extending, B will not replace but concatenate, making "list"
    be [1, 2, 3, 4, 5, 6]:
    
        B = A.extend('B', {
            list: [4, 5, 6]  // B.prototype.list == [1, 2, 3, 4, 5, 6]
        })
        
    This can be done with 
 **/
 
Tea.extender = function(object) {
    return new Tea.Extender(object);
}
 
Tea.Extender = function(object)
{
    this.type = this.getType(object);
    this.object = object;
}

Tea.Extender.prototype = {
    join : function(other) {
        var type;
        
        if (other == undefined) {
            return this.object;
        } else if (other instanceof Tea.Extender) {
            type = other.type;
            other = other.object;
        } else {
            type = this.getType(other);
        }
        
        if (type == null) return this.object;
        if (type == this.type && this.joiners[type])
            return this.joiners[type](this.object, other);
        return other;
    },
    getType : function(object)
    {
        if (jQuery.isFunction(object))
            return Function;
        if (object instanceof Array)
            return Array;
        if (object instanceof Object)
            return Object;
        return null;
    },
    joiners: {
        Function : function(a, b) {
            return Tea.overrideMethod(a, b);
        },
        Array : function(a, b) {
            a.push.apply(a, b);
            return a;
        },
        Object : function(a, b) {
            return Tea.extend(a, b);
        }
    }
}

//(function() {
    var _prototype = false;
    var _creating = false;
    
    /** Tea.createInstance(cls, args)
        
        Create a new instance with the class and args.  Normally, you would
        use cls(arg1, arg2, ..., argN)
     **/
    
    Tea.createInstance = function(cls, args)
    {
        _creating = true;
        var instance = new cls();
        _creating = false;
        
        instance.constructor = cls;
        
        if (_prototype) return instance;
        instance.__init__.apply(instance, args);
        instance.init.apply(instance, args);
        return instance;
    }
    
    /** Tea.extendClass(base, [name], properties)
    
        Extend the class "base" given the optional "name" and given the new
        properties to extend onto the prototype.  Normally you would use
        base.extend(name, properties)
     **/

    Tea.extendClass = function(base, name, properties)
    {
        if (properties == undefined && typeof name != 'string') {  // Name is optional
            properties = name; 
            name = null;
        }
        
        _prototype = true;
        var prototype = Tea.createInstance(base);
        _prototype = false;
    
        console.log(name, base, prototype, properties);
        if (name == 'Two') return;
    
        Tea.extend(prototype, properties);
        
        var cls = function() {
            if (_creating) return this;
            return Tea.createInstance(cls, arguments);
        }
        
        if (name)
            cls.toString = function() { return 'Tea.Class("' + name + '", ...)' };
        else
            cls.toString = function() { return "Tea.Class(...)" };
        cls.toSource = cls.toString;
        
        cls.prototype = null;
        
        cls.extend = function(name, properties) {
            return Tea.extendClass(cls, name, properties);
        }
        
        cls.prototype = prototype;
        cls.__name__ = name;
        cls.__super__ = base;
        
        if (name)
            Tea.registerClass(name, cls);
        
        return cls;
    }

    /** Tea.Object

        Base object that allows class/subclass behavior, events, and a regard for 
        "options".
     **/
    Tea.Object = function() {
        if (_creating) return this;
        return Tea.createInstance(cls, arguments);
    }
//})();

/** Tea.Class([name], properties)
    
    Extend Tea.Object by a new class.  This is synonymous with 
    Tea.Object.extend(name, properties) or 
    Tea.extendClass(Tea.Object, name, properties)
 **/
Tea.Class = Tea.Object.extend = function(name, properties) {
    return Tea.extendClass(Tea.Object, name, properties);
}

Tea.Object.toString = function() { return 'Tea.Class("object")' };
Tea.Object.toSource = Tea.Object.toString;
Tea.Object.__name__ = 'object';

Tea.Object.prototype = {
    options : Tea.extender({}),
    
    /** Tea.Object.__init__(options)
        
        Initializes the instance, setting the options.
    **/
    __init__ : function(options)
    {
        this.options = jQuery.extend({}, this.constructor.prototype.options);
        if (options)
            Tea.extend(this.options, options);
        jQuery.extend(this, this.options);
    },
    
    /** Tea.Object.init(options)
        
        This is not used by the internals of Tea, so that one can use it for
        final, user generated classes.  It is called after __init__.
    **/
    init : jQuery.noop,
    
    /** Tea.Object.toString()
        
        Returns a string representation of the object.
     **/
    toString : function()
    {
        return "<" + (this.constructor.name || "Tea.Object") + ">";
    },
    
    /** Tea.Object.bind(event, handler, [args])
        Binds an event for this instance to the given function which will be 
        called with the given args.
    
        event:
            An event name to bind.
    
        handler:
            The function to call when the event is triggered.
    
        args (optional):
            A list of arguments to pass into when calling the handler.
     **/
    bind : function(event, handler, args)
    {
        if (!this.__events) this.__events = {};
        if (!this.__events[event]) this.__events[event] = [];
        this.__events[event].push([handler, args]);
    },
    
    /** Tea.Object.prototype.unbind(event, [handler])
        Unbinds an events from this instance.  If a handler is given, only 
        events pointing to that handler are unbound.  Otherwise all handlers 
        for that event are unbound.
    
        event:
            An event name to unbind.
    
        handler:
            Only events pointing the given handler are unbound.
     **/
    unbind : function(event, handler) { 
        if (!this.__events) return;
        var handlers = this.__events[event];
        if (!handlers) return;
        if (handler) {
            jQuery.each(handlers, function(i, v) {
                if (v == handler) {
                    handlers.splice(i, 1);
                }
            });
        } else {
            delete this.__events[event];
        }
    },
    
    hook : function(other, event, handler)
    {
        
    },
    
    unhook : function()
    {
        
    },
    
    /** Tea.Object.prototype.trigger(name)
    
        event:
            The event name to trigger.
        
        args:
            Arguments to pass onto the function.  These go after
            any arguments set in the bind().
     **/
    trigger : function(event, args) { 
        if (!this.__events) return;
        var handlers = this.__events[event];
        if (!handlers) return;
        if (!args) args = [];
        for(var i = 0; i < handlers.length; i++)
        {
            handlers[i][0].apply(this, (handlers[i][1] || []).concat(args));
        }
    }
};

Tea.registerClass('Tea.Object', Tea.Object);

/** Tea.Class(name, properties) !important
    Returns a new Class function with a defined prototype and options.
    
    Example:
    {{{
    App.Greeter = Tea.Class('App.Greeter', {
        options: {
           recipient : "world"
        },
        greet : function()
        {
            alert("Hello " + this.options.recipient + "!");
        }
    })
    
    >>> var greeter = new App.Greeter();
    >>> greeter.greet();
    Hello world!

    >>> var greeter = new App.Greeter({recipient: 'javascripter'});
    >>> greeter.greet();
    Hello javascripter!
    }}}
    
    See tests/test_core.js for more examples on usage.
 **/
Tea.Class = function() { return Tea.Object.extend.apply(this, arguments); }


/** Tea.Application
    Nice structured way to organize your app.  ready() is called when the page is ready, i.e. jQuery.ready.

    To setup the app, use .setup([properties]), where properties are extra properties to set on the object.
    
    Also note that any Tea.Application subclasses are immediately turned into singletons.
 **/
Tea.Application = Tea.Class('Tea.Application',
{
    __init__ : function(properties) {
        if (properties)
            $.extend(this, properties);
    },
    
    setup : function(properties)
    {
        if (properties)
            $.extend(this, properties);
            
        var self = this;
        $(function(){ self.ready.call(self) });
    },
    
    ready : function(properties) {}
})


// JSON ///////

/** Tea.toJSON( json-serializble )
    Converts the given argument into a JSON respresentation.
    
    If an object has a "toJSON" function, that will be used to get the representation.
    Non-integer/string keys are skipped in the object, as are keys that point to a function.
    
    json-serializble:
        The *thing* to be converted.
 **/
Tea.toJSON = function(o)
{
    if (JSON && JSON.stringify)
        return JSON.stringify(o);
    
    var type = typeof(o);

    if (o === null)
        return "null";

    if (type == "undefined")
        return undefined;
    
    if (type == "number" || type == "boolean")
        return o + "";

    if (type == "string")
        return Tea.quoteString(o);

    if (type == 'object')
    {
        if (typeof o.toJSON == "function") 
            return Tea.toJSON( o.toJSON() );
        
        if (o.constructor === Date)
        {
            var month = o.getUTCMonth() + 1;
            if (month < 10) month = '0' + month;

            var day = o.getUTCDate();
            if (day < 10) day = '0' + day;

            var year = o.getUTCFullYear();
            
            var hours = o.getUTCHours();
            if (hours < 10) hours = '0' + hours;
            
            var minutes = o.getUTCMinutes();
            if (minutes < 10) minutes = '0' + minutes;
            
            var seconds = o.getUTCSeconds();
            if (seconds < 10) seconds = '0' + seconds;
            
            var milli = o.getUTCMilliseconds();
            if (milli < 100) milli = '0' + milli;
            if (milli < 10) milli = '0' + milli;

            return '"' + year + '-' + month + '-' + day + 'T' +
                         hours + ':' + minutes + ':' + seconds + 
                         '.' + milli + 'Z"'; 
        }

        if (o.constructor === Array) 
        {
            var ret = [];
            for (var i = 0; i < o.length; i++)
                ret.push( Tea.toJSON(o[i]) || "null" );

            return "[" + ret.join(",") + "]";
        }
    
        var pairs = [];
        for (var k in o) {
            var name;
            var type = typeof k;

            if (type == "number")
                name = '"' + k + '"';
            else if (type == "string")
                name = Tea.quoteString(k);
            else
                continue;  //skip non-string or number keys
        
            if (typeof o[k] == "function") 
                continue;  //skip pairs where the value is a function.
        
            var val = Tea.toJSON(o[k]);
        
            pairs.push(name + ":" + val);
        }

        return "{" + pairs.join(", ") + "}";
    }
};

/** Tea.evalJSON(src)
    Evaluates a given piece of json source.
 **/
Tea.evalJSON = function(src)
{
    if (JSON && JSON.parse)
        return JSON.parse(src);
    return eval("(" + src + ")");
};

/** Tea.secureEvalJSON(src)
    Evals JSON in a way that is *more* secure.
**/
Tea.secureEvalJSON = function(src)
{
    if (JSON && JSON.parse)
        return JSON.parse(src);
    
    var filtered = src;
    filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
    filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    
    if (/^[\],:{}\s]*$/.test(filtered))
        return eval("(" + src + ")");
    else
        throw new SyntaxError("Error parsing JSON, source is not valid.");
};

/** Tea.quoteString(string)
    Returns a string-repr of a string, escaping quotes intelligently.  
    Mostly a support function for toJSON.

    Examples:
    {{{
    >>> jQuery.quoteString("apple")
    "apple"

    >>> jQuery.quoteString('"Where are we going?", she asked.')
    "\"Where are we going?\", she asked."
    }}}
 **/
Tea.quoteString = function(string)
{
    if (Tea.quoteString.escapeable.test(string))
    {
        return '"' + string.replace(Tea.quoteString.escapeable, function (a) 
        {
            var c = Tea.quoteString.meta[a];
            if (typeof c === 'string') return c;
            c = a.charCodeAt();
            return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
        }) + '"';
    }
    return '"' + string + '"';
};

Tea.quoteString.escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;

Tea.quoteString.meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
};

/** Tea.ajax(options, [overriding])
    Makes an ajax call to the given resource using jQuery.ajax.  Some options are
    automatically configured for you to make things easier.
    
    Tea.ajax will look up any Route with the name of the url you pass in.  The route's url is then
    replaced.  For instance if you had a route named 'document' that pointed to '/ajax/document/',
    you can use the options {url: 'document'}, which will then expand to: {url: '/ajax/document/'}.
    
    overriding:
        Shortcut to merge these overriding-options onto options.
 **/
Tea.ajax = function(options, overriding)
{
    var options = jQuery.extend({}, Tea._ajax_default, options, overriding);
    
    var error = options.error;
    options.error = function(response, status, e)
    {
        if (status == 'error')
        {
            console.group('Server Error');
            console.log(response.responseText);
            console.groupEnd();
        }
        
        if (jQuery.isFunction(error))
            return error.apply(options.context || window, context)
    }

    return jQuery.ajax(options);
}

Tea._ajax_default = {
    url: null,
    method: 'get',
    data: {},
    dataType: 'json',
    context: null,
    /*
    async: true,
    beforeSend: null,
    cache: false,
    complete: null,
    dataFilter: null,
    contentType: "application/x-www-form-urlencoded",
    global: true,
    ifModified: false,
    jsonp: null,
    password: null,
    processData: true,
    scriptCharset: null,
    timeout: null,
    username: null,
    xhr: null
    */
};
/** Tea.deselect()
    Quick function to do a global deselect of all text that can pop-up during dragging or the like.
 **/
Tea.deselect = function()
{
    if (document.selection)
        document.selection.empty();
    else if (window.getSelection)
        window.getSelection().removeAllRanges();
}

/** Tea.method(context, function)
    Creates a callback that, when run, calls the given function with the given context as 'this'.
    It is often used for binding callbacks for events and the like.
    
    Example:
    {{{
    var panel = new Tea.Panel({
        onKeyup : function()
        {
            console.log("Recieved keypress.");
        }
    });
    
    $(window).keyup( Tea.method(panel.onKeyup, panel) );
    }}}
 **/
Tea.method = function(func, context)
{
    return function() {
        return func.apply(context, arguments);
    }
}

/** Tea.latent(milliseconds, func, context)
    Calls the given function {{{func}}} after the given {{{milliseconds}}} with
    a {{{this}}} of {{{context}}}.
    
    The function returned is a wrapper function.  When it is called, it waits 
    for the specified {{{milliseconds}}} before actually being run.  Also, if
    it is waiting to run, and is called again, it will refresh its timer.
    This is great for things like auto-complete, where you want to cancel and
    refresh the timer every time a key is hit
    
    You can easily bind a latent to an event, the following code will run 
    the method "onKeyup" on "this" 300 milliseconds after the last keyup event 
    of a series:
    
    {{{ $(window).keyup( Tea.latent(300, this.onKeyup, this) )}}}
    
    The function returned also provides a few extra methods on the function,
    itself:
    
    {{{.cancel()}}} - Cancels the timer.
    
    {{{.refresh([milliseconds])}}} - Refreshes the timer, and optionally resets the
    {{{milliseconds}}}.
    
    Example:
    {{{
    function hello() {
        this.log("Hello World!");
    }
    
    hello = latent(hello, console, 1000);
    hello();
    hello();
    hello();
    
    // After 1 second: "Hello World!"
    
    hello();
    hello.cancel();
    
    // Nothing...
    
    hello.refresh(1000);
    
    // After 1 second: "Hello World!"
    
    hello();
    
    // After 1 second: "Hello World!"
    }}}
 **/
 
Tea.latent = function(milliseconds, func, context)
{
    var timeout = null;
    var args = null;
    context = context || this;
    
    function call()
    {
        clearTimeout(timeout);
        timeout = null;
        func.apply(context, args);
    }
    
    function refresh(new_milliseconds)
    {
        milliseconds = new_milliseconds || milliseconds;
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(call, milliseconds)
    }
    
    function cancel()
    {
        if (timeout)
            clearTimeout(timeout);
        timeout = null;
    }
    
    var self = function()
    {
        args = arguments;
        refresh();
    }
    
    self.call = call;
    self.refresh = refresh;
    self.cancel = cancel;
    
    return self;
}