new Tea.Testing.Suite({
    name: 'Example',
    
    setup : function()
    {
        // Setup here.
    },
    
    this_test_passes : function()
    {
        assert(1 == 1);
    },
    
    this_test_fails : function()
    {
        assert(1 == 2);
    },
    
    this_test_throws_an_error : function()
    {
        this.throws.an.error;
    },
    
    teardown : function()
    {
        // Teardown Here.
    }
})