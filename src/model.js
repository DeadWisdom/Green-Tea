/** Tea.Model
    
    @requires Tea
    
    ORM-like interaction with the server, idealy through a REST interface,
    but it's flexible enough for many different interfaces.
 **/
Tea.Model = function(name, properties)
{
    if (!properties) properties = {};
    if (typeof name != 'string') throw new Error("Must provide a string <name> to Tea.Model(name, properties).");
    
    return Tea.Model.subclass(Tea.Model.Base, name, properties);
}

Tea.Model.subclass = function(Base, name, properties)
{
    if (!properties) properties = {};
    if (typeof name != 'string') throw new Error("Must provide a string <name> to Tea.Model.subclass(name, properties).");
    
    properties.__class__ = jQuery.extend({}, Base.prototype.__class__, properties.__class__ || {});
    
    var Model = Tea.Model.Base.subclass(name, properties);
    
    jQuery.extend(Model, properties.__class__);
    Model.subclass = function(name, properties) { return Tea.Model.subclass(Model, name, properties) }
    Model.cache = {};
    
    return Model;
}

Tea.Model.Base = Tea.Class('Tea.Model', {
    // These properties and methods are on the Model class itself.
    __class__: {
        /** Tea.Model.get(pk, value) [class method] !important
            Returns an instance, either existing, or new.

            pk [optional]:
                Private key value for the instance to return.

            value [optional]:
                Value dictionary to be merged onto the instance.
         **/
        get : function(pk, value)
        {
            if (value)
                value._pk = pk;
            else if (typeof pk == 'object')
                value = pk;
            else
                value = {_pk: pk};
            
            var existing = this.cache[value._pk];
            if (existing)
                return existing.setValue(value);
            
            return new this(value);
        },
        
        query : function(override)
        {
            var options = {
                url: this.prototype.options.url + 'search/'
            }
            
            return Tea.ajax(options, override);
        },
        
        getSearchResource : function(options)
        {
            var name = this.id + ".SearchResource"
            var Model = this;
            
            if (!Tea.classes[name])
            {
                Tea.classes[name] = Tea.Resource.subclass(name, {
                    options: {
                        url: Model.prototype.options.url + 'search/'
                    },
                    setValue : function(data)
                    {
                        this.value = [];
                        for(var i=0;i<data.length; i++)
                        {
                            var o = Model.get(data[i]);
                            this.value.push(o);
                        }
                    }
                });
            }
            
            return new Tea.classes[name](options);
        }
    },
   
    /** Tea.Model.__init__(value)
        Constructor for model instances, takes a value to be merged onto the instance.
        Note: one should normally use .get() instead of new Model(), as .get makes sure that
        if an instance with the same pk already exists, that will be returned, but when a new
        instance is created, __init__ is called on it.

        value:
            Value dictionary to be merged onto the new instance.
     **/
    __init__ : function(value)
    {
        value = value || {};
        
        value._pk = value._pk || null;
        this.setValue(value);
        this._model = this.constructor.id;
    },
    
    /** Tea.Model.options
        url:
            The default url/route that will be connected to for ajax calls.
        save:
            The url/route to connect to for save() ajax calls.
        update:
            The url/route to connect to for update() ajax calls.
        del:
            The url/route to connect to for del() ajax calls.
        
     **/
    options: {
        url: null,
        item: {type: "Tea.ListItem"}
    },
   
    /** Tea.Model.update(options)
        Ajax call to update this instance.
        
        options:
            Over-riding options to pass into Tea.ajax.

        Events:
            - updated
     **/
    update : function(options)
    {
        var standard = {
            url: this.options.url,
            get: this.getRef(),
            scope: this,
            success: function(data)
            {
                this._pk = data.pk;
                this._model = data.model;
                this.setValue(data.value);
                this.trigger('updated', data.value);
            },
            invalid : function(errors)
            {
                this.trigger('invalid', errors);
            }
        };
        
        Tea.ajax(jQuery.extend(standard, options));
    },
   
    /** Tea.Model.save(options)
        Ajax call to save this instance.
        
        options:
            Over-riding options to pass into Tea.ajax.
        
        Events:
            - saved
            - updated
     **/
    save : function(options)
    {
        var data = { value: Tea.toJSON(this.getValue()) };
        
        if (this.__errors__ != undefined)
            delete this.__errors__;
        
        var standard = {
            url: this.options.url,
            post: this.getRef(data),
            scope: this,
            success: function(data)
            {
                this._pk = data.pk;
                this._model = data.model;
                this.setValue(data.value);
                
                this.trigger('updated', data.value);
                this.trigger('saved', data.value);
            },
            invalid : function(errors)
            {
                this.__errors__ = errors;
                this.trigger('invalid', errors);
            }
        };

        Tea.ajax(jQuery.extend(standard, options))
    },
   
    /** Tea.Model.del(options)
         Ajax call to delete this instance.  
         Note: It doesn't actually do anything to this model instance on the javascript side.

         options:
             Over-riding options to pass into Tea.ajax.

         Events:
             - deleted
      **/
    del : function(options)
    {
        var standard = {
            url: this.options.url,
            method: 'get',
            scope: this,
            get: this.getRef({action: 'delete'}),
            success: function(deleted)
            {
                this._pk = null;
                
                if (deleted)
                    this.trigger('deleted');
            },
            invalid : function(errors)
            {
                this.trigger('invalid', errors);
            }
        };

        Tea.ajax(jQuery.extend(standard, options))
    },
    
    /** Tea.Model.getRef()
        Gets a dictionary to use as a reference for this instance.  It contains the model and pk
        of this instance.
     **/
    getRef : function(extend)
    {
        var ref = {model: this._model};
        if (this._pk != null) ref.pk = this._pk
        return $.extend(ref, extend);
    },
   
    /** Tea.Model.getValue()
        Get the value of this instance without functions and without any properties that start with
        an underscore except for _model and _pk.
     **/
    getValue : function()
    {
        var value = {};
        for (var i in this)
        {
            if (i == 'options' || i[0] == '_') continue;
            var v = this[i];
            if (typeof v == 'function') continue;
            if (v && typeof v == 'object' && v.__class__ != null) v = v.getRef();
            value[i] = v;
        }
        return value;
    },
    
    /** Tea.Model.setValue(value)
        Merges the given value dictionary onto this instance.

        value:
            Value dictionary to be merged onto this instance.
     **/
    setValue : function(value)
    {
        for(var k in value)
        {
            var v = value[k];
            if (typeof v == 'object' && v != null && v._model != null && v._pk != null)
                this[k] = Tea.Model.get(v);
            else
                this[k] = v;
        }
        
        if (this._pk)
            this.constructor.cache[this._pk] = this;
        
        this.trigger('changed');
        
        return this;
    },
    
    /** Tea.Model.getFields()
        Return the fields for this instance appropriate for a form.
     **/
    getFields : function()
    {
        return [];
    },
    
    /** Tea.Model.toString()
        Returns a string representation of the model.
     **/
    toString : function()
    {
        return "<" + this._model + " " + this._pk + ">";
    },
    
    /** Tea.Model.getListItem(options)
         Returns a default list item object.
      **/
    getListItem : function(options)
    {
        options = $.extend({}, {
            value: this,
            template: this.options.template,
            type: 'Tea.ListItem'
        }, this.options.item, options);
        
        var item = Tea.manifest(options);
        var self = this;
        var update = function()
        {
            item.refresh();
        }
        this.bind('update', update);
        
        item.bind('drop', function() { 
            if (self.onDrop)
                self.onDrop.apply(self, arguments)
        });
        
        return item;
    }
});

Tea.Model.get = function(value)
{
    var model = Tea.getClass(value._model);
    if (!model)
        throw new Error("Cannot find model: " + value._model);
        
    return model.get(value);
}