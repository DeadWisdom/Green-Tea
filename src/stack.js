/** Tea.Stack

    A container that acts as a stack, you can push and pop onto it.
    
    The default skin pushes elements onto it from the right to the left, so
    that you only see the top few elements that can fit on the screen.
    
    @requires Tea.Container
    @extends Tea.Container
 **/

Tea.Stack = Tea.Container.extend('t-stack', {
    options: {
        skin: 't-stack-skin',
        margin: 6,
//        anchor: 0
    },
    __init__ : function(options)
    {
        this.__super__(options);
        this.paused = 1;
    },
    render : function(source)
    {
        var self = this;
        setTimeout(function() { self.refresh() }, 100);
        
        this.paused = 0;
        return this.__super__(source);
    },
    append : function( item )
    {
        item = this.__super__(item);
        this.refresh( item );
        return item;
    },
    insert : function( pos, item )
    {
        this.__super__(pos, item);
        this.refresh( item );
    },
    /** Tea.Stack.push(item, [after])
        
        Pushes the *item* onto the stack.
        
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
        
        this.append(item);
    },
    /** Tea.Stack.pop( [item] )
        
        Pops the top item off the stack.
        
        If *item* is specified, it will pop that item and all after it.
    **/
    pop : function( item )
    {
        this.pause();
        
        if ( item )
            this.popAfter( item );
        else
            item = this.items[this.items.length-1]
        
        this.remove(item);
        
        this.play();
        
        this.refresh();
        return item;
    },
    own : function( item )
    {
        var item = this.__super__(item);
        var self = this;
        this.hook(item, 'close', function()
        {
            self.pop(item);
        })
        return item;
    },
    popAfter : function( item )
    {
        if (item.parent !== this) return; // throw new Error("Trying to popAfter() an item that isn't in this Tea.Stack");
        
        this.pause();
        
        while(this.items.length > item._index + 1)
            this.remove(this.items[item._index + 1]);
            
        this.play();
        this.refresh();
    },
    refresh : function( panel )
    {
        if (!this.isRendered() || this.paused > 0) return;
        
        this.skin.refresh( panel );
    },
    remove : function( item )
    {
        this.__super__( item );
        if (item)
            this.refresh();
    },
    pause : function()
    {
        this.paused += 1;
    },
    play : function()
    {
        this.paused -= 1;
        if (this.paused < 0) this.paused = 0;
    }
})

Tea.Stack.Skin = Tea.Container.Skin.extend('t-stack-skin', {
    options: {
        cls: 't-stack',
    },
    render : function(source)
    {
        source = this.__super__(source);
        $(window).resize(Tea.method(this.refresh, this));
        return source;
    },
    refresh : function( new_item )
    {
//        var anchor = element.anchor;
        var element = this.element;
        var items = element.items;
        var gutter = element.margin;
        var max_width = element.source.width();
        var width = gutter;
        
        var show = 0;
        
        for(var i = items.length-1; i >= 0; i--) {
            var item = items[i];
            var w = item.source.width() + gutter;
            if (width + w > max_width && show > 0)
                break;
            width += w;
            show += 1;
        }
        
        var start = items.length - show;
        var left = gutter;
        
        element.each(function(index, item) {
            if (index < start) {
                item.source.hide().css('left', 0 - item.source.width() - gutter);
                return;
            }
            
            if (item == new_item)
                item.source.css({
                  left: left,
                  opacity: 0,
                });
            
            item.source
                .stop(true, true)
                .show()
                .css('position', 'absolute')
                .animate({
                    left: left,
                    opacity: 1
                });
                
            left += (item.source.width() + gutter);
        });
    }
});

Tea.pushStack = function(element, requester)
{
    var now = requester.parent;
    var child = requester;
    while(now) {
        if (now instanceof Tea.Stack) {
            return now.push(element, child);
        }
        child = now;
        now = now.parent;
    }
    throw new Error("Cannot find the stack owner of the requester on Tea.pushStack.");
}