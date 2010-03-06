Tea.require( '../src/stack.js' )

new Tea.Testing.Suite({
    name: 'Tea.StackContainer',
    
    test_basic : function()
    {
        var panel1 = new Tea.Panel({html: 'Panel 1'});
        var panel2 = new Tea.Panel({html: 'Panel 2'});
        var panel3 = new Tea.Panel({html: 'Panel 3'});
        var panel4 = new Tea.Panel({html: 'Panel 4'});
        var panel5 = new Tea.Panel({html: 'Panel 5'});
        
        var stack = new Tea.StackContainer({
            items: [
                panel1,
                panel2
            ]
        });
        
        stack.push( panel3 );
        
        var source = stack.render();
        assertEqual(source[0].childNodes[2].childNodes[2].innerHTML, 'Panel 3');
        
        stack.push( panel4 );
        assertEqual(source[0].childNodes[3].childNodes[2].innerHTML, 'Panel 4');
        
        stack.pop()
        assertEqual(source[0].childNodes[3], null);
        assertEqual(source[0].childNodes[2].childNodes[2].innerHTML, 'Panel 3');
        
        panel2.remove();
        assertEqual(source[0].childNodes[1], null);
        assertEqual(source[0].childNodes[0].childNodes[2].innerHTML, 'Panel 1');
    }
})