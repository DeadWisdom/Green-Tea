Tea.require( '../src/input.js' );
Tea.require( '../src/form.js' );

Tea.Testing.Suite({
    name: 'Tea.Form',
    
    _test_simple : function(input)
    {
        input.setValue('bar');
        assertEqual(input.getValue(), 'bar');
        
        input.render();
        assertEqual(input.getValue(), 'bar');
        
        input.setValue('foo');
        assertEqual(input.getValue(), 'foo');
    },
    
    test_simple : function()
    {
        var one = Tea.TextInput();
        var two = Tea.TextInput({password: true});
        
        this._test_simple( one );
        this._test_simple( two );
        
        assertEqual(two.source.attr('type'), 'password');
    },
    
    test_empty : function()
    {
        var input = Tea.TextInput({
            emptyText: 'Name',
            appendTo: '#content'
        });
        
        assertEqual(input.source[0].className, 't-empty');
        assertEqual(input.source.val(), 'Name');
        input.focus();
        assertEqual(input.source[0].className, '');
        assertEqual(input.source.val(), '');
        input.blur();
        assertEqual(input.source[0].className, 't-empty');
        assertEqual(input.source.val(), 'Name');
        
        input.setValue('bar');
        assertEqual(input.getValue(), 'bar');
        assertEqual(input.source.val(), 'bar');
        assertEqual(input.source[0].className, '');
        
        input.focus();
        assertEqual(input.getValue(), 'bar');
        assertEqual(input.source.val(), 'bar');
        assertEqual(input.source[0].className, '');
        
        input.blur();
        assertEqual(input.getValue(), 'bar');
        assertEqual(input.source.val(), 'bar');
        assertEqual(input.source[0].className, '');
        
        input.focus();
        input.source.val('');
        input.blur();
        assertEqual(input.source[0].className, 't-empty');
        assertEqual(input.source.val(), 'Name');
    },
    
    test_field : function()
    {
        var field = Tea.TextField({
            emptyText: 'Name',
            appendTo: '#content',
            style: {
                margin: '10px 0px'
            }
        });
        
        field.setValue('foo');
        assertEqual(field.getValue(), field.input.getValue());
        assertEqual(field.getValue(), 'foo');
        
        field.setLabel("Name: ");
        assertEqual(field.source[0].childNodes[0].tagName, "LABEL");
        assertEqual(field.source.find('label').html(), "Name: ");
        
        field.setError("This is an error.");
        assertEqual(field.source[0].childNodes[2].className, "t-error");
        field.setError(null);
        assertEqual(field.source[0].childNodes.length, 2);
        field.setError("This is an error.");
        assertEqual(field.source[0].childNodes.length, 3);
    },
    
    test_select : function()
    {
        var field = Tea.SelectField({
            label: 'Select:',
            choices: [
                'one',
                'two',
                ['three', 'Three']
            ],
            appendTo: '#content',
            style: {
                margin: '10px 0px'
            }
        });
        
        field.setValue('two');
        assertEqual(field.getValue(), 'two');
        
        field.setValue('asdfasdf');
        assertEqual(field.getValue(), 'two');
        
        field.setValue('one');
        assertEqual(field.getValue(), 'one');
    },
    
    test_checkbox : function()
    {
        var field = Tea.CheckBoxField({
            value: true,
            label: 'Check:',
            appendTo: '#content',
            style: {
                margin: '10px 0px'
            }
        });
        
        assertEqual(field.getValue(), true);
        
        field.setValue(false);
        
        assertEqual(field.getValue(), false);
    }
});