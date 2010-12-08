/** Tea.Container
    
    An element that contains other elements.
    
    @requires Tea.Element
    
    More comments.
 **/

Tea.Container = Tea.Element.extend('t-container', {
    options: {
        items: null,
        fields: null,
        skin: 't-container-skin',
        layout: null
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
        
        if (this.isRendered()) {
            this.skin.append(item.render());
            this.resize();
        }
        
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
            
            this.resize();
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
        
        item.parent = null;
        item.remove();
                
        for(var i=0; i < this.items.length; i++)
            this.items[i]._index = i;
    },
    empty : function()
    {
        while(this.items.length > 0) {
            var item = this.items.pop();
            item.parent = null;
            item.remove();
        }
        this.items = [];
    },
    clear : function()
    {
        this.empty();
    },
    each : function(func, context)
    {
        context = context || this;
        jQuery.each(this.items, function() { func.apply(context, arguments) });
    },
    resize : function()
    {
        this.__super__();
        
        for(var i=0; i < this.items.length; i++) {
            this.items[i].resize();
        }
    }
})

Tea.Container.Skin = Tea.Skin.extend('t-container-skin', {
    render : function(source)
    {
        var source = this.__super__(source);
        
        var items = this.element.items;
        for(var i=0; i < items.length; i++)
            this.append(items[i].render());
        
        if (this.element.layout)
            this.element.layout = Tea.manifest(this.element.layout);
        
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
    },
    resize : function() {
        if (this.element.layout) return this.element.layout.resize(this.element);
    }
});

Tea.Layout = Tea.Class('t-layout', {
    resize : function(container) 
    {},
    getSize : function(size) {
        if (size == 'fill') return 0;
        if (!size) return 0;
        return size;
    }
});

Tea.Layout.VSplit = Tea.Layout.extend('t-vsplit', {
    resize : function(container) {
        var heights = 0;
        var fills = 0;
        var sz = 0;
        var getSize = this.getSize;
        var content = null;
        
        container.each(function(i, item) {
            if (!item.isRendered()) return;
            if (!content) content = item.source.offsetParent();
            heights += getSize(item.height);
            if (item.height == 'fill') fills += 1;
            sz += 1;
        });
        
        var wiggle = content.height() - heights - 2;
        var fill = wiggle / fills;
        var last = 0;
        
        container.each(function(i, item) {
            if (!item.isRendered()) return;
            var source = item.source;
            var height = (item.height == 'fill' ? fill : item.height);
            
            source.css({
                position: 'absolute',
                top: last,
                height: height,
                left: 0,
                right: 0
            })
            
            last = last + height + 1;
        })
    }
})