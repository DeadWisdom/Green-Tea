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
        
        if (this.text)
            this.setText(this.text);
        if (this.icon)
            this.setIcon(this.icon);
    },
    render : function()
    {
        Tea.Button.supertype.render.apply(this, arguments);
        
        this.setDisabled(this.disabled);
        
        if (this.text)
            this.skin.setText(this.text);
        if (this.icon)
            this.skin.setIcon(this.icon);
        
        return this.source;
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
            this.disabled = bool;
    },
    click : function()
    {
        if (this.disabled || typeof(this.click) != 'function') return false;
        
        this.click.apply(this.context || this);
    }
})

Tea.Button.Skin = Tea.Element.Skin.subclass('Tea.Button.Skin', {
    options: {
        cls: 't-button'
    },
    render : function() {
        var element = this.element;
        
        this.icon = $("<div class='t-icon'/>").addClass(element.icon);
        this.text = $("<div class='t-text'/>").append(element.text || '');
        
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
        
        if (element.click)
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