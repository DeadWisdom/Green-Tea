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
        a <style> tag; if it's a .js, it is added with a <script> tag.  If the string is in 
        Tea.
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
    if (typeof cls == 'function') return cls;
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


Tea.manifest = function(obj, search_space)
{
    if (search_space == null) search_space = Tea.classes;
    if (typeof obj == 'string') return new search_space[obj]();
    if (typeof obj == 'function') return new obj();
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

/** Tea.Object
    Base object that allows class/subclass behavior, events, and a regard for "options".
    
    Tea.Class(name, properties) is a synonym for: Tea.Object.subclass(name, properties)
 **/
Tea.Object = function() { this.__init__.apply(this, arguments); }
Tea.registerClass('Tea.Object', Tea.Object);

Tea.Object.prototype.__init__ = function(options) { 
    Tea.Object.setOptions(this, options)
    if (this.onInit)
        this.onInit.apply(this, arguments);
};

// Options
/** Tea.Object.setOptions(instance, options)
    Sets the options of the instance, using the instance's constructor's options as a base.
    Note: this is a classmethod, not on the instance.
 **/
Tea.Object.setOptions = function(instance, options) { instance.options = jQuery.extend({}, instance.constructor.prototype.options, options) };

// Subclassing
Tea.Object.__subclass__ = function(base, name, extra)
{
    if (extra == undefined && typeof name != 'string')              // Name is optional
        { extra = name; name = null }
    
    var sub = function() { 
        if (typeof(this.__init__) != 'function')
            throw "You probably tried to create a Tea object without using the 'new' keyword.  e.g. var object = Tea.Object() should be var object = new Tea.Object()."
        
        this.__init__.apply(this, arguments); 
    }  // Constructor.
    jQuery.extend(sub.prototype, base.prototype, extra);            // Extend the subclass by the base and the extra object.
    for(k in base.prototype)
    {
        if (typeof(base.prototype[k]) == 'function' && typeof(sub.prototype[k]) == 'function')
        {
            sub.prototype[k] = Tea.overrideMethod(base.prototype[k], sub.prototype[k]);
        }
    }
    
    sub.supertype = base.prototype;                                 // Set the supertype
    sub.prototype.options =
        jQuery.extend({}, base.prototype.options, extra.options);   // Extend the prototype options, specifically
    
    /** Tea.Object.subclass(name, properties)
        Creates a subclass of the class, copying over prototype properties and options.
     **/
    sub.subclass = function(name, inner_extra)
    {
        return sub.__subclass__(sub, name, inner_extra);
    }
    
    /** Tea.Object.extend(interface)
        Copies over the properties and options of the interface to this class.
     **/
    sub.extend = function(interface)
    {
        if (interface.prototype)
            interface = interface.prototype;
            
        var options = sub.prototype.options;
        jQuery.extend(sub.prototype, interface);
        if (interface.options)
            sub.prototype.options = jQuery.extend(options, interface.options);
        return sub;
    }
    
    sub.extendClass = function(interface)
    {
        jQuery.extend(sub, interface);
        return sub;
    }
    
    if (name)                                                       // If we have a name, register with that name
    {
        Tea.registerClass(name, sub);
        sub.id = name || 'unnamed';              //Used to call this .name, but Safari didn't like it... For some reason.
    }
    
    sub.__subclass__ = base.__subclass__;
    
    return sub;
}
Tea.Object.subclass = function(name, extra) { return Tea.Object.__subclass__(Tea.Object, name, extra) }

/** Tea.Object.prototype 
    All object instances have these functions:
 **/

/** Tea.Object.prototype.setOptions(instance, options)
    Sets the options of the instance, using the instance's constructor's options as a base.
 **/
Tea.Object.prototype.toString = function()
{
    return "<" + this.constructor.id + ">";
},
Tea.Object.prototype.options = {};

/** Tea.Object.prototype.bind(types, handler, [args])
    Binds one or many events to this instance to the given function which will be called with the given args.
    
    types:
        A list of strings, or one string of events to bind.
    
    handler:
        The function to call when the event is triggered.
    
    args (optional):
        A list of arguments to pass into when calling the handler.
 **/
Tea.Object.prototype.bind = function(types, handler, args) { return jQuery.event.add(this, types, handler, args) };

/** Tea.Object.prototype.unbind(types, [handler])
    Unbinds one or many events from this instance.  If handler is given, only events pointing to that
    handler are unbound.
    
    types:
        A list of strings, or one string of events to unbind.
    
    handler:
        Only events pointing the given handler are unbound.
 **/
Tea.Object.prototype.unbind = function(types, handler) { jQuery.event.remove(this, types, handler) };

/** Tea.Object.prototype.trigger(...)
    Triggers all of the events given as arguments.
    
    arguments:
        A series of event-names as strings.
 **/
Tea.Object.prototype.trigger = function() { 
    var args = Array.prototype.slice.call(arguments);
    var type_or_event = args.shift();
    
    if (typeof type_or_event.type == 'string')
        event = type_or_event;
    else
        event = new jQuery.Event(type_or_event);
    
    args.splice(0, 0, event);
    
    jQuery.event.trigger(event, args, this, true);
};  

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
Tea.Class = function() { return Tea.Object.subclass.apply(this, arguments); }


/** Tea.Application
    Nice structured way to organize your app.  init() is called when the page is ready, i.e. jQuery.ready.

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

// Routes ////////
Tea.routes = {};

/** Tea.getRoute(name)
    Returns the url of a named route.

    name:
        Name of the route.
 **/
Tea.getRoute = function(name)
{
    return Tea.routes[name];
}

/** Tea.route([name, url] | object)
    Creates a route, or named url, that can be used in ajax calls rather than the full url.
    
    name:
        Name of the route.
        
    url:
        Url to point to.
        
    object:
        A mapping of {name: url}.
 **/
Tea.route = function(name, url)
{
    if (typeof name == 'object')
        jQuery.extend(Tea.routes, name);
    else
        Tea.routes[name] = url;
}


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

/** Tea.ajax(options)
    Makes an ajax call to the given resource using jQuery.ajax.  Some options are
    automatically configured for you to make things easier.
    
    Tea.ajax will look up any Route with the name of the url you pass in.  The route's url is then 
    replaced.  For instance if you had a route named 'document' that pointed to '/ajax/document/',
    you can use the options {url: 'document'}, which will then expand to: {url: '/ajax/document/'}.
    
    For callbacks, one can either over-ride 'callback' or, if either 'success' or 'failure' is given, 
    Tea will check the response object for a '__failure__' property.  If there, 'failure' will be
    called.  If not there, 'success' will be called.
    
    options:
        Everything that jQuery.ajax <http://docs.jquery.com/Ajax/jQuery.ajax#options> takes and:
        post:
            If post is an object, the method will be set to 'post' and this will be used for the data.
        get:
            If get is an object, the method will be set to 'get' and this will be used for the data.
        dataType:
            Tea defaults this to 'json', to get raw textual data back use 'raw'.
        success:
            A callback matching the signature 'function(response)' when the response succeeds.
        failure:
            A callback matching the signature 'function(response)' when the response fails.
    
    overriding:
        Shortcut to merge these overriding-options onto options.
 **/
Tea.ajax = function(options, overriding)
{
    var options = jQuery.extend({}, Tea._ajax_default, options, overriding);
    
    var route = Tea.getRoute(options.url);
    if (route)
        options.url = route;
    
    if (options.post) { options.method = 'post'; options.data = options.post; }
    else if (options.get) { options.method = 'get'; options.data = options.get; }
    
    var success = options.success;
    var failure = options.failure;
    var invalid = options.invalid;
    var scope = options.scope;
    
    options.success = function(response)
    {   
        if (response && response.__errors__ && invalid) {
            return invalid.call(scope, response);
        }
        
        if (success)
            return success.call(scope, response);
    }
    
    if (failure)
        options.error = function(response)
        {
            return failure.apply(scope);
        }/*
    else
        options.error = function(response)
        {
            console.group('Server Error');
            console.log(response.responseText);
            console.groupEnd();
        }*/
        
    options.type = options.method;
    
    delete options.method;
    delete options.scope;
    return jQuery.ajax(options);
}

Tea._ajax_default = {
    url: null,
    method: 'get',
    data: {},
    dataType: 'json',
    scope: null,
    
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

/** Tea.metronome(milliseconds, func, context)
    Calls the given function {{{func}}} after the given {{{milliseconds}}} with
    a {{{this}}} of {{{context}}}.
    
    The function returned is a wrapper function.  When it is called, it waits 
    for the specified {{{milliseconds}}} before actually being run.  Also, if
    it is waiting to run, and is called again, it will refresh its timer.
    This is great for things like auto-complete, where you want to cancel and
    refresh the timer every time a key is hit
    
    You can easily bind a metronome to an event, the following code will run 
    the method "onKeyup" on "this" 300 milliseconds after the last keyup event 
    of a series:
    
    {{{ $(window).keyup( Tea.metronome(300, this.onKeyup, this) )}}}
    
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
    
    hello = metronome(hello, console, 1000);
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
 
Tea.metronome = function(milliseconds, func, context)
{
    var timeout = null;
    var args = null;
    
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