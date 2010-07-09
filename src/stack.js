/** Tea.StackContainer

    A container that acts as a stack, showing only the top few elements.  Pushing elements onto the stack moves
    the existing elements to the left.
    
    @requires Tea.Container
    @extends Tea.Container
 **/

Tea.StackContainer = Tea.Container.subclass('Tea.StackContainer', {
    options: {
        columns: 3,
        space: 4,
        column_width: 350,
        __stack__: true
    },
    __init__ : function()
    {
        this.paused = 1;
        Tea.StackContainer.supertype.__init__.apply(this, arguments);
    },
    render : function(source)
    {
        var self = this;
        setTimeout(function() { self.refresh() }, 100);
        
        this.paused = 0;
        return Tea.StackContainer.supertype.render.call(this, source);
    },
    append : function( item )
    {
        return this.push( item );
    },
    insert : function( pos, item )
    {
        Tea.StackContainer.supertype.insert.call(this, pos, item);
        this.refresh( item );
    },
    /** Tea.StackContainer.push(item, after)
        
        Pushes the *item*.
        If *after* is specified, all items after it will be popped before
        pushing the *item*.
    **/
    push : function( item, after )
    {
        if (after)
        {
            this.pause();
            this.popAfter(after);
            this.play();
        }
        
        item = Tea.StackContainer.supertype.append.call(this, item);
        this.refresh( item );
    },
    pop : function( item )
    {
        if (item)
        {
            if (item.parent !== this) throw new Error("Popping an item that isn't in the Tea.StackContainer.");
            
            for(var i = item._index; i < this.items.length; i++)
            {
                if (this.items[i].source)
                    this.items[i].skin.remove();
                    
                item.parent = null;
            }
            
            this.items.splice(item._index, this.items.length - item._index);
        }
        else
        {
            var item = this.items[this.items.length-1];
            Tea.StackContainer.supertype.remove.call(this, item);
        }
        
        this.refresh();
        return item;
    },
    own : function( item )
    {
        var item = this.__super__(item);
        var self = this;
        item.bind('close', function()
        {
            self.pop(item);
        })
        return item;
    },
    remove : function( item )
    {
        this.pop(item);
    },
    popAfter : function( item )
    {
        var next = this.items[item._index+1];
        if (next)
            this.pop(next);
    },
    refresh : function( panel )
    {
        if (!this.skin || this.paused > 0) return;
        
        this.skin.refresh( panel );
    },
    pause : function()
    {
        this.paused += 1;
    },
    play : function()
    {
        this.paused -= 1;
    }
})

Tea.StackContainer.Skin = Tea.Container.Skin.subclass('Tea.StackContainer.Skin', {
    options: {
        cls: 't-stack'
    },
    refresh : function( new_item )
    {
        var element = this.element;
        var i, k, item;
        var len = element.items.length;
        var hidden = [];
        var shown = [];
        
        var sz = element.options.columns;
        for (i = 0; i < len; i++)
        {
            item = element.items[len - i - 1];
            if (sz > 0)
            {
                shown.push(item);
                sz -= (item.options.size || 1);
                if (item.options.size == 2)
                    item.source.addClass('t-wide')
            }
            else
                hidden.push(item);
        }
        shown.reverse();
        
        var width = (element.source.width() / element.options.columns) - (element.options.space / 2);
    
        for (var i=0; i<hidden.length; i++)
            hidden[i].source.hide().css('left', -width + 50);
        
        k = 0;
        for (var i=0; i<shown.length; i++)
        {
            var item = shown[i];
            var size = item.options.size || 1;
            var left = ((width + element.options.space) * k);
            
            if (item == new_item)
                item.source.css({
                  left: left,
                  opacity: 0,
                  width: width * size
                });
            
            item.source.show().css({
                position: 'absolute',
                width: width * size
            }).animate({
                left: left,
                opacity: 1
            });
            
            k += item.options.size || 1;
        }
    }
})

Tea.StackContainer.StretchySkin = Tea.StackContainer.Skin.subclass("Tea.StackContainer.Stretchy", {
    options: {
        buffer: 100,
        scrollParent: window
    },
    render : function()
    {
        var result = Tea.StackContainer.StretchySkin.supertype.render.apply(this, arguments);
        
        $(window).resize( Tea.method(this.onResize, this) );
        $(window).scroll( Tea.latent(300, this.onScroll, this) );
        $(window).scroll( Tea.latent(300, this.onResize, this) );
        
        return result;
    },
    refresh : function( new_item )
    {   
        var result = this.__super__( new_item );
        
        if (new_item)
            this.correct( new_item );
        
        return result;
    },
	onResize : function()
	{
	    var width = this.source.parent().width() || this.source.width();
	    
	    this.element.options.columns = parseInt(width / this.element.options.column_width);
	    
	    this.refresh();
	},
	correct : function(item)
	{
	    if (item.options.title == 'Tea') return;
	        
	    var fold = $(this.options.scrollParent).scrollTop();
	    var height = $(this.options.scrollParent).height();
	    
	    var s = item.source;
	    var buffer = this.options.buffer;
	    
	    var top = s.offset().top;
	    var bottom = s.offset().top + s.height();
	    
	    var b_delta = bottom - (fold + $(window).height());
	    var t_delta = fold - top;
	    
	    var new_top = null;
	    if (b_delta > 0)
	        new_top = top - b_delta;
	        
	    if (s.height() > height)
	    {	    
	        if (t_delta < 0)
	            new_top = fold;
	    }
	    else
	    {
	        if (t_delta != 0)
	            new_top = fold;
	    }
	    
	    if (new_top != null)
	    {
	        new_top = new_top - this.source.offset().top;
    	    if (new_top < 0)
    	        new_top = 0
	        s.animate({top: new_top}, 'fast');
        }
	},
	onScroll : function()
	{   
	    this._scrolltimeout
	    var self = this;
	    this.element.each(function()
	    {
	        self.correct(this);
	    });
	}
});

Tea.pushStack = function(element, requester)
{
    var now = requester.parent;
    var child = requester;
    while(now) {
        if (now.__stack__) {
            return now.push(element, child);
        }
        child = now;
        now = now.parent;
    }
    console.log("Fail.");
}