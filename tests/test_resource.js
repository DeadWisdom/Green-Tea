Tea.require( '../src/resource.js' )

new Tea.Testing.Suite({
    name: 'Tea.Resource',
    
    responses: {
        "/*.json" : function(params, method)
        {
            return [
                {'name': 'hello'},
                {'name': 'apple'}
            ];
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
        var resource = new Tea.Resource({url: '', key: 'name'});
        
        resource.bind('update', function(objects) { data = objects[0] });
        resource.query();
        
        assertEqual(data.name, "hello");
        
        assertEqual(resource.getList('name')[0].name, 'apple');
        
        resource.query();
    }
})