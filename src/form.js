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
        context: null,
        method: 'post',
        submit: null,
        hasFocus: true,
        value: null,
        processor: null,
        upload: false,  // Uploading a file?
        type: 'ajax'    // classic, ajax, iframe
    },
    _submit : function(options)
    {   
        if (this.type == 'iframe')
        {
            this.trigger('submit');
            return true;
        }
        
        var data = {};
        
        this.each(function() { if (this.name) data[this.name] = this.getValue() });
        
        if (this.filter)
            data = this.filter.call(this.context || this, data);
        
        if (this.submit)
        {
            try {
                return this.submit.call(this.context || this, data);
            } catch(e) { 
                console.error(e);
                return false;
            }
        }
        
        var options = jQuery.extend({
            method: this.method,
            success: this.success,
            invalid: this.invalid,
            context: this.context || this,
            data: data,
            dataType: this.dataType,
            url: this.url
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
        
        var source = source || $('<form/>').attr('method', element.method).attr('action', element.url || '.');

        if (element.upload)
            source.attr('enctype', "multipart/form-data");
            
        if (element.type == 'iframe')
        {
            var iframe = $('<iframe class="t-hidden" src="#" style="width:0;height:0;border:0px solid #fff;"/>');
            var id = "upload-iframe-" + (Tea.Form.iframeCount++);
            iframe.attr('name', id).attr('id', id);
            source.append(iframe);
            source.attr('target', id);
            iframe.bind('load', function()
            {
                var msg = $(iframe[0].contentDocument.body).html();
                element.success.call(element.context || element, msg);
                return true;
            });
        }
        
        source = Tea.Form.Skin.supertype.render.call(this, source);
        source.submit(function() { 
            if (!element.validate()) return false;
            if (element.type == 'classic') return true;
            
            return element._submit();
        });
        
        source.append('<input type="submit" style="display: none;"/>');
        
        if (element.value)
            element.setValue(element.value);
        
        return source;
    }
});

Tea.Field = Tea.Element.subclass('text', {
    options: {
        name: null,
        value: null,
        label: null,
        errors: null,
        hasFocus: false,
        disabled: false,
        skin: 'Tea.Field.Skin',
        disabled: false
    },
    getValue : function()
    {
        if (this.isRendered())
            return this.skin.getValue();
        else
            return this.value;
    },
    setValue : function(v)
    {   
        this.value = v;
        if (this.isRendered())
            this.skin.setValue(v);
    },
    focus : function()
    {
        if (this.isRendered())
            this.skin.focus();
        else
            this.hasFocus = true;
    },
    blur : function()
    {
        if (this.isRendered())
            this.skin.blur();
        else
            this.hasFocus = false;
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
    disable : function()
    {
        this.setDisabled(true);
    },
    enable : function()
    {
        this.setDisabled(false);
    },
    setDisabled : function(flag)
    {
        this.disabled = flag;
        if (this.isRendered())
            this.source.setDisabled(flag);
    },
    validate : function()
    {}
});

Tea.Field.Skin = Tea.Element.Skin.subclass('Tea.Field.Skin', {
    options : {
        cls: 't-field'
    },
    render : function()
    {
        var element = this.element;
        
        this.label = this.createLabel();
        this.field = this.createField();
        
        Tea.Field.Skin.supertype.render.call(this);
        
        if (this.element.label)
            this.source.append(this.label);
        
        this.source.append(this.field);
        
        if (element.value)
            this.setValue(element.value);
        if (element.label)
            this.setLabel(element.label);
        else if (element.name)
            this.setLabel(element.name);
        
        if (element.hidden)
            this.source.hide();
            
        if (element.hasFocus)
            this.focus();
            
        if (element.disabled)
            this.setDisabled(true);
        
        return this.source;
    },
    createField : function()
    {
        return $('<input type="text"/>').attr('name', this.element.name);
    },
    createLabel : function()
    {
        return $('<label>');
    },
    setValue : function(v)
    {
        this.field.val(v);
    },
    getValue : function()
    {
        return this.field.val();
    },
    setLabel : function(v)
    {
        if (this.label)
            this.label.html(v);
    },
    getLabel : function()
    {
        if (this.label)
            return this.label.html();
        return null;
    },
    focus : function()
    {
        this.field.focus();
    },
    blur : function()
    {
        this.field.blur();
    },
    setDisabled : function(flag)
    {
        if (flag) 
            this.field.attr("disabled", true);
        else
            this.field.removeAttr("disabled");
    }
})

Tea.Field.hidden = Tea.Field.subclass('hidden', {
    options: {
        hidden: true,
        skin: Tea.Field.Skin.subclass({
            createLabel : function() {  return null;  },
            createField : function() {  return $('<input type="hidden"/>').attr('name', this.element.name)  }
        })
    }
})

Tea.Field.password = Tea.Field.subclass('password', {
    options: {
        skin: Tea.Field.Skin.subclass({
            createField : function() {  return $('<input type="password"/>').attr('name', this.element.name)  }
        })
    }
})

Tea.Field.checkbox = Tea.Field.subclass('checkbox', {
    options: {
        skin: Tea.Field.Skin.subclass({
            createField : function() {  return $('<input type="checkbox"/>').attr('name', this.element.name)  },
            getValue : function() {  return this.field.attr('checked') },
            setValue : function(v) { this.field.attr('checked', v ? 'checked' : '') }
        })
    }
})

Tea.Field.textarea = Tea.Field.subclass('textarea', {
    options: {
        skin: Tea.Field.Skin.subclass({
            createField : function() {  return $('<textarea/>').attr('name', this.element.name)  }
        })
    }
})

Tea.Field.static = Tea.Field.subclass('static', {
    options: {
        skin: Tea.Field.Skin.subclass({
            createField : function() { return $('<div class="t-static"/>').attr('name', this.element.name)  },
            getValue : function() { return this.field.html() },
            setValue : function(v) { this.field.html(v) },
        })
    }
});

Tea.Field.select = Tea.Field.subclass('select', {
    options: {
        skin: Tea.Field.Skin.subclass({
            createField : function() {
                var field = $('<select/>').attr('name', this.element.name);    
        
                this.values = {};
                this.indexes = {};
                for(var i = 0; i < this.element.choices.length; i++)
                {
                    var display;
                    var value = this.element.choices[i];
                    
                    if (value.constructor === Array)
                    {
                        display = value[1];
                        value = value[0];
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
            getValue : function() { return this.values[this.field[0].selectedIndex] },
            setValue : function(v) { this.field[0].selectedIndex = this.indexes[v] }
        })
    }
});

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
        if (val.length < this.minLength)
            return this.hideList();
        
        var self = this;
        this.timeout = setTimeout( function(){ self.onChange(e) }, this.delay);
        return;
    },
    onChange : function(e)
    {       
        var term = this.search_item.input.val();
        if (term.length < this.minLength)
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
            this.pool = this.pool;
            
            this.list = new Tea.List({
                cls: 't-dropdown',
                value: this.pool,
                onSelect: function()
                {
                    try {
                        this.setValue(this.list.selected.getValue());
                    } catch(e) { console.error(e) }
                    this.hideList();
                },
                context: this
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