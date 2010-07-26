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
        if (element.placement == 'top')
            source.animate( {top: 20, 
                             opacity: element.opacity}, 
                            element.speed, element.easing);
        else if (element.placement == 'center')
            source.animate( {top: $(document).height()/2.5 - source.height()/2, 
                             opacity: element.opacity}, 
                            element.speed, element.easing );
        
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
        
        source.css({
            opacity: 0,
            position: 'static',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        });
        
        source.fadeIn('fast');   
    },
    hide : function()
    {
        this.source.hide();
    }
})