Tea.require( '../src/resource.js' )

new Tea.Testing.Suite({
    name: 'Tea.Resource',
    
    responses: {
        load : function(params, method)
        {
            return 'hello';
        }
    },
    
    setup : function()
    {
        Tea.Testing.setupAjax(this.responses);
    },

    teardown : function()
    {
        Tea.Testing.teardownAjax();
    },
    
    test_load : function()
    {   
        var data = null;
        var resource = new Tea.Resource({url: 'load'});
        
        resource.bind('load', function(evt, value) { data = value });
        resource.load();
        
        assertEqual(data, "hello");
    }
})