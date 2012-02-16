/** Tea.Popup

    A container that "pops up".  You can show() and hide() it.
    
    @requires Tea.Container
    @extends Tea.Container
 **/

Tea.Popup = Tea.Container.extend('t-popup', {
    options: {
        cls: 't-popup',
        pos: null
    },
    show : function() {
        if (!this.isRendered())
            this.render()
                .appendTo(document.body)
                .hide();
        this.setPosition(this.pos);
        this.source.fadeIn();
        
        this.hook(window, 'mouseup', this.hide);
        this.open = true;
    },
    hide : function() {
        this.unhook(window);
        this.source.hide();
        this.open = false;
    },
    setPosition : function(top, left) {
        this.pos = {top: top, left: left};
        this.source.css({
            top: top, 
            left: left
        });
    },
    centerOn : function(item) {
        var delta = item.source.position().top;
        var top = this.pos.top - delta;
        if (top < 0)
            top = 0;
        this.css('top', top);
    }
})