Tea.require( '../src/container.js' )

new Tea.Testing.Suite({
    name: 'Tea.Container',
    
    test_basics : function()
    {
        var a = new Tea.Element({html: 'Item 0'});
        var b = new Tea.Element({html: 'Item 1'});
        var c = new Tea.Element({html: 'Item 2'});
        
        var container = new Tea.Container({
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
        var a = new Tea.Element({html: 'Item 0'});
        var b = new Tea.Element({html: 'Item 1'});
        var container = new Tea.Container({
            items : a
        });
        
        container.append(b);
        
        var source = container.render();
        
        assertEqual(source[0].childNodes[0].innerHTML, 'Item 0');
        assertEqual(source[0].childNodes[1].innerHTML, 'Item 1');
    },
    
    test_insert : function()
    {
        var a = new Tea.Element({html: 'Item 0'});
        var b = new Tea.Element({html: 'Item 1'});
        var c = new Tea.Element({html: 'Item 2'});
        var container = new Tea.Container({});
        
        container.append(c);
        container.insert(0, a);
        container.insert(1, b);
        
        var source = container.render();
        
        assertEqual(source[0].childNodes[0].innerHTML, 'Item 0');
        assertEqual(source[0].childNodes[1].innerHTML, 'Item 1');
        assertEqual(source[0].childNodes[2].innerHTML, 'Item 2');
    }
})