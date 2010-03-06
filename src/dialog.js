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
