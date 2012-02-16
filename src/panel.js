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
    setTop : function(bar) {
        if (this.isRendered())
            this.top = bar;
        else
            this.skin.setBar('top', bar);
    },
    setBottom : function(bar) {
        if (this.isRendered())
            this.bottom = bar;
        else
            this.skin.setBar('bottom', bar);
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
        
        if (element.closable)
            this.closer = $("<div class='t-close t-icon icon-close'></div>")
                            .appendTo(source)
                            .click(function() { element.close() });
        
        if (element.top)
            this.setBar('top', element.top);
            
        if (element.bottom)
            this.setBar('bottom', element.bottom);
        
        return source;
        
    },
    setBar : function(position, bar) {
        var element = this.element;
        var existing = element[position];
        if (existing instanceof Tea.Object) {
            if (existing.parent)
                existing.remove();
            this.source.removeClass('t-has-' + position);
        }
        element[position] = null;
        
        if (!bar) return;
        
        if (jQuery.isArray(bar))
            bar = {
                type: 't-container',
                items: bar,
                cls: 't-bar t-' + position
            };
        
        var bar = element[position] = Tea.manifest(bar);
        bar.each(function(i, item) {
            item.context = item.context || element;
        });
        
        bar.panel = element;
        
        if (position == 'top')
            this.content.before(bar.render());
        else
            this.content.after(bar.render());
        
        this.hook(this, 'remove', function() { bar.remove() });
        
        this.source.addClass('t-has-' + position);
    },
    setTitle : function(title)
    {
        this.title.empty().append(title);
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
    },
    remove : function() {
        if (this.element.top)
            this.setBar('top', null);
            
        if (this.element.bottom)
            this.setBar('bottom', null);
        
        this.__super__();
    }
});
