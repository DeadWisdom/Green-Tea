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
Tea.Element = Tea.Class('t-element', {
    options: {
        source: '<div/>',               // Source of the element.
        skin: 't-skin',                 // The element skin.
        id: null,
        html: null,
        cls: null,
        hidden: false,
        appendTo: null,
        attrs: {},
        style: null
    },
    __postinit__ : function()
    {
        if (this.appendTo)
            this.render().appendTo(this.appendTo);
    },
    __init__ : function(options) {
        this.__rendered = false;
        this.__super__(options);
        this.parent = null;
    },
    render : function(source) {
        if (this.__rendered) return this.source;
        
        var skin = Tea.manifest(this.skin);
        skin.attach(this);
        
        if (source)
            this.source = this.skin.render($(source));
        else
            this.source = this.skin.render();
        
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
        this.__rendered = false;
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
        if (this.isRendered())
            this.skin.setHidden(flag);
        this.hidden = flag;
    },
    setHTML : function(html)
    {
        if (this.isRendered())
            this.skin.setHTML(html);
        this.html = html;
    },
    getHTML : function()
    {
        if (this.isRendered())
            return this.skin.getHTML();
        return this.html;
    }
});

Tea.Skin = Tea.Class('t-skin', {
    options: {},
    __init__ : function(options)
    {
        this.element = null;
        this.source = null;
        this.__super__();
    },
    attach : function(element) {
        this.element = element;
        element.skin = this;
    },
    render : function(source) {
        var element = this.element;
        
        var source  = this.source = element.source = $(source || element.source);
        
        if (element.id)         source.attr('id', element.id);
        if (element.cls)        source.addClass(element.cls);
        if (this.cls)           source.addClass(this.cls);
        if (element.html)       this.setHTML(element.html);
        if (element.style)      source.css(element.style);
        
        if (element.attrs)
            for(a in element.attrs)
                source.attr(a, element.attrs[a]);
        
        if (element.hidden)
            source.hide();
        
        return source;
    },
    remove : function() {
        this.source.remove();
    },
    setHTML : function(src)
    {
        this.source.html(src);
    },
    getHTML : function()
    {
        return this.source.html();
    },
    setHidden : function(flag)
    {
        if (flag)
            this.source.hide();
        else
            this.source.show();
    }
})
