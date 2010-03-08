/** Tea.Editor

    @requires Tea.Panel
**/

App.Editor = Tea.Panel.subclass('App.Editor', {
    options: {
        title: 'Editor',
        target: null,
        size: 2
    },
    __init__ : function(target, options)
    {
        App.Editor.supertype.__init__.call(this, options);
        
        this.buttons = {}
        this.buttons.save = new App.Button({
            text: 'Save', 
            icon: 'SaveIcon',
            cls:  't-float-right',
            click: function()
            {
                this.save();
            },
            context: this
        })
        
        this.buttons.del = new App.Button({
            text: 'Delete', 
            icon: 'DeleteIcon',
            cls:  't-float-right',
            click: function()
            {
                this.del();
            },
            context: this
        })
        
        this.buttons.cancel = new App.Button({
            text: 'Cancel', 
            icon: 'CancelIcon',
            click: function() { this.close() },
            context: this
        })
        this.options.bottom = [this.buttons.cancel, this.buttons.save, this.buttons.del];
        
        if (target)
            this.setTarget(target);
    },
    setTarget : function(target)
    {
        this.target = target;
        var self = this;
        this.target.bind('set', function() { self.refresh() });
        
        this.clear();
        
        var value = target.getValue();
        fields_list = this.target.getFields(target);
        this.fields = {};
        for(var i=0; i<fields_list.length; i++)
        {
            fields_list[i].value = value[fields_list[i].name];
            this.fields[fields_list[i].name] = fields_list[i];
            this.append( fields_list[i] );
        }
    },
    setValue : function(data)
    {
        this.each(function()
        {
            var value = data[this.name];
            if (value != undefined)
                this.setValue(value);
        })
    },
    getValue : function(data)
    {
        var value = {};
        this.each(function() {  value[this.name] = this.getValue(); });
        console
        return value;
    },
    save : function()
    {
        var self = this;
        var v = this.getValue()
        this.target.setValue(v);
        this.clearErrors();
        this.target.save({
            invalid : function(response) {
                self.setErrors(response.__errors__);
            },
            success : function() {
                self.trigger('save');
                self.close();
            }
        });
    },
    del : function()
    {
        if (confirm("Are you sure you want to delete this item?"))
            this.target.del();
        this.close();
    },
    refresh : function()
    {
        this.setValue(this.target.getValue());
    },
    setErrors : function(errors)
    {
        for( name in errors )
        {
            var field = this.fields[name];
            if (field)
                field.setErrors(errors[name]);
        }
        App.msg.alert("There were errors submitting the form.");
    },
    clearErrors : function()
    {
        for( name in this.fields )
            this.fields[name].clearErrors();
    }
})