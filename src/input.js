/** Tea.Input
    
    An input element, which is to say anything that interacts with the user
    as a unit element, like a text input, or select.
    
    The value is normally merely a proxy to the input value.
    
    @requires Tea.Container
 **/

Tea.Input = Tea.Element.extend('t-input', {
    options : {
        value: null,
        hasFocus: false,
        disabled: false
    },
    render : function(source)
    {
        source = this.__super__(source);
        this.setValue(this.value);
        return source;
    },
    getValue : function()
    {
        if (this.isRendered())
            return this.skin.getValue();
        return this.value;
    },
    setValue : function(v)
    {
        if (this.isRendered())
            return this.skin.setValue(v);
        this.value = v;
    },
    isValid : function()
    {
        return true;
    },
    focus : function()
    {
        if (this.isRendered())
            this.skin.setFocus(true);
        else
            this.hasFocus = true;
    },
    blur : function()
    {
        if (this.isRendered())
            this.skin.setFocus(false);
        else
            this.hasFocus = false;
    },
    disable : function()
    {
        if (this.isRendered())
            this.skin.setDisabled(true);
        else
            this.disabled = true;
    },
    enable : function()
    {
        if (this.isRendered())
            this.skin.setDisabled(false);
        else
            this.disabled = false;
    }
});

Tea.TextInput = Tea.Input.extend('t-text-input', {
    options : {
        source: '<input>',
        skin: 't-text-input-skin',
        blank: true,
        re: null,
        password: false,
        maxlength: null,
        emptyText: null
    },
    isValid : function()
    {
        var value = this.getValue();
        if (!this.blank && jQuery.trim( value ) == "")
            return false;
        if (this.re && !(this.re instanceof RegExp))
            this.re = new RegExp(this.re);
        if (this.re && !this.re.test( value ))
            return false;
        if (this.maxlength && value.length > this.maxlength)
            return false;
        return true;
    }
});

Tea.PasswordInput = Tea.TextInput.extend('t-password-input', {
    options : {
        password: true
    }
});

Tea.TextInput.Skin = Tea.Skin.extend('t-text-input-skin', {
    render : function(source)
    {
        this.empty = false;
        var element = this.element;
        source = this.__super__(source);
        
        if (element.password)
            source.attr('type', 'password');
        else
            source.attr('type', 'text');
            
        if (element.maxlength)
            source.attr('maxlength', this.element.maxlength);
            
        if (element.emptyText)
            this.setupEmptyText(element.emptyText);
            
        if (element.hasFocus)
            this.setFocus(true);
            
        if (element.disabled)
            this.setDisabled(true);
        
        return source;
    },
    setFocus : function(flag)
    {
        if (flag)
            this.source.focus();
        else
            this.source.blur();
    },
    setValue : function(val)
    {
        this.source.val(val);
        if (this.emptyText)
            this.refreshEmpty();
    },
    getValue : function()
    {
        if (this.empty) return "";
        return this.source.val();
    },
    setupEmptyText : function(t)
    {
        this.emptyText = t;
        this.source.blur( Tea.method(this.refreshEmpty, this) );
        this.source.focus( Tea.method(this.clearEmpty, this) );
        this.refreshEmpty();
    },
    refreshEmpty : function()
    {
        var val = jQuery.trim(this.source.val());
        if (val == '')
        {
            this.empty = true;
            this.source.val(this.emptyText);
            this.source.addClass('t-empty');
        }
        else 
        {
            this.empty = false;
            this.source.removeClass('t-empty');
        }
    },
    clearEmpty : function()
    {
        if (this.empty)
        {
            this.source.val("");
            this.source.removeClass('t-empty');
            this.empty = false;
        }
    },
    setDisabled : function(flag) {
        if (flag) {
            this.source.addClass('t-disabled');
            this.source.attr('readonly', 'readonly');
        } else {
            this.source.removeClass('t-disabled');
            this.source.attr('readonly', null);
        }
    }
});


Tea.TextAreaInput = Tea.Input.extend('t-text-area-input', {
    options : {
        source: '<textarea>',
        skin: 't-text-area-input',
        blank: true
    },
    isValid : function()
    {
        var value = this.getValue();
        if (!this.blank && jQuery.trim( value ) == "")
            return false;
        return true;
    }
});

Tea.TextAreaInput.Skin = Tea.Skin.extend('t-text-area-input', {
    render : function(source) {
        var element = this.element;
        source = this.__super__(source);
        
        if (element.hasFocus)
            this.setFocus(true);
        
        return source;
    },
    setFocus : function(flag)
    {
        if (flag)
            this.source.focus();
        else
            this.source.blur();
    },
    setValue : function(val)
    {
        this.source.val(val);
    },
    getValue : function()
    {
        return this.source.val();
    }
});

Tea.SelectInput = Tea.Input.extend('t-select-input', {
    options: {
        source: '<select/>',
        skin: 't-select-input-skin',
        choices: null
    }
});

Tea.SelectInput.Skin = Tea.Skin.extend('t-select-input-skin', {
    render : function(source)
    {
        source = this.__super__(source);
        
        var index_to_value = this.index_to_value = {};
        var value_to_index = this.value_to_index = {};
        
        jQuery.each(this.element.choices, function(index, choice) {
            var display, value;
            if (choice.constructor === Array)
            {
                value = choice[0];
                display = choice[1];
            }
            else
            {
                display = value = choice;
            }
            index_to_value[index] = value;
            value_to_index[value] = index;
            
            $('<option/>').html(display).appendTo(source);
        });
        
        return source;
    },
    getValue : function()
    { 
        return this.index_to_value[this.source[0].selectedIndex];
    },
    setValue : function(v) 
    { 
        var index = this.value_to_index[v];
        if (index == undefined) return;
        this.source[0].selectedIndex = index;
    },
    setFocus : function(flag)
    {
        if (flag)
            this.source.focus();
        else
            this.source.blur();
    }
});

Tea.CheckBoxInput = Tea.Input.extend('t-checkbox-input', {
    options: {
        source: '<input type="checkbox"/>',
        skin: 't-checkbox-input-skin',
        choices: null
    }
});

Tea.CheckBoxInput.Skin = Tea.Skin.extend('t-checkbox-input-skin', {
    getValue : function()
    { 
        return this.source.attr('checked')
    },
    setValue : function(v)
    {
        this.source.attr('checked', v ? 'checked' : '')
    },
    setFocus : function(flag)
    {
        if (flag)
            this.source.focus();
        else
            this.source.blur();
    }
});