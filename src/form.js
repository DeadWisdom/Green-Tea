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
        var opts = this.getInputOptions();
        this.input = Tea.manifest(opts);
    },
    getInputOptions : function() {
        var options = this.input || {};
        options.name = this.name;
        options.value = this.value;
        return options;
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
        input: {type: 't-text-input'},
        blank: true,
        re: null,
        password: false,
        maxlength: null,
        emptyText: null,
        autocompelte: true
    },
    getInputOptions : function() {
        var options = this.__super__();
        options.blank = this.blank;
        options.re = this.re;
        options.password = this.password;
        options.maxlength = this.maxlength;
        options.emptyText = this.emptyText;
        options.attrs = this.autocomplete ? {} : {autocomplete: 'off'};
        return options;
    }
});

Tea.PasswordField = Tea.TextField.extend('t-password', {
    options: {
        password: true
    }
});

Tea.TextAreaField = Tea.Field.extend('t-textarea', {
    options: {
        input: {type: 't-textarea-input'},
        blank: true,
        value: null
    },
    getInputOptions : function() {
        var options = this.__super__();
        options.blank = this.blank;
        return options;
    }
});

Tea.SelectField = Tea.Field.extend('t-select', {
    options: {
        input: {type: 't-select-input'},
        choices: []
    },
    getInputOptions : function() {
        var options = this.__super__();
        options.choices = this.choices;
        return options;
    }
});

Tea.CheckBoxField = Tea.Field.extend('t-checkbox', {
    options: {
        input: {type: 't-checkbox-input'},
        clickToggles: true
    }
})

