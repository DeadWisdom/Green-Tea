/** Tea.Resource

    @requires Tea

    A resource to get records from.  Records have the property that they are unique
    and bindable.  So if two queries return the same record, the results will point
    to the same javascript Object.
 **/

Tea.Resource = Tea.Class('Tea.Resource', {
    options: {
        url: '',
        value: null,
        params: null,
        key: ['_pk'],
        table: null,
        model: Tea.Object
    },
    __init__ : function(options)
    {
        this.__super__(options);
        var value = this.value;
        this.value = [];
        this._new = [];
        if (this.table == null) this.table = {};
        this.key = jQuery.makeArray(this.key);
    },
    flushNew : function()
    {
        this._new = [];
    },
    getNew : function()
    {
        return this._new;
    },
    popNew : function()
    {
        var n = this.getNew();
        this.flushNew();
        return n;
    },
    getKey : function(obj)
    {
        keys = [];
        for(var i = 0; i < this.key.length; i++)
        {
            var k = this.key[i];
            var v = obj[k];
            if (v == undefined || v == null) return null;
            keys.push(v);
        }
        return keys.join("/")
    },
    merge : function(obj)
    {
        var key = this.getKey(obj);
        if (key != null)
        {
            if (typeof(this.table[key]) == 'object')
            {
                return $.extend(this.table[key], obj);
            }
            else
            {
                if (jQuery.isPlainObject(obj))
                    obj = new this.model(obj);
            
                this.table[key] = obj;
                this._new.push(obj);
                this.value.push(obj);
            }
        }
        else
        {
            if (jQuery.isPlainObject(obj))
                obj = new this.model(obj);
        }
        
        return obj;
    },
    simplify : function(obj)
    {
        if (jQuery.isFunction(obj.simplify))
            return obj.simnplify();
        
        var simple = {};
        for(var k in obj)
        {
            if (k.charAt(0) == '_') continue;
            if (jQuery.isFunction(obj[k])) continue;            
        }
    },
    query : function(params)
    {
        params = params || {};
        var success = params.success;
        var context = params.context || this;
        var options = $.extend({url: this.url + "/*.json"}, params);
            
        var self = this;
        options.success = function(data, status, request)
        {
            if (request.status != 200)
                return self.trigger('error');
            
            self.trigger('query', [data]);
            
            var objects = self.queryComplete(data);
            
            self.trigger('update', [objects]);
            
            if (jQuery.isFunction(success))
                return success.apply(context, context);
        }
        
        Tea.ajax(options);
    },
    queryComplete : function(data)
    {
        var objects = [];
        for(var i = 0; i < data.length; i++)
        {
            var obj = this.merge(data[i]);
            obj.trigger('update');
            objects.push(obj);
        }
        return objects;
    },
    save : function(obj, params)
    {
        params = params || {};
        var success = params.success;
        var context = params.context || this;
        var options = $.extend({method: 'POST', url: this.url + "/" + (this.getKey(obj) || '*') + ".json"}, params);
        
        options.data = {'value': Tea.toJSON( this.simplify(obj) )};
        options.context = this;
        options.success = function(data, textStatus, XMLHttpRequest)
        {
            if (request.status != 200)
                return self.trigger('error');
                
            var obj = this.saveComplete(data);
            
            this.trigger('save', obj);
            this.trigger('update', [[obj]]);
            
            if (jQuery.isFunction(success))
                return success.apply(context, context);
        }
        
        Tea.ajax(options);
    },
    saveComplete : function(data)
    {
        var obj = this.merge(data);
        obj.trigger('save');
        if (!jQuery.isEmptyObject(data))
            obj.trigger('update');
        return obj;
    },
    load : function(obj)
    {
        params = params || {};
        var success = params.success;
        var context = params.context || this;
        var options = $.extend({url: this.url + "/" + this.getKey(obj) + ".json"}, params);
        
        options.data = {};
        for(var i = 0; i < this.key.length; i++)
        {
            var k = this.key[i];
            options.data[k] = obj[k];
        }
        options.context = this;
        options.success = function(data, textStatus, XMLHttpRequest)
        {
            if (request.status != 200)
                return self.trigger('error');
            
            var obj = this.loadComplete(data);
            
            this.trigger('load', obj);
            this.trigger('update', [[obj]]);
            
            if (jQuery.isFunction(success))
                return success.apply(context, context);
        }
        
        Tea.ajax(options);
    },
    loadComplete : function(data)
    {
        var obj = this.merge(data);
        obj.trigger('load');
        if (!jQuery.isEmptyObject(data))
            obj.trigger('update');
        return obj;
    },
    del : function(obj)
    {
        params = params || {};
        var success = params.success;
        var context = params.context || this;
        var options = $.extend({url: this.url + "/" + this.getKey(obj) + ".json"}, params);
        
        options.data = {};
        for(var i = 0; i < this.key.length; i++)
        {
            var k = this.key[i];
            options.data[k] = obj[k];
        }
        options.context = this;
        options.success = function(data, textStatus, XMLHttpRequest)
        {
            if (request.status != 200)
                return self.trigger('error');
            
            var obj = this.delComplete(data);
            
            this.trigger('delete', obj);
            this.trigger('update', [[obj]]);
            
            if (jQuery.isFunction(success))
                return success.apply(context, context);
        }
        
        Tea.ajax(options);
    },
    delComplete : function(data)
    {
        var obj = this.merge(data);
        this.remove(obj);
        delete this.table[this.getKey(obj)];
        obj.trigger('delete');
        if (!jQuery.isEmptyObject(data))
            obj.trigger('update');
        return obj;
    },
    remove : function(obj)
    {
        for(var i = 0; i < this.value.length; i++)
        {
            if (obj == this.value[i])
            {
                this.value.splice(i, 1);
                return obj;
            }
        }
        return obj;
    },
    getList : function(sort)
    {
        var list = Array.concat(this.value);
        if (sort == undefined || sort == null)
            return list;
            
        list.sort(function(a, b) {
            if (a[sort] < b[sort]) return -1;
            if (a[sort] > b[sort]) return 1;
            return 0;
        });
        return list;
    },
    getValue : function()
    {
        return this.value;
    }
});