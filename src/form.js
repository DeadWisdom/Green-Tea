/** Tea.Form
    
    Ajax and classic form creation and management.
    
    @requires Tea.Container
 **/

Tea.Form = Tea.Container.subclass('Tea.Form', {
    options: {
        url: null,
        success: null,
        callback: null,
        dataType: 'json',
        scope: null,
        method: 'post',
        submit: null,
        focus: true,
        value: null,
        processor: null,
        upload: false,  // Uploading a file?
        type: 'ajax'    // classic, ajax, iframe
    },
    __init__ : function()
    {
        this.fields = {};
        
        Tea.Form.supertype.__init__.apply(this, arguments);
    },
    own : function( item )
    {
        item = Tea.Form.supertype.own.call( this, item );
        if (item.name)
            this.fields[item.name] = item;
        return item;
    },
    _submit : function(options)
    {   
        if (this.options.type == 'iframe')
        {
            this.trigger('submit');
            return true;
        }
        
        var data = {};
        
        this.each(function() { if (this.name) data[this.name] = this.getValue() });
        
        if (this.options.filter)
            data = this.options.filter.call(this.scope || this, data);
        
        if (this.options.submit)
        {
            try {
                return this.options.submit.call(this.options.scope || this, data);
            } catch(e) { 
                console.error(e);
                return false;
            }
        }
        
        var options = jQuery.extend({
            method: this.options.method,
            success: this.options.success,
            invalid: this.invalid,
            scope: this.options.scope || this,
            data: data,
            dataType: this.options.dataType,
            url: this.options.url
        }, options);
        
        Tea.ajax(options);
        
        return false;
    },
    submit : function(options)
    {
        return this.source.submit();
    },
    invalid : function(response)
    {
        this.setErrors(response.__invalid__);
    },
    setErrors : function(errors)
    {
        for(var key in errors)
        {
            if (this.fields[key])
                this.fields[key].setErrors(errors[key]);
        }
    },
    getErrors : function()
    {
        var gather = {};
        for(var key in this.fields)
            gather[key] = this.fields[key].getErrors();
        return gather;
    },
    clearErrors : function()
    {
        for(var key in this.fields)
            this.fields[key].clearErrors();
    },
    setValue : function(value)
    {
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
    validate : function()
    {
        return true;
    },
    focus : function()
    {
        for(var key in this.fields)
        {
            if (this.fields[key].name)
                return this.fields[key].source.focus();
        }
    }
});

Tea.Form.iframeCount = 0;
Tea.Form.Skin = Tea.Container.Skin.subclass('Tea.Form.Skin', {
    options: {
        cls: 't-form'
    },
    render : function(source)
    {
        var element = this.element;
        
        var source = source || $('<form/>').attr('method', element.options.method).attr('action', element.options.url || '.');

        if (element.options.upload)
            source.attr('enctype', "multipart/form-data");
            
        if (element.options.type == 'iframe')
        {
            var iframe = $('<iframe class="t-hidden" src="#" style="width:0;height:0;border:0px solid #fff;"/>');
            var id = "upload-iframe-" + (Tea.Form.iframeCount++);
            iframe.attr('name', id).attr('id', id);
            source.append(iframe);
            source.attr('target', id);
            iframe.bind('load', function()
            {
                var msg = $(iframe[0].contentDocument.body).html();
                element.options.success.call(element.options.scope || element, msg);
                return true;
            });
        }
        
        source = Tea.Form.Skin.supertype.render.call(this, source);
        source.submit(function() { 
            if (!element.validate()) return false;
            if (element.options.type == 'classic') return true;
            
            return element._submit();
        });
        
        source.append('<input type="submit" style="display: none;"/>');
        
        if (element.options.value)
            element.setValue(element.options.value);
        
        return source;
    }
});

Tea.Field = Tea.Element.subclass('Tea.Field', {
    options: {
        name: null,
        value: null,
        label: null,
        skin: 'Tea.Field.Skin'
    },
    __init__ : function()
    {   
        Tea.Field.supertype.__init__.apply(this, arguments);
        
        this.name = this.options.name;
        this.type = this.options.type;
        this.label = this.options.label;
        this.model = (this.options.model ? Tea.getClass(this.options.model) : null);
        this.errors = null;
        this.field = null;
        this._value = null;
    },
    getField : function()
    {
        throw new Error("Abstract base class Tea.Field has no implimentation for getField().");
    },
    getLabel : function()
    {
        return jQuery('<label/>').append(this.options.label || this.name);
    },
    getValue : function()
    {
        var v = null;
        
        if (this.field)
            v = this.field.val();
        else
            v = this._value;
        
        if (this.model)
            return this.model.get( v );
        return v;
    },
    setValue : function(v)
    {   
        if (this.model)
            v = v.pk;
            
        if (this.field)
            this.field.val(v);
        this._value = v;
    },
    focus : function()
    {
        this.skin.focus();
    },
    blur : function()
    {
        this.skin.blur();
    },
    setErrors : function(error_list)
    {
        if (typeof error_list == 'string')
            error_list = [error_list];
            
        this.errors = error_list;
        this.source.addClass('t-error');
    },
    clearErrors : function()
    {
        this.source.removeClass('t-error');
    },
    getErrors : function()
    {
        throw new Error("Not Implimented.");
    },
    validate : function()
    {
        
    }
});

Tea.Form.prototype.classes = Tea.Field;

Tea.Field.Skin = Tea.Element.Skin.subclass('Tea.Field.Skin', {
    options : {
        cls: 't-field'
    },
    render : function() 
    {
        var element = this.element;
        
        this.label = element.label = element.getLabel();
        this.field = element.field = element.getField();
        
        Tea.Field.Skin.supertype.render.call(this);
        
        if (element._value)
            element.setValue(element._value);
        else if (element.options.value)
            element.setValue(element.options.value);
        
        if (this.label)
            this.source.append(this.label);
        this.source.append(this.field);
        
        if (element.options.hidden)
            this.source.hide();
        
        if (element.options.field_attrs)
            for(a in element.options.field_attrs)
                this.field.attr(a, element.options.field_attrs[a]);
        
        if (this._focus)
            this.field.focus();
        
        return this.source;
    },
    focus : function()
    {
        if (this.source)
            this.field.focus();
        else
            this._focus = true;
    },
    blur : function()
    {
        if (this.source)
            this.field.blur();
        else
            this._focus = false;
    }
})

Tea.Field.text = Tea.Field.subclass('Tea.Field.text', {
    getField : function() {  return $('<input type="text"/>').attr('name', this.name)  }
})

Tea.Field.hidden = Tea.Field.subclass('Tea.Field.hidden', {
    options: {
        hidden: true
    },
    getLabel : function() {  return null;  },
    getField : function() {  return $('<input type="hidden"/>').attr('name', this.name)  }
})

Tea.Field.password = Tea.Field.subclass('Tea.Field.password', {
    getField : function() {  return $('<input type="password"/>').attr('name', this.name)  }
})

Tea.Field.checkbox = Tea.Field.subclass('Tea.Field.checkbox', {
    getField : function() {  return $('<input type="checkbox"/>').attr('name', this.name)  },
    getValue : function() {  return this.field.attr('checked') },
    setValue : function(v) { return this.field.attr('checked', v ? 'checked' : '') }
})

Tea.Field.textarea = Tea.Field.subclass('Tea.Field.textarea', {
    getField : function() {  return $('<textarea/>').attr('name', this.name)  }
})

Tea.Field.static = Tea.Field.subclass('Tea.Field.static', {
    getField : function() {  return $('<div class="t-static"/>').attr('name', this.name)  },
    getValue : function()
    {
        var v = this._value;
        if (this.field) v = this.field[0].innerHTML; 
        
        if (this.model)
            return this.model.get( v );
        return v;
    },
    setValue : function(v)
    {
        if (this.model)
            v = v.pk;
        
        if (this.field) 
            this.field[0].innerHTML = v;
        this._value = v;
    }
})

Tea.Field.select = Tea.Field.subclass('Tea.Field.select', {
    getField : function() {
        this.choices = this.options.choices;
        var field = $('<select/>').attr('name', this.name);    
        
        this.values = {};
        this.indexes = {};
        for(var i = 0; i < this.choices.length; i++)
        {
            var display, value = this.choices[i];
            if (value.constructor === Array)
            {
                display = value[0];
                value = value[1];
            }
            else
            {
                display = value;
            }
            var option = $('<option>' + display + '</option>');
            field.append(option);
            this.values[i] = value;
            this.indexes[value] = i;
        }
        return field;
    },
    getValue : function()
    {
        var v;
        if (this.field)
            v = this.values[this.field[0].selectedIndex];
        else
            v = this.values[this._value];
        
        if (this.model)
            v = this.model.get( v ).getRef();
            
        return v;
    },
    setValue : function(v)
    {   
        if (v._model)
            v = v._pk;
            
        if (this.field)
            this.field[0].selectedIndex = this.indexes[v];
        
        this._value = this.indexes[v];
    }
})

Tea.Field.object = Tea.Field.subclass('Tea.Field.object', {
    options: {
        skin: null,
        delay: 340,
        minLength: 1,
        pool: null
    },
    getField : function() {
        this.timeout = null;
        
        this.search_item = $('<div class="t-item"></div>')
        this.search_item.icon = $('<div class="t-icon SearchIcon"/>').appendTo(this.search_item);
        this.search_item.input = $('<input type="text" class="t-name" autocomplete="no"/>').appendTo(this.search_item);
        
        var self = this;
        this.search_item.input.bind('keydown', function(e) { self.onKeyup(e) });
        this.search_item.input.bind('blur', function(e) { self.hideList() });
        this.search_item.input.bind('focus', function(e) { self.onChange() });
        
        var field = $('<div class="t-object t-medium">')
            .attr('name', this.name)
            .append(this.search_item);
        return field;
    },
    getValue : function()
    {
        return this.value;
    },
    setValue : function(v)
    {
        if (this.value_item)
            this.value_item.source.remove();
        
        if (v == null)
        {
            this.search_item.show();
            this.value = null;
            return;
        }
        
        var self = this;
        
        this.value = Tea.Model.get(v);
        this.value_item = this.value.getListItem({
            cls: 't-object-field-value',
            onDrop : function(item)
            {
                var value = item.getValue();
                if (value._model == 'auth.User' || value._model == 'auth.Group')
                {
                    self.setValue(value);
                }
            }
        });
        
        this.search_item.hide();
        this.field.append(this.value_item.render());
        this.value_item.show();
        this.value_item.source.bind('click', function()
        {
            self.setValue(null);
            self.search_item.input.focus();
        })
    },
    onKeyup : function(e)
    {
        var code = e.keyCode;
        var val = this.search_item.input.val();

        if (code == 38)    // Up
        {
            this.showList();
            this.list.hoverPrev();
            return e.preventDefault();
        }

        if (code == 40)    // Down
        {
            this.showList();
            this.list.hoverNext();
            return e.preventDefault();
        }

        if (code == 9 || code == 13)   // Tab || Return
        {
            this.showList();
            this.list.hoverSelect();
            return e.preventDefault();
        }

        if (code == 27)
        {
            this.hideList();
            e.stopPropagation();
            return e.preventDefault();
        }

        if (this.timeout) clearTimeout(this.timeout);
        
        var val = this.search_item.input.val();
        if (val.length < this.options.minLength)
            return this.hideList();
        
        var self = this;
        this.timeout = setTimeout( function(){ self.onChange(e) }, this.options.delay);
        return;
    },
    onChange : function(e)
    {       
        var term = this.search_item.input.val();
        if (term.length < this.options.minLength)
            return this.hideList();
            
        this.showList();
        
        this.list.resource.updateParams({term: term});
        this.list.refresh();
    },
    showList : function()
    {
        if (this.list)
            return this.list.show();
        
        if (!this.list)
        {
            this.pool = this.options.pool;
            
            this.list = new Tea.List({
                cls: 't-dropdown',
                value: this.options.pool,
                onSelect: function()
                {
                    try {
                        this.setValue(this.list.selected.getValue());
                    } catch(e) { console.error(e) }
                    this.hideList();
                },
                scope: this
            })
            
            var dim = {
                w: this.field.width(),
                h: this.field.height()
            }
        
            var src = this.list.render()
                .appendTo(this.field)
                .css({
                    top: dim.h,
                    width: dim.w
                });
            
            var self = this;
            this.list.bind('value', function()
            {
                self.list.setHover(0);
            })
        }
        
        this.list.show();
    },
    hideList : function()
    {
        if (this.list)
            this.list.hide();
    }
})

Tea.Field.object.Skin = Tea.Field.Skin.subclass('Tea.Field.object.Skin', {
    options: {
        cls: 't-field t-object-field'
    }
})