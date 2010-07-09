/** Tea.orm
    
    @requires Tea
    
    ORM-like interaction with the server, idealy through a REST interface,
    but it's flexible enough for many different interfaces.  API Inspired 
    by sqlalchemy.
 **/

/** Tea.orm.Resource 
    
    A Tea resource is nothing but a mapping of names of "actions" to
    functions that return objects suitable for Tea.ajax.  These actions
    like "query", and "load" can then be used more uniformly.
 **/
Tea.orm.Resource = Tea.Class('Tea.orm.Resource', {
    options: {
        url: null,
        actions: ['query', 'load', 'save', 'del'],
        query: function() {
            return {
                url: this.url + '/*.json',
                dataType: 'json'
            }
        },
        load: function(object) {
            return { 
                url: this.url + '/' + object._pk + '.json',
                dataType: 'json'
            } 
        },
        save: function(object) {
            var pk = '*';
            if (object._pk)
                pk = object._pk;
            return {
                url: this.url + '/' + pk + '.json',
                method: 'post', 
                data: {value: this.toJSON(object)},
                dataType: 'json'
            }
        },
        del: function(object)
        {
            return { 
                url: this.url + '/' + object._pk + '.json'
                data: { delete: "delete" },
                method: 'delete',
                dataType: 'json'
            }
        }
    },
});


/** Tea.orm.Session
    
    session.save(thing);
    session.load(thing);
    
 **/
Tea.orm.Session = Tea.Class('Tea.orm.Session',
{
    options: {
        lazy: false,
        resources: [],
    },
    __init__ : function(options)
    {
        this.__super__(options);
        this._cache = {};
        this._resources = {};
        this._actions = [];
        
        for(k in this.resources)
            this.add_resource(k, this.resources[k]);
    }
    add_resource : function(name, options)
    {
        this._resources[name] = new Tea.orm.Resource(options);
    },
    merge : function(obj)
    {
        var model = obj._model;
        var pk = obj._pk;
        
        if (pk == undefined || pk == null)
        {
            return obj;
        }
        else
        {
            var table = this._cache[model];
            if (typeof table != 'object')
                this._cache[model] = {};
            
            if (typeof table[pk] != 'object')
                table[pk] = obj;
            else
                $.extend(table[pk], obj);
        }
        
        return obj
    },
    get : function(_model, _pk)
    {
        var table = this._cache[_model];
        if (typeof table != 'object')
            return null;
        return table[_pk] || null;
    },
    save : function(obj)
    {
        obj = this.merge(obj);
        
        this.trigger('beforeSave', obj._model, obj);
        this.queue('save', obj._model, obj);
        
        return obj
    },
    saveSuccess : function(data, obj)
    {
        this.trigger('save', obj._model, obj, data);
        jQuery.extend(obj, data);
        obj.trigger('update', data);
        obj.trigger('save');
    },
    load : function(obj)
    {
        obj = this.merge(obj);
        this.queue('load', obj._model, obj);
        this.flush();
    },
    loadSuccess : function(data, obj)
    {
        this.trigger('load', obj._model, obj, data);
        jQuery.extend(obj, data);
        obj.trigger('update', data);
        obj.trigger('load');
    },
    del : function(obj)
    {
        if (obj._pk == undefined || obj._pk == null)
            return;
        
        this.queue('del', obj._model, obj);
        obj._pk = null;
    },
    delSuccess : function(data, obj)
    {
        this.trigger('delete', obj, data);
        jQuery.extend(obj, data);
        obj.trigger('update', data);
        obj.trigger('delete');
    },
    query : function(model, data, callback)
    {
        this.flush();
        
        var resource = this._resources[model];
        options = resource['query']();
        options.data = data;
        
        var self = this;
        options.success = function(data)
        {
            var objects = [];
            for(var i=0; i < data.length; i++)
            {
                var obj = self.merge(data[i]);
                jQuery.extend(obj, data[i]);
                obj.trigger('update', data[i]);
                objects.push(obj)
            }
            callback.call(this, objects);
            this.trigger('query', objects);
        };
        
        return Tea.ajax(options);
    },
    flush : function()
    {
        for(var i = 0; i < this._actions.length; i++)
        {
            var options = jQuery.extend({}, this._actions[i]);
            options.success = function(data, status, request)
            {
                this[options._action + "Success"](data, options._object);
            }
            Tea.ajax(options);
        }
    },
    /** Tea.orm.Session.queue(name, model, [obj])
        
        Adds an action to be performed.  If we are not lazy, 
        we then flush().
        
        Note: This is an internal function, and will not effect 
              any objects on the client, but can on the server!
     **/
    queue : function(name, model, obj)
    {
        var resource = this._resources[model];
        if (typeof obj == 'object')
            var action = resource[name](obj);
        else
            var action = resource[name]();
        action._action = name;
        action._resource = resource;
        action._object = obj;
        this._actions.push(action);
        if (!this.lazy)
            this.flush();
        return action;
    }
})