Tea.require( '../src/form.js' );

new Tea.Testing.Suite({
    name: 'Tea.Form',
    
    test_basic : function()
    {
        var form = new Tea.Form({
            items: [
                {type: 'text', value: 'value', name: 'name'}
            ]
        });
        
        var source = form.render();
        
        assertEqual(source[0].tagName, 'FORM');
        assertEqual(source[0].childNodes[0].childNodes[0].tagName, 'LABEL');
        assertEqual(source[0].childNodes[0].childNodes[0].innerHTML, 'name');
        assertEqual(source[0].childNodes[0].childNodes[1].tagName, 'INPUT');
        assertEqual(source[0].childNodes[0].childNodes[1].type, 'text');
        
        assertEqual(source[0].childNodes[0].childNodes[1].value, 'value');
        
        form.setValue({name: 2});
        
        assertEqual(source[0].childNodes[0].childNodes[1].value, '2');
        assertEqual(Tea.toJSON(form.getValue()), '{"name":"2"}');
    },
    
    _test_type : function(type, tagName, index)
    {
        var form = new Tea.Form({
            items: {type: type, name: 'name'}
        });
        
        var source = form.render();
        assertEqual(source[0].childNodes[0].childNodes[index || 1].tagName, tagName);
        
        assertEqual(form.fields.name.getValue(), '');
        form.setValue({name: 'bob'});
        assertEqual(Tea.toJSON(form.getValue()), '{"name":"bob"}');
    },
    
    test_text : function()
    {   this._test_type('text', 'INPUT');  },
    
    test_password : function()
    {   this._test_type('password', 'INPUT');  },
    
    test_textarea : function()
    {   this._test_type('textarea', 'TEXTAREA');  },
    
    test_static : function()
    {   this._test_type('static', 'DIV');  },
    
    test_select : function()
    {   
        var form = new Tea.Form({
            items: {type: 'select', name: 'name', choices: [1, 2, 3], value: 1}
        });
        
        var source = form.render();
        assertEqual(source[0].childNodes[0].childNodes[1].tagName, 'SELECT');
        
        assertEqual(form.fields.name.getValue(), 1);
        form.setValue({name: 2});
        assertEqual(Tea.toJSON(form.getValue()), '{"name":2}');
        form.setValue({name: 'Not There'});
        assertEqual(Tea.toJSON(form.getValue()), '{"name":1}');
    },
});