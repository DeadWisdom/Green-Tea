/** Tea.Container
    
    An element that contains other elements.
    
    @requires Tea.Element
    
    More comments.
 **/

Tea.Container = Tea.Element.extend('t-container', {
    options: {
        items: null,
        fields: null,
        skin: 't-container-skin'
    },
    __init__ : function(options)
    {
        this.__super__(options);
        var items = jQuery.makeArray(this.items);
        this.items = [];
        this.fields = {};
        
        var container = this;
        jQuery.each(items, function(index, item) {
            container.append(item); 
        })
    },
    /** Tea.Container.own(item)
        
        Owns the <item>, asserting that <item.parent> points to <this>.
    **/
    own : function(item)
    {
        item = Tea.manifest(item);
        
        if (item.parent)
            item.remove();
        
        item.parent = this;
        
        if (item.name)
            this.fields[item.name] = item;
        
        return item;
    },
    setValue : function(value)
    {
        if (value == null || value == undefined) return;
        
        for(var key in this.fields)
            if (value[key] != undefined)
                this.fields[key].setValue(value[key]);
    },
    getValue : function()
    {   
        var gather = {};
        for(var key in this.fields)
            gather[key] = this.fields[key].getValue();
        return gather;
    },
    append : function(item)
    {
        item = this.own(item);
        
        item._index = this.items.length;
        this.items.push(item);
        
        if (this.isRendered())
            this.skin.append(item.render());
        
        return item;
    },
    insert : function(pos, item)
    {
        if (typeof pos != 'number') throw new Error("Recieved a non-number for the 'pos' argument in insert(pos, item).");
        
        if (pos >= this.items.length)
            return this.append(item);
        
        item = this.own(item);
        
        this.items.splice(pos, 0, item);
        
        for(var i=0; i < this.items.length; i++)
            this.items[i]._index = i;
        
        if (this.isRendered())
        {
            if (item._index == 0)
                this.skin.prepend(item.render())
            else
                this.skin.after(this.items[item._index - 1].source, item.render());
        }
        
        return item;
    },
    prepend : function(item)
    {
        return this.insert(0, item);
    },
    remove : function(item)
    {
        if (!item) return this.__super__(); // Act as an element, remove this.
        if (item.parent !== this) return;
        
        this.items.splice(item._index, 1);
        if (item.isRendered())
            item.skin.remove();
            
        item.parent = null;
        
        for(var i=0; i < this.items.length; i++)
            this.items[i]._index = i;
    },
    empty : function()
    {
        for(var i=0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.isRendered())
                item.skin.remove();
            item.parent = null;
        }
        this.items = [];
    },
    clear : function()
    {
        for(var i=0; i < this.items.length; i++)
        {
            var item = this.items[i];
            if (item.isRendered())
                item.skin.remove();
            item.parent = null;
        }
        this.items = [];
    },
    each : function(func, context)
    {
        if (context)
            jQuery.each(this.items, function() { func.apply(context, arguments) });
        else
            jQuery.each(this.items, func);
    }
})

Tea.Container.Skin = Tea.Skin.extend('t-container-skin', {
    render : function(source)
    {
        var source = this.__super__(source);
        
        var items = this.element.items;
        for(var i=0; i < items.length; i++)
            this.append(items[i].render());
        
        return source;
    },
    append : function(src)
    {
        this.source.append(src);
    },
    prepend : function(src)
    {
        this.source.prepend(src);
    },
    after : function(pivot, src)
    {
        pivot.after(src);
    }
})