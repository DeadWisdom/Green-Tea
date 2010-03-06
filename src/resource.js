/** Tea.Resource

    @requires Tea

    A remote resource.
 **/

Tea.Resource = Tea.Class('Tea.Resource', {
    options: {
        url: null,
        value: null,
        params: {},
        onLoad : null,
        scope: null
    },
    __init__ : function()
    {
        Tea.Resource.supertype.__init__.apply(this, arguments);
        this.value = this.options.value;
        this.params = this.options.params;
    },
    load : function(options)
    {
        var opts = {
            success : function(value)
            {
                this.setValue(value);
                if (opts.onLoad)
                    opts.onLoad.call(options.scope || this, this.value);
                this.trigger('load', this.value);
            },
            data: this.params,
            url: this.options.url
        }
        
        jQuery.extend(opts, options);
        opts.scope = this;
        
        Tea.ajax(opts);
    },
    updateParams : function(params)
    {
        this.params = jQuery.extend({}, this.options.params, params);
    },
    setParams : function(params)
    {
        this.params = params;
    },
    getParams : function()
    {
        return this.params;
    },
    setValue : function(value)
    {
        this.value = value;
    },
    getValue : function()
    {
        return this.value;
    }
});