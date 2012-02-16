/** Tea.Resource
    
    @requires Tea
 **/

Tea.Session = Tea.Class('t-session', {
    options: {
        key: '_uri',
        type: '_type'
    },
    __init__ : function(opts) {
        this.cache = {};
        this.__super__(opts);
    },
    resource : function(obj)
    {
        if (obj instanceof Tea.Object)
            return obj;
        
        var key = obj[this.key];
            
        if (key == undefined || key == null) {
            return obj;
        } else {
            var existing = this.cache[key];
            if (typeof existing != 'object') {
                obj = this.cache[key] = this.build(obj);
            } else {
                $.extend(existing, obj);
                obj = existing;
                obj.trigger('change');
            }
        }
        
        return obj;
    },
    build : function(obj) {
        if (obj instanceof Tea.Object) return obj;
        
        var typeName = obj[this.type];
        
        if (typeof typeName != 'string')
            return Tea.Object(obj);
        
        return Tea.getClass(typeName)(obj);
    }
});

Tea._session = Tea.Session();
Tea.Resource = function() {
    return Tea._session.resource.apply(Tea._session, arguments);
};