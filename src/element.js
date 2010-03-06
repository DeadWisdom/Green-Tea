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
        id: null,
        html: null,
        cls: null,
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
                this.bind(k, Tea.method(this.options.bind[k], this.options.scope || this));
        
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
        if (b.constructor === Object)
        {
            var cls = Tea.classes[b.type];
            if (!cls)
                throw new Error("Attempt to add behavior to this element, an Object instance with no valid type: " + item.type);
                
            b = new cls(b);
        }
        
        b.attach(this);
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
    },
    setHTML : function(html)
    {
        if (this.source)
            this.skin.setHTML(html)
        else
            this.options.html = html;
    }
});

Tea.Element.Skin = Tea.Object.subclass('Tea.Element.Skin', {
    options : {
        
    },
    __init__ : function(element)
    {
        this.__super__();
        this.element = element;
        this.source = element.options.source;
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
