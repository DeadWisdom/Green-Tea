/** Tea.Widget !module
    
    A few ui widgets, like buttons, and... well that's it so far.
    
    @requires Tea.Element
 **/
 
Tea.Widget = {}

Tea.Button = Tea.Element.extend('t-button', {
    options: {
        source: '<a>',
        text: '',
        icon: '',
        disabled: false,
        context: null,
        hasFocus: null,
        skin: 't-button-skin',
        href: null
    },
    __init__ : function(options)
    {
        this.__super__(options);
        
        if (this.text)
            this.setText(this.text);
        if (this.icon)
            this.setIcon(this.icon);
    },
    render : function(source)
    {
        source = this.__super__(source);
        
        this.setDisabled(this.disabled);
        
        if (this.text)
            this.skin.setText(this.text);
        if (this.icon)
            this.skin.setIcon(this.icon);
        
        return source;
    },
    focus : function()
    {
        this.hasFocus = true;
        if (this.isRendered())
            this.skin.setFocus(true);
    },
    blur : function() {
        this.hasFocus = false;
        if (this.isRendered())
            this.skin.setFocus(false);
    },
    setText : function(text)
    {
        this.text = text;
        if (this.isRendered())
            this.skin.setText(text);
    },
    getText : function()
    {
        return this.text;
    },
    setIcon : function(icon)
    {
        this.icon = icon;
        if (this.isRendered())
            this.skin.setIcon(icon);
    },
    getHref : function()
    {
        return this.href;
    },
    setHref : function(href)
    {
        this.href = href;
        if (this.isRendered())
            this.skin.setHref(href);
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
        
        if (this.isRendered())
            this.skin.setDisabled(this.disabled = bool);
        else
            this.disabled = bool;
    },
    performClick : function()
    {
        if (!this.click && this.href) return true;
        if (!this.click) return false;
        if (this.disabled) return false;
        
        var context = this.context || this;
        
        try {
            if (typeof(this.click) == 'string') return context[this.click].apply(context);
            if (jQuery.isFunction(this.click)) return this.click.apply(context);
        } catch(e) {
            if (console && console.error)
                console.error(e);
        }
        
        return false;
    }
})

Tea.Button.Skin = Tea.Skin.extend('t-button-skin', {
    options: {
        cls: 't-button'
    },
    render : function(source) {
        var element = this.element;
        
        this.icon = $("<div class='t-icon'/>").addClass(element.icon);
        this.text = $("<div class='t-text'/>").append(element.text || '');
        
        source = this.__super__(source);
        
        source.append(this.icon);
        source.append(this.text);
        
        source.mousedown(function() {
            if (!element.disabled) 
                source.addClass('t-active')
        });
        
        source.bind('mouseup mouseout', function() {
            source.removeClass('t-active');
        });
        
        source.focus(function() {
            element.hasFocus = true;
            source.addClass('t-focus');
        });
        
        source.blur(function() {
            element.hasFocus = false;
            source.removeClass('t-focus');
        });
        
        element.hook(source, 'click', element.performClick);
        
        source.hover(
            function() {
                if (!element.disabled)
                    source.addClass('t-button-hover');
            },
            function() {
                source.removeClass('t-button-hover');
            }
        )
        
        if (element.href)
            this.setHref(element.href);
        
        return source;
    },
    setFocus : function(flag) {
        if (flag)
            this.source.focus();
        else
            this.source.blur();
    },
    setText : function(text)
    {
        this.text.empty().append(text);
    },
    setHref : function(href) {
        this.source.attr('href', href);
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