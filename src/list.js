/** Tea.List

    A container that lists content as Tea.ListItem elements.
    
    @requires Tea.Container
 **/

Tea.List = Tea.Container.subclass('Tea.List', {
    options: {
        template: null,
        itemCls: 'Tea.ListItem',
        value: null,
        onSelect: null,
        scope: null
    },
    __init__ : function()
    {
        Tea.List.supertype.__init__.apply(this, arguments);
        
        this.value = [];
        this.selected = null;
        this.hover = null;
        this.template = null;
        
        if (this.options.template)
        {
            if (typeof this.options.template == 'string')
                this.template = new Tea.Template(this.options.template);
            else
                this.template = this.options.template;
        }
        
        if (this.options.value)
            this.setValue(this.options.value);
    },
    select : function( item )
    {
        if (this.selected)
            this.selected.setSelected(false);
        
        this.selected = item;
        this.selected.setSelected(true);
        
        this.trigger('select', item);
        
        if (this.options.onSelect)
            this.options.onSelect.call(this.options.scope || this, item);
    },
    hoverNext : function()
    {   
        if (this.items.length == 0) return;
        
        if (this.hover == null)
            this.hover = 0;
        else
        {
            this.items[this.hover].setHover(false);
            this.hover += 1;
        }
            
        if (this.hover >= this.items.length)
            this.hover = this.items.length - 1;
        
        this.items[this.hover].setHover(true);
    },
    hoverPrev : function()
    {
        if (this.items.length == 0) return;
        
        if (this.hover == null)
            this.hover = this.items.length -1;
        else
        {
            this.items[this.hover].setHover(false);
            this.hover -= 1;
        }
        
        if (this.hover < 0)
            this.hover = 0;
            
        this.items[this.hover].setHover(true);
    },
    getHoverItem : function()
    {
        return this.items[this.hover];
    },
    hoverSelect : function()
    {
        this.select( this.getHoverItem() );
    },
    setHover : function(index)
    {
        if (this.hover != null)
        {
            if (this.hover == index) return;
            this.items[this.hover].setHover(false);
        }
        
        if (this.items.length == 0 || index == null) return this.hover = index;
        
        if (index >= this.items.length) index = this.items.length - 1;
        if (index < 0) index = 0;
        
        this.hover = index;
        this.items[this.hover].setHover(true);
    },
    createItem : function( value, options )
    {
        var item = null;
        
        options = jQuery.extend({}, options);
        options.list = this;
         
        if (this.template)
            options.template = this.template;
            
        if (typeof value.getListItem == 'function')
            return value.getListItem(options);
        
        var cls = value.__itemCls || this.options.itemCls;
        if (typeof cls == 'string')
            cls = Tea.getClass(cls);

        if (value != null && value != undefined)
            options.value = value;
        
        return new cls( options );
    },
    append : function( value, options )
    {
        this.value.push(value);
        return Tea.List.supertype.append.call(this, this.createItem( value, options ) );
    },
    insert : function(pos, value, options)
    {
        this.value.splice(pos, 0, value);
        return Tea.List.supertype.insert.call(this, pos, this.createItem( value, options ) );
    },
    prepend : function(value, options)
    {
        return this.insert(0, value, options);
    },
    setValue : function( value, keep_resource )
    {
        if (typeof value.load == 'function')
        {
            this.resource = value;
            this.refresh();
            if (this.options.loading)
                Tea.List.supertype.append.call(this, this.createItem( this.options.loading ) );
        }
        else
        {
            if (!keep_resource)
                this.resource = null;
            
            this.value = [];
            this.hover = null;
            this.clear();           // TODO: could be made more efficient by recycling existing items.
            
            for(var i = 0; i < value.length; i++)
                this.append(value[i]);
        }
        this.trigger('value', value);
    },
    getValue : function()
    {
        return this.value;
    },
    getResource : function()
    {
        return this.resource;
    },
    setResource : function(resource)
    {
        return this.resource = resource;
    },
    refresh : function()
    {
        if (!this.resource)
            return;
        
        this.resource.load({
            scope: this,
            onLoad : function(v) { 
                this.setValue(v, true);
            }
        });
    }
})

Tea.List.Skin = Tea.Container.Skin.subclass('Tea.List.Skin', {
    options : {
        cls: 't-list'
    },
    render : function()
    {
        Tea.List.Skin.supertype.render.apply(this, arguments);
        
        var element = this.element;
        this.source.hover(function() {}, function() { element.setHover(element.selected ? element.selected._index : null) });
        
        return this.source;
    }
})

Tea.ListItem = Tea.Element.subclass('Tea.ListItem', {
    options: {
        skin: null,
        value: null,
        template: null,
        list: null,
    },
    __init__ : function()
    {
        Tea.ListItem.supertype.__init__.apply(this, arguments);
        
        this.template = null;
        this.value = null;
        this.list = null;
        this.selected = false;
        
        if (this.options.template)
            this.setTemplate(this.options.template);
            
        if (this.options.value)
            this.setValue(this.options.value);
            
        if (this.options.list)
            this.setList(this.options.list);
    },
    setList : function(list)
    {
        this.list = list;
        var me = this;
        this.bind('select', function()
        {
            list.select(me);
        })
    },
    setTemplate : function(template)
    {
        if (typeof template == 'string') template = new Tea.Template(template);
        this.template = template;
    },
    setValue : function(v)
    {
        this.value = v;
        if (this.source)
            if (this.template)
                this.skin.setValue( this.template.apply(v) );
            else if (this.value.options && this.value.options.template)
                this.skin.setValue( this.value.options.template.apply(v) );
            else
                this.skin.setValue( v );
    },
    setSelected : function(bool)
    {
        this.selected = bool;
        if (this.source)
            this.skin.setSelected(bool);
    },
    setHover : function(bool)
    {
        this.hover = bool;
        if (this.source)
            this.skin.setHover(bool);
    },
    getValue : function()
    {
        return this.value;
    },
    refresh : function()
    {
        this.setValue(this.value);
    },
    render : function()
    {
        Tea.ListItem.supertype.render.apply(this, arguments);
        
        if (this.selected)
            this.skin.setSelected(true);
            
        this.refresh();
        
        return this.source;
    }
})

Tea.ListItem.Skin = Tea.Element.Skin.subclass('Tea.ListItem.Skin', {
    options: {
        cls: 't-item'
    },
    render : function()
    {
        Tea.ListItem.Skin.supertype.render.call(this);
        
        var element = this.element;
        
        if (element._index % 2 == 0)
            this.source.addClass('t-even');
        else
            this.source.addClass('t-odd');
        
        this.source.bind('click', function() { element.trigger('select') });
        if (element.list)
            this.source.bind('mouseover', function() { element.list.setHover(element._index) });
        
        element.refresh();
        
        return this.source;
    },
    setValue : function(v)
    {
        this.source.empty();
        try {
            this.source.append(v);
        } catch (e) {
            console.error("Error setting value in Tea.ListItem [%r] - Tea.ListItem.Skin.setValue(%r): ", this, v);
            if (Tea._testing)
                throw e;
        }
    },
    setSelected : function(bool)
    {
        if (bool)
            this.source.addClass('t-selected');
        else
            this.source.removeClass('t-selected');
    },
    setHover : function(bool)
    {
        if (bool)
            this.source.addClass('t-hover');
        else
            this.source.removeClass('t-hover');
    }
})
