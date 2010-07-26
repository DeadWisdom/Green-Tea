Tea.require( '../src/container.js' )

Tea.Testing.Suite({
    name: 'Tea.Container',
    
    test_basics : function()
    {
        var a = Tea.Element({html: 'Item 0'});
        var b = Tea.Element({html: 'Item 1'});
        var c = Tea.Element({html: 'Item 2'});
        
        var container = Tea.Container({
            items : [a, b, c]
        });
        
        assertEqual(container.items[0], a);
        assertEqual(container.items[1], b);
        assertEqual(container.items[2], c);
        
        var source = container.render();
        
        assertEqual(source[0].childNodes[0].innerHTML, 'Item 0');
        assertEqual(source[0].childNodes[1].innerHTML, 'Item 1');
        assertEqual(source[0].childNodes[2].innerHTML, 'Item 2');
        
        container.items[container.items.length-1].remove();
        
        assertEqual(source[0].childNodes[2], undefined);
    },
    
    test_append : function()
    {
        var a = Tea.Element({html: 'Item 0'});
        var b = Tea.Element({html: 'Item 1'});
        var container = Tea.Container({
            items : a
        });
        
        container.append(b);
        
        var source = container.render();
        
        assertEqual(source[0].childNodes[0].innerHTML, 'Item 0');
        assertEqual(source[0].childNodes[1].innerHTML, 'Item 1');
    },
    
    test_insert : function()
    {
        var a = Tea.Element({html: 'Item 0'});
        var b = Tea.Element({html: 'Item 1'});
        var c = Tea.Element({html: 'Item 2'});
        var container = Tea.Container({});
        
        container.append(c);
        container.insert(0, a);
        container.insert(1, b);
        
        var source = container.render();
        
        assertEqual(source[0].childNodes[0].innerHTML, 'Item 0');
        assertEqual(source[0].childNodes[1].innerHTML, 'Item 1');
        assertEqual(source[0].childNodes[2].innerHTML, 'Item 2');
    }
})