Tea.require( '../src/orm.js' )

new Tea.Testing.Suite({
    name: 'Tea.orm.Resource',
    
    responses: {
        "/test_model/" : function(options)
        {
            return options;
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
    
    test_basic : function()
    {

    },
})