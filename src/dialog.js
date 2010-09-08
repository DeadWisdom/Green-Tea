/** Tea.Dialog
    
    A Panel that displays itself over the ui to prompt the user.
    
    @requires Tea.Panel
 **/

Tea.Dialog = Tea.Panel.extend('t-dialog', {
    options: {
        placement: 'top',
        opacity: 1,
        easing: 'swing',
        speed: 'normal',
        appendTo: null,
        time: null,
        scrim: null,
        resizeMaster: true,
        skin: 't-dialog-skin'
    },
    __init__ : function(options)
    {
        this.__super__(options);
        if (this.scrim == true)
            this.scrim = Tea.Scrim();
    },
    show : function()
    {
        if (!this.isRendered())
            this.render();
        if (this.scrim)
            this.scrim.show();
            
        this.skin.show();
        return this.source;
    },
    hide : function()
    {
        this.skin.hide();
        if (this.scrim)
            this.scrim.hide();
    }
})

Tea.Dialog.Skin = Tea.Panel.Skin.extend('t-dialog-skin', {
    options: {
        cls: 't-dialog t-panel'
    },
    resize : function(speed)
    {
        var element = this.element;
        var source = this.source;
        
        var height = source.height();
        if (height > $(document).height() - 8)
            source.height($(document).height() - 8);
        
        if (element.placement == 'top')
            source.animate( {top: 20, 
                             opacity: element.opacity}, 
                             speed || element.speed, element.easing);
        else if (element.placement == 'center')
            source.animate( {top: $(document).height()/2.5 - source.height()/2, 
                             opacity: element.opacity}, 
                             speed || element.speed, element.easing );
                             
    },
    show : function()
    {
        var element = this.element;
        var source = this.source;
        source.appendTo(element.appendTo || document.body);
        
        source.show();
        source.css('opacity', 0);
        source.css('position', 'fixed');
        source.css('top', -source.height());
        source.css('left', $(document).width()/2 - source.width()/2);
        
        this.resize();
        
        if (element.time)
        {
            var self = this;
            setTimeout(function(){ self.hide() }, element.time);
        }
    },
    hide : function()
    {
        var self = this;
        var source = this.source;
        source.fadeOut(this.element.speed, function() { source.remove() });
    }
})

/** Tea.Scrim
    
    A translucent background that goes behind a dialog but over everything
    else.  It has the effect of fading everything else out.
 **/

Tea.Scrim = Tea.Element.extend('t-scrim', {
    options: {
        cls: 't-scrim'
    },
    show : function()
    {
        if (!this.isRendered())
            this.render().appendTo(this.frame || document.body);
        
        var source = this.source;
        
        source.hide().fadeTo('fast', .8);
    },
    hide : function()
    {
        this.remove();
    }
})