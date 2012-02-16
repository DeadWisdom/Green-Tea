/** Tea.Drag

    Dragging and dropping.
    
    @requires Tea
 **/

Tea.Drag = Tea.Class('Tea.Drag', {
    __init__ : function(options)
    {
        this.__super__(options);
        
        this.active = null;
        
        var self = this;
        $(document.body).mousemove(function(e) {
            if (self.active)
                self.active.update(e);
        });
        
        $(document.body).mouseup(function(e) {
            if (self.active)
                self.active.end(e);
        });
        
        this.overlay = $('.t-overlay');
        if (this.overlay.length == 0)
            this.overlay = $('<div class="t-overlay t-medium"/>').appendTo(document.body).hide();
            
        Tea.Drag = this;
    },
    init : function() {}
})

Tea.Drag.init = function()
{
    if (typeof Tea.Drag == 'function')
        new Tea.Drag();
}

Tea.Draggable = Tea.Class('Tea.Draggable', {
    options: {
        cls: null,
        ghost: null,
        threshold: 5,
        snapToCursor: true
    },
    attach : function(element)
    {
        Tea.Drag.init();
            
        var self = this;
        this.hook(element.source, 'mousedown', function(e) {
            if (element.options.drag_locked)
                return;
            
            Tea.Drag.active = self;
            self.origin = {left: e.pageX, top: e.pageY};
            self.element = element;
            self.begun = false;
            
            // No idea why this works, but it allows events to continue durring the drag.
    		if (e.stopPropagation) e.stopPropagation();
    		if (e.preventDefault) e.preventDefault();
        });
    },
    createGhost : function(element)
    {
        var source = element.source;
        return source.clone()
          .css('opacity', .5)
          .appendTo(document.body)
          .css('position', 'absolute')
          .width(source.width())
          .height(source.height())
          .addClass('t-drag')
          .appendTo(Tea.Drag.overlay);
    },
    start : function(e)
    {
        this.ghost = this.createGhost(this.element);
        this.target = null;
        this.overlay = Tea.Drag.overlay;
        
        var offset = this.element.source.offset();
        this.delta = {
            top: this.origin.top - offset.top, 
            left: this.origin.left - offset.left
        }
        
        Tea.Drag.overlay.show();
        Tea.deselect();
        
        this.begun = true;
    },
    update : function(e)
    {
        if (!this.begun)
        {
            var d1 = Math.abs(e.pageX - this.origin.left);
            var d2 = Math.abs(e.pageY - this.origin.top);
            if (d1 < this.options.threshold || d2 < this.options.threshold)
                return;
                
            this.start(e);
        }
        
        if (this.options.snapToCursor)
        {
            var left = e.pageX + 1;
            var top = e.pageY + 1;
        }
        else
        {
            var left = e.pageX - this.delta.left;
            var top = e.pageY - this.delta.top;
        }
        
        Tea.Drag.overlay.css({
            left: left,
            top: top
        });
    },
    end : function(e)
    {
        if (this.ghost)
            this.ghost.remove();
        
        Tea.Drag.overlay.hide();
        Tea.Drag.active = null;
        
        if (this.target)
        {
            this.target.trigger('drop', this.element);
            if (this.target.options.onDrop)
                this.target.options.onDrop.call(this.target, this.element);
        }
        else
            this.element.trigger('drop-nowhere');
    }
})

Tea.Droppable = Tea.Class('Tea.Droppable', {
    options: {
        accept: []
    },
    attach : function(element, handle)
    {
        if (!handle) handle = element.source;
        
        Tea.Drag.init();
        
        var onHoverIn = function(e)
        {
            if (Tea.Drag.active)
            {   
                Tea.Drag.active.target = element;
                
                if (e.stopPropagation) e.stopPropagation();
        		if (e.preventDefault) e.preventDefault();
            }
        };
        
        var onHoverOut = function(e)
        {   
            if (Tea.Drag.active) {
                Tea.Drag.active.target = null;
            }
        }
        
        handle
            .mouseenter(onHoverIn)
            .mouseleave(onHoverOut);
    }
})
