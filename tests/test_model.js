Tea.require(    '../src/model.js', 
                '../src/ajax.js'     )

new Tea.Testing.Suite({
    name: 'Tea.Model',
    
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
        Tea.route('test_model', '/test_model/');
        
        var model = Tea.Model('tests.Model', {
            options: {
                url: 'test_model'
            }
        });
        
        var state = null;
        
        var m = model.get(1);
        
        m.del({ success: function(options) { state = 'delete' } });
        assertEqual(state, 'delete');
        
        m.bind('saved', function() { state = 'saved' });
        m.bind('updated', function() { state = 'updated' });
        m.bind('deleted', function() { state = 'deleted' });
        
        m.update();
        assertEqual(state, 'updated');
        
        m.save();
        assertEqual(state, 'saved');
        
        m.del();
        assertEqual(state, 'deleted');
        
        same = model.get(1);
        assertEqual(same._pk, 1);
        assert(same === m);
    },
})