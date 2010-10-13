/** Tea.Field
    
    A field here is an element that holds a label, an input element, and
    error text.
    
    The value is normally merely a proxy to the input value.
    
    @requires Tea.Input
 **/

Tea.Field = Tea.Element.extend('t-field', {
    options: {
        label: null,
        input: null,
        erorr: null,
        value: null,
        name: null,
        skin: 't-field-skin'
    },
    __init__ : function(options) 
    {
        this.__super__(options);
        if (this.input)
        {
            this.input = Tea.manifest(this.input);
            this.input.setValue(this.value);
        }
    },
    setLabel : function(html)
    {
        if (this.isRendered())
            this.skin.setLabel(html);
        this.label = html;
    },
    getLabel : function()
    {
        if (this.isRendered())
            return this.skin.getLabel();
        return this.label;
    },
    setValue : function(v)
    {
        if (this.input)
            this.input.setValue(v);
        this.value = v;
    },
    getValue : function()
    {
        if (this.input)
            return this.input.getValue();
        return this.value;
    },
    setError : function(e)
    {
        if (this.isRendered())
            this.skin.setError(e);
        this.error = e;
    },
    getError : function()
    {
        if (this.isRendered())
            return this.skin.getError();
        return this.error;
    },
    clearError : function()
    {
        if (this.isRendered())
            return this.skin.clearError();
        this.error = null;
    },
    isValid : function()
    {
        if (this.input)
            return this.input.isValid();
        return true;
    },
    focus : function()
    {
        if (this.input)
            this.input.focus();
    },
    blur : function()
    {
        if (this.input)
            this.input.blur();
    },
    disable : function() {
        if (this.input)
            this.input.disable();
    },
    enable : function() {
        if (this.input)
            this.input.enable();
    }
})

Tea.Field.Skin = Tea.Skin.extend('t-field-skin', {
    options: {
        cls: 't-field'
    },
    render : function(source)
    {
        var element = this.element;
        source = this.__super__(source);
        
        if (element.label != null)
            this.setLabel(element.label);
        else
            this.label = null;
        
        if (element.input != null)
            element.input.render().appendTo(source);
            
        if (this.label) {
            this.label.click( function() { 
                if (element.input && element.input.focus) element.input.focus()
            });
            if (element.clickToggles)
                this.label.click( function() { 
                    element.setValue(!element.getValue());
                });
        }
        
        this.error = $('<div class="t-error">');
        return source;
    },
    setLabel : function(html)
    {
        if (!this.label)
            this.label = $('<label>').prependTo(this.source);
        this.label.html(html);
    },
    getLabel : function()
    {
        if (this.label)
            return this.label.html();
        return null;
    },
    setError : function(html)
    {
        this.clearError();
        if (html != null)
            this.error.appendTo(this.source).html(html);
    },
    getError : function()
    {
        return this.error.html();
    },
    clearError : function()
    {
        this.error.html("").remove();
    }
});

Tea.TextField = Tea.Field.extend('t-text', {
    options: {
        blank: true,
        re: null,
        password: false,
        maxlength: null,
        emptyText: null
    },
    __init__ : function(options)
    {
        this.__super__(options);
        
        this.input = Tea.TextInput({
            blank: this.blank,
            re: this.re,
            password: this.password,
            maxlength: this.maxlength,
            emptyText: this.emptyText
        });
    }
});

Tea.PasswordField = Tea.TextField.extend('t-password', {
    options: {
        password: true
    }
});

Tea.TextAreaField = Tea.Field.extend('t-textarea', {
    options: {
        blank: true,
        value: null
    },
    __init__ : function(options) {
        this.__super__(options);
        
        this.input = Tea.TextAreaInput({
            blank: this.blank,
            value: this.value
        });
    }
});

Tea.SelectField = Tea.Field.extend('t-select', {
    options: {
        choices: []
    },
    __init__ : function(options)
    {
        this.__super__(options);
        
        this.input = Tea.SelectInput({
            choices: this.choices,
            value: this.value
        });
    }
});

Tea.CheckBoxField = Tea.Field.extend('t-checkbox', {
    options: {
        input: 't-checkbox-input',
        clickToggles: true
    }
})

