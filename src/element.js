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
        attrs: {}
    },
    __init__ : function(options) {
        this.__rendered = false;
        this.__super__(options);
        this.parent = null;
        
        var skin = this.skin;
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
                throw new Error("Element.skin is set to null, but no skin can be found.");
        }
        else
            throw new Error("Element.skin must be set to null, a function, or a string which cooresponds to a Skin class.");
    },
    render : function(source) {
        if (this.__rendered) return this.source;
        
        if (source)
            this.source = this.skin.render($(source));
        else
            this.source = this.skin.render();
        
        if (this.__latentBinds)
            for (var i in this.__latentBinds)
                this.addEventListener.apply(this, this.__latentBinds[i]);
        
        var behaviors = this.behaviors;
        if (behaviors && behaviors.length > 0)
            for(var i = 0; i < behaviors.length; i++)
                this.addBehavior(behaviors[i]);
        
        this.onRender();
        
        this.__rendered = true;
        
        return this.source;
    },
    onRender : function()
    {},
    isRendered : function()
    {
        return this.__rendered;
    },
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
        if (!this.__rendered)
        {
            if (!this.__latentBinds)
                this.__latentBinds = [];
            return this.__latentBinds.push([type, handle]);
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
        if (this.__rendered)
            this.skin.setHidden(flag);
        else
            this.hidden = flag;
    },
    setHTML : function(html)
    {
        if (this.__rendered)
            this.skin.setHTML(html)
        else
            this.html = html;
    }
});

Tea.Element.Skin = Tea.Object.subclass('Tea.Element.Skin', {
    options: {},
    __init__ : function(element)
    {
        this.__super__();
        this.element = element;
        this.source = element.source;
    },
    render : function(source) {
        var element = this.element;
        
        var source  = this.source = element.source = $(source || element.source);
        
        if (element.id)         source.attr('id', element.id);
        if (element.cls)        source.addClass(element.cls);
        if (this.cls)           source.addClass(this.cls);
        if (element.html)       this.setHTML(element.html);
        
        if (element.attrs)
            for(a in element.attrs)
                source.attr(a, element.attrs[a]);
        
        if (element.style)
            for(var i in element.style)
                source.css(i, element.style[i]);
        
        if (element.hidden)
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
