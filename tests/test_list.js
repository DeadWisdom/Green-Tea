Tea.require( '../src/list.js', '../src/template.js' )

new Tea.Testing.Suite({
    name: 'Tea.List',
    
    test_basics : function()
    {
        var list = new Tea.List({value: [1, 2, 3]});
        var el = list.render()[0];
        
        assertEqual(el.childNodes[0].innerHTML, '1');
        assertEqual(el.childNodes[1].innerHTML, '2');
        assertEqual(el.childNodes[2].innerHTML, '3');
        
        assertEqual(list.value[0], 1);
        assertEqual(list.value[2], 3);
    },
    
    test_with_resource : function()
    {
        Tea.Testing.setupAjax({
            load : function(params, method)
            {
                return [1, 2, 3];
            }
        });
        
        var list = new Tea.List({
            value: new Tea.Resource({
                url: 'load'
            })
        })
        
        var el = list.render()[0];
        
        assertEqual(el.childNodes[0].innerHTML, '1');
        assertEqual(el.childNodes[1].innerHTML, '2');
        assertEqual(el.childNodes[2].innerHTML, '3');
        
        list.setValue([4, 5]);
        list.refresh();
        
        assertEqual(el.childNodes[0].innerHTML, '4');
        assertEqual(el.childNodes[1].innerHTML, '5');
        
        Tea.Testing.teardownAjax();
    },
    
    test_insert_and_prepend : function()
    {
        var list = new Tea.List({value: [1]});
        var el = list.render()[0];
        
        assertEqual(el.childNodes[0].innerHTML, '1');
        assert(!el.childNodes[1]);
        
        list.append(2)
        
        assertEqual(el.childNodes[1].innerHTML, '2');
        
        list.insert(1, 3);
        
        assertEqual(el.childNodes[1].innerHTML, '3');
        
        list.setValue([1]);
        
        assertEqual(el.childNodes[0].innerHTML, '1');
        assert(!el.childNodes[1]);
        
        list.prepend('foo');
        
        assertEqual(el.childNodes[0].innerHTML, 'foo');
        assertEqual(el.childNodes[1].innerHTML, '1');
    }
})