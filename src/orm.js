/** Tea.orm
    
    @requires Tea
    
    ORM-like interaction with the server, idealy through a REST interface,
    but it's flexible enough for many different interfaces.  API Inspired 
    by sqlalchemy.
 **/

Tea.orm.Resource = Tea.Class('Tea.orm.Resource', {
    actions: {},
    __init__ : function(options)
    {
        this.__super__(options);
        
        for( var k in this.actions ) {
            this[k] = this.actions[k];
        }
    },
    options: {
        model: null,
        root: null,
        query: function() {
            return {
                url: (this.options.root || Tea.root) + '/' + this._model + '/*.json'
            }
        },
        load: function(object) {
            return { 
                url: (this.options.root || Tea.root) + '/' + object._model + '/' + object._pk + '.json' 
            } 
        },
        save: function(object) {
            var pk = '*';
            if (object._pk)
                pk = object._pk;
            return {
                url: (this.options.root || Tea.root) + '/' + object._model + '/' + pk + '.json', 
                method: 'post', 
                params: {value: object} 
            }
        },
        del: function(object)
        {
            return { 
                url: (this.options.root || Tea.root) + '/' + object._model + '/' + object._pk + '.json'
                params: { delete: true },
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
        lazy: false
    },
    __init__ : function(options)
    {
        this.__super__(options);
        this._cache = {};
        this._resources = {};
        this._ops = [];
    },
    add_resource : function(name, options)
    {
        options.model = options.model || name;
        this._resources[name] = new Tea.orm.Model(options);
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
        var obj = this.merge(obj);
        
        this._obj.push(['save', obj._model, obj._pk]);
        
        if (!this.options.lazy)
            this.flush();
        
        return obj
    },
    load : function(obj)
    {
        this.merge
        this._ops.push(['load', obj._model, obj._pk]);
        this.flush();
    },
    del : function(obj)
    {
        if (obj._pk == undefined || obj._pk == null)
            return;
        
        this._ops.push(['del', obj._model, obj._pk]);
        obj._pk = null;
        
        if (!this.options.lazy)
            this.flush();
    },
    flush : function(options)
    {
        for(var i = 0; i < this._ops.length; i++)
        {
            var op = this._ops[i];
            if (op[0] == 'delete') { 
                this._resources[op[0]].del()
            }
        }
    }
})