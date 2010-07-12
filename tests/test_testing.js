/*new Tea.Testing.Suite({
    name: 'Tea.Testing',
    
    responses: {
        test_response: function(options) {
            return "response";
        },
        test_data : function(options) {
            return options.data.response;
        },
        test_method : function(options)
        {
            return options.method + "-bam!";
        },
    },
    
    setup : function()
    {
        Tea.Testing.setupAjax(this.responses);
    },
    
    test_framing_device : function()
    {
        var response = null;
        
        jQuery.ajax({url: 'test_response', success: function(r) { response = r }});
        assertEqual(response, "response");
        
        jQuery.ajax({url: 'test_data', success: function(r) { response = r }, data: {response: 'lovely'}});
        assertEqual(response, "lovely");
        
        jQuery.ajax({url: 'test_method', method: 'pizza', success: function(r) { response = r }});
        assertEqual(response, "pizza-bam!");
    },
    
    teardown : function()
    {
        Tea.Testing.teardownAjax();
    }
})*/