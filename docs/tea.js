/////////////////////////////////////////////////////////////// src/core.js //
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
    setup : function(properties)
    {
        if (properties)
            $.extend(this, properties);
            
        var self = this;
        $(function(){ self.init.call(self) });
    },
    
    init : function(properties) {}
})

Tea.Application.subclass = function(name, extra) { 
    var cls = Tea.Object.__subclass__(Tea.Application, name, extra);
    return new cls();
}


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
    var context = options.context;
    
    options.success = function(response)
    {   
        if (response && response.__errors__ && invalid) {
            return invalid.call(context, response);
        }
        
        if (success)
            return success.call(context, response);
    }
    
    if (failure)
        options.error = function(response)
        {
            return failure.apply(context);
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
    delete options.context;
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

//////////////////////////////////////////////////////////// src/element.js //
/** Tea.Element
    Represents a basic ui element.
    Elements have sources, a jQuery expression that points to specific DOM elements.
    Elements have a skin, which builds the DOM element, and handle DOM element specific logic.
    Elements can have parents.
    
    @requires Tea
    
    options:
        source:
            A jQuery element that serves as the base for manipulating the object.  In the case 
            of a string or dom element, it is run through the jQuery ($) function.
 **/
Tea.Element = Tea.Class('Tea.Element', {
    options: {
        source: '<div/>',               // Source of the element.
        skin: null,                     // The element skin.
        hidden: false,
        behaviors: [],
        attrs: {},
        bind: {},
    },
    __init__ : function(options) {
        this.__super__(options);
        this.parent = null;
        this.source = null;
        
        var skin = this.options.skin;
        if (typeof skin == 'string')
            this.skin = new (Tea.getClass(skin))(this);
        else if (typeof skin == 'function')
            this.skin = new skin(this);
        else if (skin == null)
        {
            var skinCls = null;
            var cls = this.constructor;
            while(!skinCls && cls && cls != Tea.Object)
            {
                skinCls = Tea.classes[cls.id + '.Skin'];
                cls = cls.supertype.constructor;
            }
            
            if (skinCls)
                this.skin = new skinCls(this);
            else
                throw new Error("Element.options.skin is set to null, but no skin can be found.");
        }
        else
            throw new Error("Element.options.skin must be set to null, a function, or a string which cooresponds to a Skin class.");
    },
    render : function(source) {
        if (this.source) return this.source;
        
        if (source)
            this.source = this.skin.render($(source));
        else
            this.source = this.skin.render();
        
        if (this._latentBinds)
            for (var i in this._latentBinds)
                this.addEventListener.apply(this, this._latentBinds[i]);
            
        if (this.options.bind)
            for(var k in this.options.bind)
                this.bind(k, Tea.method(this.options.bind[k], this.options.context || this));
        
        var behaviors = this.options.behaviors;
        if (behaviors && behaviors.length > 0)
            for(var i = 0; i < behaviors.length; i++)
                this.addBehavior(behaviors[i]);
        
        this.onRender();
        
        return this.source;
    },
    onRender : function()
    {},
    remove : function()  // Remove from element's parent and source's parent
    {
        if (this.parent)
            this.parent.remove(this);
        else
            this.source.remove();
            
        this.trigger('remove', this, this.parent);
    },
    addEventListener : function(type, handle)    // For events, binds any dom events to the source.
    {
        if (!this.source)
        {
            if (!this._latentBinds)
                this._latentBinds = [];
            return this._latentBinds.push([type, handle]);
        }
        
        for(var i = 0; i < this.source.length; i++)
        {
            var elem = this.source[i];
        
    		if (elem.addEventListener)
    			elem.addEventListener(type, handle, false);
    		else if (elem.attachEvent)
    			elem.attachEvent("on" + type, handle);
    	}
    },
    addBehavior : function(b)
    {
        Tea.manifest(b).attach(this);
    },
    hide : function()
    {
        this.setHidden(true);
    },
    show : function()
    {
        this.setHidden(false);
    },
    setHidden : function(flag)
    {
        if (this.source)
            this.skin.setHidden(flag);
        else
            this.options.hidden = flag;
    }
});

Tea.Element.Skin = Tea.Object.subclass('Tea.Element.Skin', {
    options : {
        
    },
    __init__ : function(element)
    {
        this.__super__();
        this.element = element;
    },
    render : function(source) {
        var element = this.element;
        var options = element.options;
        var source  = this.source = element.source = $(source || options.source);
        
        if (options.id)         source.attr('id', options.id);
        if (options.cls)        source.addClass(options.cls);
        if (this.options.cls)   source.addClass(this.options.cls);
        if (options.html)       this.setHTML(options.html);
        
        if (options.attrs)
            for(a in options.attrs)
                source.attr(a, options.attrs[a]);
        
        if (options.style)
            for(var i in options.style)
                source.css(i, options.style[i]);
        
        if (options.hidden)
            source.hide();
        
        return source;
    },
    remove : function() {
        this.source.remove();
    },
    setHTML : function(src)
    {
        this.source.empty().append(src);
    },
    setHidden : function(flag)
    {
        if (flag)
            this.source.hide();
        else
            this.source.show();
    }
})

////////////////////////////////////////////////////////// src/container.js //
/** Tea.Container
    
    An element that contains other elements.
    
    @requires Tea.Element
    
    More comments.
 **/

Tea.Container = Tea.Element.subclass('Tea.Container', {
    options: {
        items: null
    },
    __init__ : function(options)
    {
        this.items = [];
        this.__super__(options);
        
        var items = this.options.items || [];
        
        if (items.constructor === Array)
            for (var i = 0; i < items.length; i++) this.append(items[i]);
        else
            this.append(items);
    },
    /** Tea.Container.own(item)
        
        Owns the <item>, asserting that <item.parent> points to <this>.
    **/
    own : function(item)
    {
        if (item.constructor === Object)
        {
            var cls = Tea.classes[item.type];
            if (!cls && this.classes)
                cls = this.classes[item.type];
            if (!cls)
                throw new Error("Attempt to add to this container, an Object instance with no valid type: " + item.type);
            
            item = new cls(item);
        }
        
        if (item.parent)
            item.remove();
            
        item.parent = this;
        
        return item;
    },
    append : function(item)
    {
        item = this.own(item);
        
        item._index = this.items.length;
        this.items.push(item);
        
        if (this.source)
            this.skin.append(item.render());
        
        return item;
    },
    insert : function(pos, item)
    {
        if (typeof pos != 'number') throw new Error("Recieved a non-number for the 'pos' argument in insert(pos, item).");
        
        if (pos >= this.items.length)
            return this.append(item);
        
        item = this.own(item);
        
        this.items.splice(pos, 0, item);
        
        for(var i=0; i < this.items.length; i++)
            this.items[i]._index = i;
        
        if (this.source)
        {
            if (item._index == 0)
                this.skin.prepend(item.render())
            else
                this.skin.after(this.items[item._index - 1].source, item.render());
        }
        
        return item;
    },
    prepend : function(item)
    {
        return this.insert(0, item);
    },
    remove : function(item)
    {
        if (!item) return Tea.Container.supertype.remove.call(this);   // Act as an element, remove this.
        if (item.parent !== this) return;
        
        this.items.splice(item._index, 1);
        if (item.source)
            item.skin.remove();
            
        item.parent = null;
        
        for(var i=0; i < this.items.length; i++)
            this.items[i]._index = i;
    },
    empty : function()
    {
        for(var i=0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.source)
                item.skin.remove();
            item.parent = null;
        }
        this.items = [];
    },
    clear : function()
    {
        for(var i=0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.source)
                item.skin.remove();
            item.parent = null;
        }
        this.items = [];
    },
    each : function(func, context)
    {
        if (context)
            jQuery.each(this.items, function() { func.apply(context, arguments) });
        else
            jQuery.each(this.items, func);
    }
})

Tea.Container.Skin = Tea.Element.Skin.subclass('Tea.Container.Skin', {
    render : function(source)
    {
        var source = Tea.Container.Skin.supertype.render.call(this, source);
        
        var items = this.element.items;
        for(var i=0; i < items.length; i++)
            this.append(items[i].render());
        
        return source;
    },
    onAddSource : function(src)
    {},
    append : function(src)
    {
        this.source.append(src);
        this.onAddSource(src);
    },
    prepend : function(src)
    {
        this.source.prepend(src);
        this.onAddSource(src);
    },
    after : function(pivot, src)
    {
        pivot.after(src);
        this.onAddSource(src);
    }
})

////////////////////////////////////////////////////////////// src/panel.js //
/** Tea.Panel

    A container that can may be closed, and may have a title bar, a top action bar, or a bottom action bar.
    
    @requires Tea.Container
 **/

Tea.Panel = Tea.Container.subclass('Tea.Panel', {
    options: {
        title: '',
        closable: false,
        top: null,
        bottom: null
    },
    setTitle : function(title)
    {
        this.title = title;
        if (this.source)
            this.skin.setTitle(title);
        else
            this.options.title = title;
    },
    getTitle : function()
    {
        return this.title;
    },
    close : function()
    {
        this.trigger('close');
    },
    focus : function() {
        this.skin.focus();
    },
    blur : function() {
        this.skin.blur();
    },
    hasFocus : function() {
        return this.skin.hasFocus();
    }
});

Tea.Panel.focus = null;

Tea.Panel.Skin = Tea.Container.Skin.subclass('Tea.Panel.Skin', {
    options: {
        cls: 't-panel'
    },
    render : function() {
        var element = this.element;
        
        this.content = $("<div class='t-content'/>");
        this.title = $("<div class='t-title'/>").append(element.options.title || '');

        var anchor = this.anchor = $("<a class='t-focuser' href='#'>&#160;</a>");        

        anchor.has_focus = false;
        this.anchor.bind('focus', function() { 
            anchor.has_focus = true; 
            element.source.addClass('t-focus'); 
            element.trigger('focus') 
            Tea.Panel.focus = element;
        });
        this.anchor.bind('blur', function() { 
            anchor.has_focus = false;
            element.source.removeClass('t-focus');
            element.trigger('blur')
            Tea.Panel.focus = null;
        });
        
        Tea.Panel.Skin.supertype.render.call(this);
        
        /*this.source.bind('mousedown', function(e)
        {
            if (!anchor.has_focus)
                anchor.focus();
            e.preventDefault(); // Kills the bluring of our anchor.
        })*/
        
        this.source.append(this.anchor);
        this.source.append(this.title);
        this.source.append(this.content);
        
        this.setBars(element.options.top, element.options.bottom);
        
        if (element.options.closable)
            this.closer = $("<div class='t-close t-icon CloseIcon'></div>")
                            .appendTo(this.title)
                            .click(function() { element.close() });
        
        return this.source;
        
    },
    setTitle : function(title)
    {
        this.title.empty().append(title);
    },
    setBars : function(top, bottom)
    {
        if (top) {
            this.top = new Tea.Container({cls: 't-bar t-top', items: top});
            this.top.panel = this.element;
            this.title.after(this.top.render());
        }
        if (bottom)
        {
            this.bottom = new Tea.Container({cls: 't-bar t-bottom', items: bottom});
            this.bottom.panel = this.element;
            this.content.after(this.bottom.render());
        }
    },
    append : function(src)
    {
        this.content.append(src);
    },
    prepend : function(src)
    {
        this.content.prepend(src);
    },
    setHTML : function(src)
    {
        this.content.empty().append(src);
    },
    focus : function()
    {
        if (!this.source)
        {
            var self = this;
            setTimeout(function() {
                self.anchor.focus();
            })
        }
        this.anchor.focus();
    },
    blur : function()
    {
        this.anchor.blur();
    },
    hasFocus : function() {
        return this.anchor.hasFocus;
    }
});

Tea.Panel.WindowSkin = Tea.Panel.Skin.subclass('Tea.Panel.WindowSkin',
{
    options: {
        cls: 't-window t-panel'
    }
})

///////////////////////////////////////////////////////////// src/dialog.js //
/** Tea.Dialog
    
    A Panel that displays itself over the ui to prompt the user.
    
    @requires Tea.Panel
 **/

Tea.Dialog = Tea.Panel.subclass('Tea.Dialog', {
    options: {
        placement: 'top',
        opacity: 1,
        easing: 'swing',
        speed: 'normal',
        appendTo: null,
        time: null
    },
    show : function()
    {
        if (!this.source)
            this.render();
        this.skin.show();
        return this.source;
    },
    hide : function()
    {
        this.skin.hide();
    }
})

Tea.Dialog.Skin = Tea.Panel.Skin.subclass('Tea.Dialog.Skin', {
    options: {
        cls: 't-dialog t-panel'
    },
    show : function()
    {
        var element = this.element;
        var source = this.source;
        source.appendTo(element.options.appendTo || document.body);
        
        source.show();
        source.css('opacity', 0);
        source.css('position', 'absolute');
        source.css('top', -source.height());
        source.css('left', $(document).width()/2 - source.width()/2);    
        if (element.options.placement == 'top')
            source.animate( {top: 20, 
                             opacity: element.options.opacity}, 
                            element.options.speed, element.options.easing);
        else if (element.options.placement == 'center')
            source.animate( {top: $(document).height()/2.5 - source.height()/2, 
                             opacity: element.options.opacity}, 
                            element.options.speed, element.options.easing );
             
        if (element.options.time)
        {
            var self = this;
            setTimeout(function(){ self.hide() }, element.options.time);
        }
    },
    hide : function()
    {
        var self = this;
        var source = this.source;
        source.fadeOut(this.element.options.speed, function() { source.remove() });
    }
})

/////////////////////////////////////////////////////////////// src/form.js //
/** Tea.Form
    
    Ajax and classic form creation and management.
    
    @requires Tea.Container
 **/

Tea.Form = Tea.Container.subclass('Tea.Form', {
    options: {
        url: null,
        success: null,
        callback: null,
        dataType: 'json',
        context: null,
        method: 'post',
        submit: null,
        focus: true,
        value: null,
        processor: null,
        upload: false,  // Uploading a file?
        type: 'ajax'    // classic, ajax, iframe
    },
    __init__ : function()
    {
        this.fields = {};
        
        Tea.Form.supertype.__init__.apply(this, arguments);
    },
    own : function( item )
    {
        item = Tea.Form.supertype.own.call( this, item );
        if (item.name)
            this.fields[item.name] = item;
        return item;
    },
    _submit : function(options)
    {   
        if (this.options.type == 'iframe')
        {
            this.trigger('submit');
            return true;
        }
        
        var data = {};
        
        this.each(function() { if (this.name) data[this.name] = this.getValue() });
        
        if (this.options.filter)
            data = this.options.filter.call(this.context || this, data);
        
        if (this.options.submit)
        {
            try {
                return this.options.submit.call(this.options.context || this, data);
            } catch(e) { 
                console.error(e);
                return false;
            }
        }
        
        var options = jQuery.extend({
            method: this.options.method,
            success: this.options.success,
            invalid: this.invalid,
            context: this.options.context || this,
            data: data,
            dataType: this.options.dataType,
            url: this.options.url
        }, options);
        
        Tea.ajax(options);
        
        return false;
    },
    submit : function(options)
    {
        return this.source.submit();
    },
    invalid : function(response)
    {
        this.setErrors(response.__invalid__);
    },
    setErrors : function(errors)
    {
        for(var key in errors)
        {
            if (this.fields[key])
                this.fields[key].setErrors(errors[key]);
        }
    },
    getErrors : function()
    {
        var gather = {};
        for(var key in this.fields)
            gather[key] = this.fields[key].getErrors();
        return gather;
    },
    clearErrors : function()
    {
        for(var key in this.fields)
            this.fields[key].clearErrors();
    },
    setValue : function(value)
    {
        for(var key in this.fields)
            if (value[key] != undefined)
                this.fields[key].setValue(value[key]);
    },
    getValue : function()
    {   
        var gather = {};
        for(var key in this.fields)
            gather[key] = this.fields[key].getValue();
        return gather;
    },
    validate : function()
    {
        return true;
    },
    focus : function()
    {
        for(var key in this.fields)
        {
            if (this.fields[key].name)
                return this.fields[key].source.focus();
        }
    }
});

Tea.Form.iframeCount = 0;
Tea.Form.Skin = Tea.Container.Skin.subclass('Tea.Form.Skin', {
    options: {
        cls: 't-form'
    },
    render : function(source)
    {
        var element = this.element;
        
        var source = source || $('<form/>').attr('method', element.options.method).attr('action', element.options.url || '.');

        if (element.options.upload)
            source.attr('enctype', "multipart/form-data");
            
        if (element.options.type == 'iframe')
        {
            var iframe = $('<iframe class="t-hidden" src="#" style="width:0;height:0;border:0px solid #fff;"/>');
            var id = "upload-iframe-" + (Tea.Form.iframeCount++);
            iframe.attr('name', id).attr('id', id);
            source.append(iframe);
            source.attr('target', id);
            iframe.bind('load', function()
            {
                var msg = $(iframe[0].contentDocument.body).html();
                element.options.success.call(element.options.context || element, msg);
                return true;
            });
        }
        
        source = Tea.Form.Skin.supertype.render.call(this, source);
        source.submit(function() { 
            if (!element.validate()) return false;
            if (element.options.type == 'classic') return true;
            
            return element._submit();
        });
        
        source.append('<input type="submit" style="display: none;"/>');
        
        if (element.options.value)
            element.setValue(element.options.value);
        
        return source;
    }
});

Tea.Field = Tea.Element.subclass('Tea.Field', {
    options: {
        name: null,
        value: null,
        label: null,
        skin: 'Tea.Field.Skin'
    },
    __init__ : function()
    {   
        Tea.Field.supertype.__init__.apply(this, arguments);
        
        this.name = this.options.name;
        this.type = this.options.type;
        this.label = this.options.label;
        this.model = (this.options.model ? Tea.getClass(this.options.model) : null);
        this.errors = null;
        this.field = null;
        this._value = null;
    },
    getField : function()
    {
        throw new Error("Abstract base class Tea.Field has no implimentation for getField().");
    },
    getLabel : function()
    {
        return jQuery('<label/>').append(this.options.label || this.name);
    },
    getValue : function()
    {
        var v = null;
        
        if (this.field)
            v = this.field.val();
        else
            v = this._value;
        
        if (this.model)
            return this.model.get( v );
        return v;
    },
    setValue : function(v)
    {   
        if (this.model)
            v = v.pk;
            
        if (this.field)
            this.field.val(v);
        this._value = v;
    },
    focus : function()
    {
        this.skin.focus();
    },
    blur : function()
    {
        this.skin.blur();
    },
    setErrors : function(error_list)
    {
        if (typeof error_list == 'string')
            error_list = [error_list];
            
        this.errors = error_list;
        this.source.addClass('t-error');
    },
    clearErrors : function()
    {
        this.source.removeClass('t-error');
    },
    getErrors : function()
    {
        throw new Error("Not Implimented.");
    },
    validate : function()
    {
        
    }
});

Tea.Form.prototype.classes = Tea.Field;

Tea.Field.Skin = Tea.Element.Skin.subclass('Tea.Field.Skin', {
    options : {
        cls: 't-field'
    },
    render : function() 
    {
        var element = this.element;
        
        this.label = element.label = element.getLabel();
        this.field = element.field = element.getField();
        
        Tea.Field.Skin.supertype.render.call(this);
        
        if (element._value)
            element.setValue(element._value);
        else if (element.options.value)
            element.setValue(element.options.value);
        
        if (this.label)
            this.source.append(this.label);
        this.source.append(this.field);
        
        if (element.options.hidden)
            this.source.hide();
        
        if (element.options.field_attrs)
            for(a in element.options.field_attrs)
                this.field.attr(a, element.options.field_attrs[a]);
        
        if (this._focus)
            this.field.focus();
        
        return this.source;
    },
    focus : function()
    {
        if (this.source)
            this.field.focus();
        else
            this._focus = true;
    },
    blur : function()
    {
        if (this.source)
            this.field.blur();
        else
            this._focus = false;
    }
})

Tea.Field.text = Tea.Field.subclass('Tea.Field.text', {
    getField : function() {  return $('<input type="text"/>').attr('name', this.name)  }
})

Tea.Field.hidden = Tea.Field.subclass('Tea.Field.hidden', {
    options: {
        hidden: true
    },
    getLabel : function() {  return null;  },
    getField : function() {  return $('<input type="hidden"/>').attr('name', this.name)  }
})

Tea.Field.password = Tea.Field.subclass('Tea.Field.password', {
    getField : function() {  return $('<input type="password"/>').attr('name', this.name)  }
})

Tea.Field.checkbox = Tea.Field.subclass('Tea.Field.checkbox', {
    getField : function() {  return $('<input type="checkbox"/>').attr('name', this.name)  },
    getValue : function() {  return this.field.attr('checked') },
    setValue : function(v) { return this.field.attr('checked', v ? 'checked' : '') }
})

Tea.Field.textarea = Tea.Field.subclass('Tea.Field.textarea', {
    getField : function() {  return $('<textarea/>').attr('name', this.name)  }
})

Tea.Field.static = Tea.Field.subclass('Tea.Field.static', {
    getField : function() {  return $('<div class="t-static"/>').attr('name', this.name)  },
    getValue : function()
    {
        var v = this._value;
        if (this.field) v = this.field[0].innerHTML; 
        
        if (this.model)
            return this.model.get( v );
        return v;
    },
    setValue : function(v)
    {
        if (this.model)
            v = v.pk;
        
        if (this.field) 
            this.field[0].innerHTML = v;
        this._value = v;
    }
})

Tea.Field.select = Tea.Field.subclass('Tea.Field.select', {
    getField : function() {
        this.choices = this.options.choices;
        var field = $('<select/>').attr('name', this.name);    
        
        this.values = {};
        this.indexes = {};
        for(var i = 0; i < this.choices.length; i++)
        {
            var display, value = this.choices[i];
            if (value.constructor === Array)
            {
                display = value[0];
                value = value[1];
            }
            else
            {
                display = value;
            }
            var option = $('<option>' + display + '</option>');
            field.append(option);
            this.values[i] = value;
            this.indexes[value] = i;
        }
        return field;
    },
    getValue : function()
    {
        var v;
        if (this.field)
            v = this.values[this.field[0].selectedIndex];
        else
            v = this.values[this._value];
        
        if (this.model)
            v = this.model.get( v ).getRef();
            
        return v;
    },
    setValue : function(v)
    {   
        if (v._model)
            v = v._pk;
            
        if (this.field)
            this.field[0].selectedIndex = this.indexes[v];
        
        this._value = this.indexes[v];
    }
})

Tea.Field.object = Tea.Field.subclass('Tea.Field.object', {
    options: {
        skin: null,
        delay: 340,
        minLength: 1,
        pool: null
    },
    getField : function() {
        this.timeout = null;
        
        this.search_item = $('<div class="t-item"></div>')
        this.search_item.icon = $('<div class="t-icon SearchIcon"/>').appendTo(this.search_item);
        this.search_item.input = $('<input type="text" class="t-name" autocomplete="no"/>').appendTo(this.search_item);
        
        var self = this;
        this.search_item.input.bind('keydown', function(e) { self.onKeyup(e) });
        this.search_item.input.bind('blur', function(e) { self.hideList() });
        this.search_item.input.bind('focus', function(e) { self.onChange() });
        
        var field = $('<div class="t-object t-medium">')
            .attr('name', this.name)
            .append(this.search_item);
        return field;
    },
    getValue : function()
    {
        return this.value;
    },
    setValue : function(v)
    {
        if (this.value_item)
            this.value_item.source.remove();
        
        if (v == null)
        {
            this.search_item.show();
            this.value = null;
            return;
        }
        
        var self = this;
        
        this.value = Tea.Model.get(v);
        this.value_item = this.value.getListItem({
            cls: 't-object-field-value',
            onDrop : function(item)
            {
                var value = item.getValue();
                if (value._model == 'auth.User' || value._model == 'auth.Group')
                {
                    self.setValue(value);
                }
            }
        });
        
        this.search_item.hide();
        this.field.append(this.value_item.render());
        this.value_item.show();
        this.value_item.source.bind('click', function()
        {
            self.setValue(null);
            self.search_item.input.focus();
        })
    },
    onKeyup : function(e)
    {
        var code = e.keyCode;
        var val = this.search_item.input.val();

        if (code == 38)    // Up
        {
            this.showList();
            this.list.hoverPrev();
            return e.preventDefault();
        }

        if (code == 40)    // Down
        {
            this.showList();
            this.list.hoverNext();
            return e.preventDefault();
        }

        if (code == 9 || code == 13)   // Tab || Return
        {
            this.showList();
            this.list.hoverSelect();
            return e.preventDefault();
        }

        if (code == 27)
        {
            this.hideList();
            e.stopPropagation();
            return e.preventDefault();
        }

        if (this.timeout) clearTimeout(this.timeout);
        
        var val = this.search_item.input.val();
        if (val.length < this.options.minLength)
            return this.hideList();
        
        var self = this;
        this.timeout = setTimeout( function(){ self.onChange(e) }, this.options.delay);
        return;
    },
    onChange : function(e)
    {       
        var term = this.search_item.input.val();
        if (term.length < this.options.minLength)
            return this.hideList();
            
        this.showList();
        
        this.list.resource.updateParams({term: term});
        this.list.refresh();
    },
    showList : function()
    {
        if (this.list)
            return this.list.show();
        
        if (!this.list)
        {
            this.pool = this.options.pool;
            
            this.list = new Tea.List({
                cls: 't-dropdown',
                value: this.options.pool,
                onSelect: function()
                {
                    try {
                        this.setValue(this.list.selected.getValue());
                    } catch(e) { console.error(e) }
                    this.hideList();
                },
                context: this
            })
            
            var dim = {
                w: this.field.width(),
                h: this.field.height()
            }
        
            var src = this.list.render()
                .appendTo(this.field)
                .css({
                    top: dim.h,
                    width: dim.w
                });
            
            var self = this;
            this.list.bind('value', function()
            {
                self.list.setHover(0);
            })
        }
        
        this.list.show();
    },
    hideList : function()
    {
        if (this.list)
            this.list.hide();
    }
})

Tea.Field.object.Skin = Tea.Field.Skin.subclass('Tea.Field.object.Skin', {
    options: {
        cls: 't-field t-object-field'
    }
})

//////////////////////////////////////////////////////////// src/dragetc.js //
/** Tea.Drag

    Dragging and dropping.
    
    @requires Tea
 **/

Tea.Drag = Tea.Class('Tea.Drag', {
    __init__ : function(options)
    {
        Tea.Drag.supertype.__init__.call(this, options);
        
        this.active = null;
        
        var self = this;
        $(document.body).mousemove(function(e) {
            if (self.active)
                self.active.update(e);
        });
        
        $(document.body).mouseup(function(e) {
            if (self.active)
                self.active.end(e);
        });
        
        this.overlay = $('.t-overlay');
        if (this.overlay.length == 0)
            this.overlay = $('<div class="t-overlay t-medium"/>').appendTo(document.body).hide();
            
        Tea.Drag = this;
    },
    init : function() {}
})

Tea.Drag.init = function()
{
    if (typeof Tea.Drag == 'function')
        new Tea.Drag();
}

Tea.Draggable = Tea.Class('Tea.Draggable', {
    options: {
        cls: null,
        ghost: null,
        threshold: 5,
        snapToCursor: true
    },
    attach : function(element)
    {
        Tea.Drag.init();
        
        var self = this;
        element.source.bind('mousedown', function(e) {
            if (element.options.drag_locked)
                return;
            
            Tea.Drag.active = self;
            self.origin = {left: e.clientX, top: e.clientY};            
            self.element = element;
            self.begun = false;

            // No idea why this works, but it allows events to continue durring the drag.
    		if (e.stopPropagation) e.stopPropagation();
    		if (e.preventDefault) e.preventDefault();
        });
    },
    createGhost : function(element)
    {
        var source = element.source;
        return source.clone()
          .css('opacity', .5)
          .appendTo(document.body)
          .css('position', 'absolute')
          .width(source.width())
          .height(source.height())
          .addClass('t-drag')
          .appendTo(Tea.Drag.overlay);
    },
    start : function(e)
    {
        this.ghost = this.createGhost(this.element);
        this.target = null;
        this.overlay = Tea.Drag.overlay;
        
        var offset = this.element.source.offset();
        this.delta = {
            top: this.origin.top - offset.top, 
            left: this.origin.left - offset.left
        }
        
        Tea.Drag.overlay.show();
        Tea.deselect();
        
        this.begun = true;
    },
    update : function(e)
    {   
        if (!this.begun)
        {
            var d1 = Math.abs(e.clientX - this.origin.left);
            var d2 = Math.abs(e.clientY - this.origin.top);
            if (d1 < this.options.threshold || d2 < this.options.threshold)
                return;
                
            this.start(e);
        }
        
        if (this.options.snapToCursor)
        {
            var left = e.clientX + 10;
            var top = e.clientY - this.ghost.height() / 2;
        }
        else
        {
            var left = e.clientX - this.delta.left;
            var top = e.clientY - this.delta.top;
        }
        
        Tea.Drag.overlay.css('left', left).css('top', top);
    },
    end : function(e)
    {   
        if (this.ghost)
            this.ghost.remove();
        
        if (this.target)
        {
            this.target.trigger('drop', this.element);
            if (this.target.options.onDrop)
                this.target.options.onDrop.call(this.target, this.element);
        }
        else
            this.element.trigger('drop-nowhere');
        
        Tea.Drag.overlay.hide();
        
        Tea.Drag.active = null;
    }
})

Tea.Droppable = Tea.Class('Tea.Droppable', {
    options: {
        accept: []
    },
    attach : function(element)
    {
        var cursor;
        
        var onMouseOver = function(e)
        {
            if (Tea.Drag.active)
            {
                cursor = element.source.css('cursor');
                element.source.css('cursor', 'move');
                
                Tea.Drag.active.target = element;
                
                if (e.stopPropagation) e.stopPropagation();
        		if (e.preventDefault) e.preventDefault();
            }
        };
        
        var onMouseOut = function(e)
        {
            if (cursor)
            {
                element.source.css('cursor', cursor);
                cursor = null;
            }
                
            if (Tea.Drag.active)
                Tea.Drag.active.target = null;
        }
        
        element.source.hover(onMouseOver, onMouseOut);
    }
})

/////////////////////////////////////////////////////////////// src/list.js //
/** Tea.List

    A container that lists content as Tea.ListItem elements.
    
    @requires Tea.Container
 **/

Tea.List = Tea.Container.subclass('Tea.List', {
    options: {
        template: null,
        itemCls: 'Tea.ListItem',
        value: null,
        onSelect: null,
        context: null
    },
    __init__ : function()
    {
        Tea.List.supertype.__init__.apply(this, arguments);
        
        this.value = [];
        this.selected = null;
        this.hover = null;
        this.template = null;
        
        if (this.options.template)
        {
            if (typeof this.options.template == 'string')
                this.template = new Tea.Template(this.options.template);
            else
                this.template = this.options.template;
        }
        
        if (this.options.value)
            this.setValue(this.options.value);
    },
    select : function( item )
    {
        if (this.selected)
            this.selected.setSelected(false);
        
        this.selected = item;
        this.selected.setSelected(true);
        
        this.trigger('select', item);
        
        if (this.options.onSelect)
            this.options.onSelect.call(this.options.context || this, item);
    },
    hoverNext : function()
    {   
        if (this.items.length == 0) return;
        
        if (this.hover == null)
            this.hover = 0;
        else
        {
            this.items[this.hover].setHover(false);
            this.hover += 1;
        }
            
        if (this.hover >= this.items.length)
            this.hover = this.items.length - 1;
        
        this.items[this.hover].setHover(true);
    },
    hoverPrev : function()
    {
        if (this.items.length == 0) return;
        
        if (this.hover == null)
            this.hover = this.items.length -1;
        else
        {
            this.items[this.hover].setHover(false);
            this.hover -= 1;
        }
        
        if (this.hover < 0)
            this.hover = 0;
            
        this.items[this.hover].setHover(true);
    },
    getHoverItem : function()
    {
        return this.items[this.hover];
    },
    hoverSelect : function()
    {
        this.select( this.getHoverItem() );
    },
    setHover : function(index)
    {
        if (this.hover != null)
        {
            if (this.hover == index) return;
            this.items[this.hover].setHover(false);
        }
        
        if (this.items.length == 0 || index == null) return this.hover = index;
        
        if (index >= this.items.length) index = this.items.length - 1;
        if (index < 0) index = 0;
        
        this.hover = index;
        this.items[this.hover].setHover(true);
    },
    createItem : function( value, options )
    {
        var item = null;
        
        options = jQuery.extend({}, options);
        options.list = this;
         
        if (this.template)
            options.template = this.template;
            
        if (typeof value.getListItem == 'function')
            return value.getListItem(options);
        
        var cls = value.__itemCls || this.options.itemCls;
        if (typeof cls == 'string')
            cls = Tea.getClass(cls);

        if (value != null && value != undefined)
            options.value = value;
        
        return new cls( options );
    },
    append : function( value, options )
    {
        this.value.push(value);
        return Tea.List.supertype.append.call(this, this.createItem( value, options ) );
    },
    insert : function(pos, value, options)
    {
        this.value.splice(pos, 0, value);
        return Tea.List.supertype.insert.call(this, pos, this.createItem( value, options ) );
    },
    prepend : function(value, options)
    {
        return this.insert(0, value, options);
    },
    setValue : function( value, keep_resource )
    {
        if (typeof value.load == 'function')
        {
            this.resource = value;
            this.refresh();
            if (this.options.loading)
                Tea.List.supertype.append.call(this, this.createItem( this.options.loading ) );
        }
        else
        {
            if (!keep_resource)
                this.resource = null;
            
            this.value = [];
            this.hover = null;
            this.clear();           // TODO: could be made more efficient by recycling existing items.
            
            for(var i = 0; i < value.length; i++)
                this.append(value[i]);
        }
        this.trigger('value', value);
    },
    getValue : function()
    {
        return this.value;
    },
    getResource : function()
    {
        return this.resource;
    },
    setResource : function(resource)
    {
        return this.resource = resource;
    },
    refresh : function()
    {
        if (!this.resource)
            return;
        
        this.resource.load({
            context: this,
            onLoad : function(v) { 
                this.setValue(v, true);
            }
        });
    }
})

Tea.List.Skin = Tea.Container.Skin.subclass('Tea.List.Skin', {
    options : {
        cls: 't-list'
    },
    render : function()
    {
        Tea.List.Skin.supertype.render.apply(this, arguments);
        
        var element = this.element;
        this.source.hover(function() {}, function() { element.setHover(element.selected ? element.selected._index : null) });
        
        return this.source;
    }
})

Tea.ListItem = Tea.Element.subclass('Tea.ListItem', {
    options: {
        skin: null,
        value: null,
        template: null,
        list: null,
    },
    __init__ : function()
    {
        Tea.ListItem.supertype.__init__.apply(this, arguments);
        
        this.template = null;
        this.value = null;
        this.list = null;
        this.selected = false;
        
        if (this.options.template)
            this.setTemplate(this.options.template);
            
        if (this.options.value)
            this.setValue(this.options.value);
            
        if (this.options.list)
            this.setList(this.options.list);
    },
    setList : function(list)
    {
        this.list = list;
        var me = this;
        this.bind('select', function()
        {
            list.select(me);
        })
    },
    setTemplate : function(template)
    {
        if (typeof template == 'string') template = new Tea.Template(template);
        this.template = template;
    },
    setValue : function(v)
    {
        this.value = v;
        if (this.source)
            if (this.template)
                this.skin.setValue( this.template.apply(v) );
            else if (this.value.options && this.value.options.template)
                this.skin.setValue( this.value.options.template.apply(v) );
            else
                this.skin.setValue( v );
    },
    setSelected : function(bool)
    {
        this.selected = bool;
        if (this.source)
            this.skin.setSelected(bool);
    },
    setHover : function(bool)
    {
        this.hover = bool;
        if (this.source)
            this.skin.setHover(bool);
    },
    getValue : function()
    {
        return this.value;
    },
    refresh : function()
    {
        this.setValue(this.value);
    },
    render : function()
    {
        Tea.ListItem.supertype.render.apply(this, arguments);
        
        if (this.selected)
            this.skin.setSelected(true);
            
        this.refresh();
        
        return this.source;
    }
})

Tea.ListItem.Skin = Tea.Element.Skin.subclass('Tea.ListItem.Skin', {
    options: {
        cls: 't-item'
    },
    render : function()
    {
        Tea.ListItem.Skin.supertype.render.call(this);
        
        var element = this.element;
        
        if (element._index % 2 == 0)
            this.source.addClass('t-even');
        else
            this.source.addClass('t-odd');
        
        this.source.bind('click', function() { element.trigger('select') });
        if (element.list)
            this.source.bind('mouseover', function() { element.list.setHover(element._index) });
        
        element.refresh();
        
        return this.source;
    },
    setValue : function(v)
    {
        this.source.empty();
        try {
            this.source.append(v);
        } catch (e) {
            console.error("Error setting value in Tea.ListItem [%r] - Tea.ListItem.Skin.setValue(%r): ", this, v);
            if (Tea._testing)
                throw e;
        }
    },
    setSelected : function(bool)
    {
        if (bool)
            this.source.addClass('t-selected');
        else
            this.source.removeClass('t-selected');
    },
    setHover : function(bool)
    {
        if (bool)
            this.source.addClass('t-hover');
        else
            this.source.removeClass('t-hover');
    }
})

/////////////////////////////////////////////////////////// src/resource.js //
/** Tea.Resource

    @requires Tea

    A remote resource.
 **/

Tea.Resource = Tea.Class('Tea.Resource', {
    options: {
        url: null,
        value: null,
        params: {},
        onLoad : null,
        context: null
    },
    __init__ : function()
    {
        Tea.Resource.supertype.__init__.apply(this, arguments);
        this.value = this.options.value;
        this.params = this.options.params;
    },
    load : function(options)
    {
        var opts = {
            success : function(value)
            {
                this.setValue(value);
                if (opts.onLoad)
                    opts.onLoad.call(options.context || this, this.value);
                this.trigger('load', this.value);
            },
            data: this.params,
            url: this.options.url
        }
        
        jQuery.extend(opts, options);
        opts.context = this;
        
        Tea.ajax(opts);
    },
    updateParams : function(params)
    {
        this.params = jQuery.extend({}, this.options.params, params);
    },
    setParams : function(params)
    {
        this.params = params;
    },
    getParams : function()
    {
        return this.params;
    },
    setValue : function(value)
    {
        this.value = value;
    },
    getValue : function()
    {
        return this.value;
    }
});

////////////////////////////////////////////////////////////// src/stack.js //
/** Tea.StackContainer

    A container that acts as a stack, showing only the top few elements.  Pushing elements onto the stack moves
    the existing elements to the left.
    
    @requires Tea.Container
    @extends Tea.Container
 **/

Tea.StackContainer = Tea.Container.subclass('Tea.StackContainer', {
    options: {
        columns: 3,
        space: 4
    },
    __init__ : function()
    {
        this.paused = 1;
        Tea.StackContainer.supertype.__init__.apply(this, arguments);
    },
    render : function(source)
    {
        var self = this;
        setTimeout(function() { self.refresh() }, 100);
        
        this.paused = 0;
        return Tea.StackContainer.supertype.render.call(this, source);
    },
    append : function( item )
    {
        return this.push( item );
    },
    insert : function( pos, item )
    {
        Tea.StackContainer.supertype.insert.call(this, pos, item);
        this.refresh( item );
    },
    /** Tea.StackContainer.push(item, after)
        
        Pushes the *item*.
        If *after* is specified, all items after it will be popped before
        pushing the *item*.
    **/
    push : function( item, after )
    {
        if (after)
        {
            this.pause();
            this.popAfter(after);
            this.play();
        }
        
        item = Tea.StackContainer.supertype.append.call(this, item);
        this.refresh( item );
    },
    pop : function( item )
    {
        if (item)
        {
            if (item.parent !== this) throw new Error("Popping an item that isn't in the Tea.StackContainer.");
            
            for(var i = item._index; i < this.items.length; i++)
            {
                if (this.items[i].source)
                    this.items[i].skin.remove();
                    
                item.parent = null;
            }
            
            this.items.splice(item._index, this.items.length - item._index);
        }
        else
        {
            var item = this.items[this.items.length-1];
            Tea.StackContainer.supertype.remove.call(this, item);
        }
        
        this.refresh();
        return item;
    },
    remove : function( item )
    {
        this.pop(item);
    },
    popAfter : function( item )
    {
        var next = this.items[item._index+1];
        if (next)
            this.pop(next);
    },
    refresh : function( panel )
    {
        if (!this.skin || this.paused > 0) return;
        
        this.skin.refresh( panel );
    },
    pause : function()
    {
        this.paused += 1;
    },
    play : function()
    {
        this.paused -= 1;
    }
})

Tea.StackContainer.Skin = Tea.Container.Skin.subclass('Tea.StackContainer.Skin', {
    options: {
        cls: 't-stack'
    },
    refresh : function( new_item )
    {
        var element = this.element;
        var i, k, item;
        var len = element.items.length;
        var hidden = [];
        var shown = [];
        
        var sz = element.options.columns;
        for (i = 0; i < len; i++)
        {
            item = element.items[len - i - 1];
            if (sz > 0)
            {
                shown.push(item);
                sz -= (item.options.size || 1);
                if (item.options.size == 2)
                    item.source.addClass('t-wide')
            }
            else
                hidden.push(item);
        }
        shown.reverse();
        
        var width = (element.source.width() / element.options.columns) - (element.options.space / 2);
    
        for (var i=0; i<hidden.length; i++)
            hidden[i].source.hide().css('left', -width + 50);
        
        k = 0;
        for (var i=0; i<shown.length; i++)
        {
            var item = shown[i];
            var size = item.options.size || 1;
            var left = (width + element.options.space) * k;
            
            if (item == new_item)
                item.source.css({
                  left: left,
                  opacity: 0,
                  width: width * size
                });
            
            item.source.show().css({
                position: 'absolute',
                width: width * size
            }).animate({
                left: left,
                opacity: 1
            });
            
            k += item.options.size || 1;
        }
    }
})

Tea.StackContainer.StretchySkin = Tea.StackContainer.Skin.subclass("Tea.StackContainer.Stretchy", {
    options: {
        column_width: 350,
        buffer: 100,
        scrollParent: window
    },
    render : function()
    {
        var result = Tea.StackContainer.StretchySkin.supertype.render.apply(this, arguments);
        
        $(window).resize( Tea.method(this.onResize, this) );
        $(window).scroll( Tea.metronome(300, this.onScroll, this) );
        this.onResize();
        
        return result;
    },
    refresh : function( new_item )
    {   
        var result = Tea.StackContainer.StretchySkin.supertype.refresh.call(this, new_item );
        
        if (new_item)
            this.correct( new_item );
        
        return result;
    },
	onResize : function()
	{
	    var width = this.source.parent().width();
	    
	    var sizes = this.options.sizes;
	    this.element.options.columns = parseInt(width / this.options.column_width);
	    
	    this.refresh();
	},
	correct : function(item)
	{
	    if (item.options.title == 'Tea') return;
	        
	    var fold = $(this.options.scrollParent).scrollTop();
	    var height = $(this.options.scrollParent).height();
	    
	    var s = item.source;
	    var buffer = this.options.buffer;
	    
	    var top = s.offset().top;
	    var bottom = s.offset().top + s.height();
	    
	    var b_delta = bottom - (fold + $(window).height());
	    var t_delta = fold - top;
	    
	    var new_top = null;
	    if (b_delta < 0)
	        new_top = top - b_delta;
	        
	    if (s.height() > height)
	    {	    
	        if (t_delta < 0)
	            new_top = fold;
	    }
	    else
	    {
	        if (t_delta != 0)
	            new_top = fold;
	    }
	    
	    if (new_top != null)
	    {
	        new_top = new_top - this.source.offset().top;
    	    if (new_top < 0)
    	        new_top = 0
	        s.animate({top: new_top}, 'fast');
        }
	},
	onScroll : function()
	{   
	    this._scrolltimeout
	    var self = this;
	    this.element.each(function()
	    {
	        self.correct(this);
	    });
	}
})

////////////////////////////////////////////////////////////// src/model.js //
/** Tea.Model
    
    @requires Tea
    
    ORM-like interaction with the server, idealy through a REST interface,
    but it's flexible enough for many different interfaces.
 **/
Tea.Model = function(name, properties)
{
    if (!properties) properties = {};
    if (typeof name != 'string') throw new Error("Must provide a string <name> to Tea.Model(name, properties).");
    
    return Tea.Model.subclass(Tea.Model.Base, name, properties);
}

Tea.Model.subclass = function(Base, name, properties)
{
    if (!properties) properties = {};
    if (typeof name != 'string') throw new Error("Must provide a string <name> to Tea.Model.subclass(name, properties).");
    
    properties.__class__ = jQuery.extend({}, Base.prototype.__class__, properties.__class__ || {});
    
    var Model = Tea.Model.Base.subclass(name, properties);
    
    jQuery.extend(Model, properties.__class__);
    Model.subclass = function(name, properties) { return Tea.Model.subclass(Model, name, properties) }
    Model.cache = {};
    
    return Model;
}

Tea.Model.Base = Tea.Class('Tea.Model', {
    // These properties and methods are on the Model class itself.
    __class__: {
        /** Tea.Model.get(pk, value) [class method] !important
            Returns an instance, either existing, or new.

            pk [optional]:
                Private key value for the instance to return.

            value [optional]:
                Value dictionary to be merged onto the instance.
         **/
        get : function(pk, value)
        {
            if (value)
                value._pk = pk;
            else if (typeof pk == 'object')
                value = pk;
            else
                value = {_pk: pk};
            
            var existing = this.cache[value._pk];
            if (existing)
                return existing.setValue(value);
            
            return new this(value);
        },
        
        query : function(override)
        {
            var options = {
                url: this.prototype.options.url + 'search/'
            }
            
            return Tea.ajax(options, override);
        },
        
        getSearchResource : function(options)
        {
            var name = this.id + ".SearchResource"
            var Model = this;
            
            if (!Tea.classes[name])
            {
                Tea.classes[name] = Tea.Resource.subclass(name, {
                    options: {
                        url: Model.prototype.options.url + 'search/'
                    },
                    setValue : function(data)
                    {
                        this.value = [];
                        for(var i=0;i<data.length; i++)
                        {
                            var o = Model.get(data[i]);
                            this.value.push(o);
                        }
                    }
                });
            }
            
            return new Tea.classes[name](options);
        }
    },
   
    /** Tea.Model.__init__(value)
        Constructor for model instances, takes a value to be merged onto the instance.
        Note: one should normally use .get() instead of new Model(), as .get makes sure that
        if an instance with the same pk already exists, that will be returned, but when a new
        instance is created, __init__ is called on it.

        value:
            Value dictionary to be merged onto the new instance.
     **/
    __init__ : function(value)
    {
        value = value || {};
        
        value._pk = value._pk || null;
        this.setValue(value);
        this._model = this.constructor.id;
    },
    
    /** Tea.Model.options
        url:
            The default url/route that will be connected to for ajax calls.
        save:
            The url/route to connect to for save() ajax calls.
        update:
            The url/route to connect to for update() ajax calls.
        del:
            The url/route to connect to for del() ajax calls.
        
     **/
    options: {
        url: null,
        item: {type: "Tea.ListItem"}
    },
   
    /** Tea.Model.update(options)
        Ajax call to update this instance.
        
        options:
            Over-riding options to pass into Tea.ajax.

        Events:
            - updated
     **/
    update : function(options)
    {
        var standard = {
            url: this.options.url,
            get: this.getRef(),
            context: this,
            success: function(data)
            {
                this._pk = data.pk;
                this._model = data.model;
                this.setValue(data.value);
                this.trigger('updated', data.value);
            },
            invalid : function(errors)
            {
                this.trigger('invalid', errors);
            }
        };
        
        Tea.ajax(jQuery.extend(standard, options));
    },
   
    /** Tea.Model.save(options)
        Ajax call to save this instance.
        
        options:
            Over-riding options to pass into Tea.ajax.
        
        Events:
            - saved
            - updated
     **/
    save : function(options)
    {
        var data = { value: Tea.toJSON(this.getValue()) };
        
        if (this.__errors__ != undefined)
            delete this.__errors__;
        
        var standard = {
            url: this.options.url,
            post: this.getRef(data),
            context: this,
            success: function(data)
            {
                this._pk = data.pk;
                this._model = data.model;
                this.setValue(data.value);
                
                this.trigger('updated', data.value);
                this.trigger('saved', data.value);
            },
            invalid : function(errors)
            {
                this.__errors__ = errors;
                this.trigger('invalid', errors);
            }
        };

        Tea.ajax(jQuery.extend(standard, options))
    },
   
    /** Tea.Model.del(options)
         Ajax call to delete this instance.  
         Note: It doesn't actually do anything to this model instance on the javascript side.

         options:
             Over-riding options to pass into Tea.ajax.

         Events:
             - deleted
      **/
    del : function(options)
    {
        var standard = {
            url: this.options.url,
            method: 'get',
            context: this,
            get: this.getRef({action: 'delete'}),
            success: function(deleted)
            {
                this._pk = null;
                
                if (deleted)
                    this.trigger('deleted');
            },
            invalid : function(errors)
            {
                this.trigger('invalid', errors);
            }
        };

        Tea.ajax(jQuery.extend(standard, options))
    },
    
    /** Tea.Model.getRef()
        Gets a dictionary to use as a reference for this instance.  It contains the model and pk
        of this instance.
     **/
    getRef : function(extend)
    {
        var ref = {model: this._model};
        if (this._pk != null) ref.pk = this._pk
        return $.extend(ref, extend);
    },
   
    /** Tea.Model.getValue()
        Get the value of this instance without functions and without any properties that start with
        an underscore except for _model and _pk.
     **/
    getValue : function()
    {
        var value = {};
        for (var i in this)
        {
            if (i == 'options' || i[0] == '_') continue;
            var v = this[i];
            if (typeof v == 'function') continue;
            if (v && typeof v == 'object' && v.__class__ != null) v = v.getRef();
            value[i] = v;
        }
        return value;
    },
    
    /** Tea.Model.setValue(value)
        Merges the given value dictionary onto this instance.

        value:
            Value dictionary to be merged onto this instance.
     **/
    setValue : function(value)
    {
        for(var k in value)
        {
            var v = value[k];
            if (typeof v == 'object' && v != null && v._model != null && v._pk != null)
                this[k] = Tea.Model.get(v);
            else
                this[k] = v;
        }
        
        if (this._pk)
            this.constructor.cache[this._pk] = this;
        
        this.trigger('changed');
        
        return this;
    },
    
    /** Tea.Model.getFields()
        Return the fields for this instance appropriate for a form.
     **/
    getFields : function()
    {
        return [];
    },
    
    /** Tea.Model.toString()
        Returns a string representation of the model.
     **/
    toString : function()
    {
        return "<" + this._model + " " + this._pk + ">";
    },
    
    /** Tea.Model.getListItem(options)
         Returns a default list item object.
      **/
    getListItem : function(options)
    {
        options = $.extend({}, {
            value: this,
            template: this.options.template,
            type: 'Tea.ListItem'
        }, this.options.item, options);
        
        var item = Tea.manifest(options);
        var self = this;
        var update = function()
        {
            item.refresh();
        }
        this.bind('update', update);
        
        item.bind('drop', function() { 
            if (self.onDrop)
                self.onDrop.apply(self, arguments)
        });
        
        return item;
    }
});

Tea.Model.get = function(value)
{
    var model = Tea.getClass(value._model);
    if (!model)
        throw new Error("Cannot find model: " + value._model);
        
    return model.get(value);
}

/////////////////////////////////////////////////////////// src/template.js //
/** Tea.Template

    Naive template implementation.
    NOTE: There is no escaping done here.
    
    @requires Tea
    
    Example:
        var context = {must: 'will'};
        var t = new Tea.Template('Bugs {{must}} go.  They {{ must }}.');
        assertEqual(t.apply(context), 'Bugs will go.  They will.');
 **/
Tea.Template = Tea.Class({
    /** Tea.Template.options
    
        re:
            The regular expression used, defaults to: /{{\s*(.*?)\s*}}/g, which
            matches things like: something something {match} something.
        missing_throws:
            Throw an exception if a variable cannot be resolved, otherwise
            it merely replaces the variable with an empty string ''.
        html_encode:
            Converts "&", "<", and ">" to "&amp;", "&lt;", and "&gt;", respectively.
     **/
    options: {
        re: /{{\s*(.*?)\s*}}/g,
        html_encode: false,
        missing_throws: false
    },
    
    /** Tea.Template.__init__ (src, [options])
        
        Instantiate a template with the given source, and optionally options.
     **/
    __init__ : function(src, options)
    {
        this.src = src;
        Tea.Template.supertype.__init__.call(this, options);
    },
    
    /** Tea.Template.apply (context)
    
        Applies the template with the given context.
     **/
    apply : function( context )
    {
        var self = this;
        
        return this.src.replace(this.options.re, 
            function(match, group, index, full)
            {
                return self.getVar(group, context);
            });
    },
    
    // Returns the variable value for the given context.
    getVar : function( variable, context )
    {
        if (!variable)
            throw new Error("Empty group in template.");
        
        var path = variable.split('.');
        var value = context;
        for( var i = 0; i < path.length; i++)
        {
            if (path[i] == '*') continue;
            value = value[path[i]];
            if (value == undefined)
                if (this.options.missing_throws)
                    throw new Error("Unable to find variable in context: " + path.join("."));
                else
                    value = '';
        }
        if (this.options.html_encode)
            value = value.replace(/&/g,'&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
        return value;
    }
})

//////////////////////////////////////////////////////////// src/testing.js //
/** Tea.Testing !module

    @requires Tea

    A testing framework.
 **/

Tea.Testing = {};
Tea.Testing.suites = [];

try
{
    console.log.prototype;
} catch(e) {
    fn = function() {};
    console = {
        log : fn,
        group : fn,
        groupEnd : fn,
        error: fn,
        debug: fn
    }
}

Tea.Testing.run = function(suite, test)
{
    Tea._testing = true;
    
    jQuery.ajaxSetup({async: false});
    
    var suites = Tea.Testing.suites;
    var count = 0;
    var passed = 0;

    console.log("Running tests...");
        
    for(var i = 0; i < suites.length; i++) 
    {
        if (suite && suites[i].name != suite) continue;
        
        var results = suites[i].run(test);
        count += results[0];
        passed += results[1];
    }
    
    if (count == passed)
        console.log("Passed.");
    else
        console.log("Failed: %s of %s passed.", passed, count);
    
    jQuery.ajaxSetup({async: true});
    
    Tea._testing = false;
    
    return {count: count, passed: passed};
}

Tea.Testing.fail = function(msg)
{
    var e = new Error(msg);
    e.failure = true;
    throw e;
}

function assertEqual(a, b, msg)
{
    if (a == b) return;
    if (a == undefined) a = 'undefined';
    if (b == undefined) b = 'undefined';
    Tea.Testing.fail( msg || ("assertEqual failed: " + a.toString() + ' != ' + b.toString()) );
}

function assert(a, msg)
{
    if (a) return;
    Tea.Testing.fail(msg || 'assertion failed.');
}

Tea.Testing.Suite = Tea.Object.subclass('Tea.Testing.Suite', {
    __init__ : function(attrs)
    {
        this._tests = [];
        for(var k in attrs)
        {
            this[k] = attrs[k];
            
            if (k == 'teardown') continue;
            if (k == 'setup') continue;
            if (k[0] == '_') continue;
            
            if (typeof attrs[k] == 'function')
                this._tests.push(new Tea.Testing.Test(k, attrs[k]));
        }
        
        if (!this.name)
            throw new Error("Unable to build test suite, it was not given a name attribute.");
        
        Tea.Testing.suites.push(this);
    },
    run : function(test)
    {
        this._passed = 0;
        
        console.group(this.name);
        
        if (this.setup)
        {
            try {
                this.setup.call(this);
            } 
            catch(e) {
                console.error('Error setting up suite.');
                console.error(e);
                console.groupEnd();
                return [1, 0];
            }
        }
        
        for(var i = 0; i < this._tests.length; i++)
        {
            if (test && this._tests[i].name != test) continue;
            
            this._tests[i].run(this, test == this._tests[i].name);
        }
        
        if (this.teardown)
        {
            try {
                this.teardown.call(this);
            } 
            catch(e) {
                console.error('Error tearing down suite.');
            }
        }
        
        if (this._passed == this._tests.length)
            console.log("All of %s passed.", this._tests.length);
        else
            console.log("%s of %s passed.", this._passed, this._tests.length);
        
        console.groupEnd();
        
        return [this._tests.length, this._passed];
    }
});

Tea.Testing.Test = Tea.Object.subclass('Tea.Testing.Test', {
    __init__ : function(name, entry)
    {
        this.name = name;
        this.entry = entry;
        this.status = null;
        this.comment = null;
    },
    run : function(suite, let)
    {
        try
        {
            this.entry.call(suite);
            this.status = '.';
            suite._passed += 1;
        } 
        catch(e)
        {
            pass = false;
            
            if (let)
                throw e;
            
            if (e.failure)
            {
                this.status = 'F';
                this.comment = e.message;
                console.error("%s Failed - %s: %s\n", this.name, e.name, e.message, Tea.Testing.trace(e));
            }
            else
            {
                this.status = 'E';
                this.comment = e.message;
                console.error("%s Threw - %s: %s\n", this.name, e.name, e.message, Tea.Testing.trace(e));
            }    
        }
    }
});

Tea.Testing.trace = function(e)
{
    if (!e.stack)
        return e.sourceURL + ":" + e.line;
    
    var split = e.stack.split('\n');
    var frames = [];
        
    for(var i = 0; i < split.length; i++)
    {
        var frame = split[i];
        frames.push( frame.split('@').reverse().join(" - ") );
    }
    
    return frames.join("\n");
}

Tea.Testing.setupAjax = function(responses)
{
    Tea.Testing.ajaxCalls = [];
    Tea.Testing._ajax = jQuery.ajax;
    
    jQuery.ajax = function(options)
    {
        Tea.Testing.ajaxCalls.push(options);
        try {
            var response = responses[options.url](options);
        } catch (e) {
            console.error("Unable to find url in the responses: %s", options.url);
            throw e;
        }
        
        options.success.call(this, response);
    }
}

Tea.Testing.teardownAjax = function()
{
    jQuery.ajax = Tea.Testing._ajax
}

///////////////////////////////////////////////////////////// src/widget.js //
/** Tea.Widget !module
    
    A few ui widgets, like buttons, and... well that's it so far.
    
    @requires Tea.Element
 **/
 
Tea.Widget = {}

Tea.Button = Tea.Element.subclass('Tea.Button', {
    options: {
        text: '',
        icon: '',
        disabled: false,
        click: null,
        context: null
    },
    __init__ : function()
    {
        Tea.Button.supertype.__init__.apply(this, arguments);
        
        if (this.options.text)
            this.setText(this.options.text);
        if (this.options.icon)
            this.setIcon(this.options.icon);
    },
    render : function()
    {
        Tea.Button.supertype.render.apply(this, arguments);
        
        this.setDisabled(this.options.disabled);
        
        if (this.text)
            this.skin.setText(this.text);
        if (this.icon)
            this.skin.setIcon(this.icon);
        
        return this.source;
    },
    setText : function(text)
    {
        this.text = text;
        if (this.source)
            this.skin.setText(text);
    },
    getText : function()
    {
        return this.text;
    },
    setIcon : function(icon)
    {
        this.icon = icon;
        if (this.source)
            this.skin.setIcon(icon);
    },
    getIcon : function()
    {
        return this.icon;
    },
    disable : function()
    {
        this.setDisabled(true);
    },
    enable : function()
    {
        this.setDisabled(false);
    },
    setDisabled : function(bool)
    {
        this.disabled = bool;
        
        if (this.source)
            this.skin.setDisabled(this.disabled = bool);
        else
            this.options.disabled = bool;
    },
    click : function()
    {
        if (this.disabled || typeof(this.options.click) != 'function') return false;
        
        this.options.click.apply(this.options.context || this);
    }
})

Tea.Button.Skin = Tea.Element.Skin.subclass('Tea.Button.Skin', {
    options: {
        cls: 't-button'
    },
    render : function() {
        var element = this.element;
        
        this.icon = $("<div class='t-icon'/>").addClass(element.options.icon);
        this.text = $("<div class='t-text'/>").append(element.options.text || '');
        
        Tea.Button.Skin.supertype.render.call(this);
        
        element.source.append(this.icon);
        element.source.append(this.text);
        
        element.source.mousedown(function() {
            if (!element.disabled) 
                element.source.addClass('t-active')
        });
        
        element.source.bind('mouseup mouseout', function() {
            element.source.removeClass('t-active')
        });
        
        if (element.options.click)
            element.source.click(Tea.method(element.click, element));
            
        element.source.hover(
            function() {
                if (!element.disabled)
                    element.source.addClass('t-button-hover');
            },
            function() {
                element.source.removeClass('t-button-hover');
            }
        )
        
        return this.source;
    },
    setText : function(text)
    {
        this.text.empty().append(text);
    },
    setIcon : function(icon)
    {
        if (this.iconCls)
            this.icon.removeClass(this.iconCls);
        
        this.icon.addClass(this.iconCls = 'icon-' + icon);
    },
    setDisabled : function(bool)
    {
        if (bool)
            this.source.addClass('t-disabled');
        else
            this.source.removeClass('t-disabled');
    }
});

