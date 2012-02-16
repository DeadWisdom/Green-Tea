Tea.require( '../src/template.js' )

new Tea.Testing.Suite({
    name: 'Tea.Template',
    
    test_basics : function()
    {
        var context = {must: 'will'};
        var t = Tea.Template('Bugs {{must}} go.  They {{ must }}.');
        assertEqual(t.apply(context), 'Bugs will go.  They will.');
        
        var context = {states: {finished: 'squashed'}};
        var t = Tea.Template('Bugs should all be {{ states.finished }}.');
        assertEqual(t.apply(context), 'Bugs should all be squashed.');
    },
    
    test_star : function()
    {
        var context = 'Squash';
        var t = Tea.Template('{{*}} bugs.');
        assertEqual(t.apply(context), 'Squash bugs.');
        
        var context = {name: 'Squash'};
        var t = Tea.Template('{{name.*}} bugs.');
        assertEqual(t.apply(context), 'Squash bugs.');
    },
    
    test_throwing : function()
    {
        var context = {};
        var t = Tea.Template('{{name}} bugs.');
        assertEqual(t.apply(context), ' bugs.');
        
        var context = {};
        var t = Tea.Template('{{name}} bugs.', {missing_throws: true});
        
        var error = null;
        try {
            t.apply(context);
        } catch(e) { error = e.message }
        
        assertEqual(error, "Unable to find variable in context: name");
    }
})