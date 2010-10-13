/** Tea.Panel

    A container that can may be closed, and may have a title bar, a top action bar, or a bottom action bar.
    
    @requires Tea.Container
 **/

Tea.Panel = Tea.Container.extend('t-panel', {
    options: {
        title: '',
        closable: false,
        top: null,
        bottom: null,
        skin: 't-panel-skin'
    },
    setTitle : function(title)
    {
        this.title = title;
        if (this.isRendered())
            this.skin.setTitle(title);
        else
            this.title = title;
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

Tea.Panel.Skin = Tea.Container.Skin.extend('t-panel-skin', {
    options: {
        cls: 't-panel'
    },
    render : function(source) {
        var element = this.element;
        
        this.content = $("<div class='t-content'/>");
        this.title = $("<div class='t-title'/>").append(element.title || '');

        var anchor = this.anchor = $("<a class='t-focuser' href='#'>&#160;</a>");        

        anchor.has_focus = false;
        this.hook(this.anchor, 'focus', function() { 
            anchor.has_focus = true; 
            element.source.addClass('t-focus'); 
            element.trigger('focus') 
            Tea.Panel.focus = element;
        });
        this.hook(this.anchor, 'blur', function() { 
            anchor.has_focus = false;
            element.source.removeClass('t-focus');
            element.trigger('blur')
            Tea.Panel.focus = null;
        });
        
        var source = this.__super__(source);
        
        source.append(this.anchor);
        source.append(this.title);
        source.append(this.content);
        
        this.setBars(element.top, element.bottom);
        
        if (element.closable)
            this.closer = $("<div class='t-close t-icon CloseIcon'></div>")
                            .appendTo(source)
                            .click(function() { element.close() });
        
        return source;
        
    },
    setTitle : function(title)
    {
        this.title.empty().append(title);
    },
    setBars : function(top, bottom)
    {
        var element = this.element;
        if (top) {
            this.top = Tea.Container({cls: 't-bar t-top', items: top});
            this.top.each(function(i, item) {
                item.context = item.context || element;
            })
            this.top.panel = this.element;
            this.title.after(this.top.render());
            this.source.addClass('t-has-top');
        }
        if (bottom)
        {
            this.bottom = Tea.Container({cls: 't-bar t-bottom', items: bottom});
            this.bottom.each(function(i, item) {
                item.context = item.context || element;
            })
            this.bottom.panel = this.element;
            this.content.after(this.bottom.render());
            this.source.addClass('t-has-bottom');
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
        if (!this.isRendered())
        {
            var self = this;
            setTimeout(function() {
                self.anchor.focus();
            });
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