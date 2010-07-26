Tea.require( '../src/panel.js' );

Tea.Testing.Suite({
    name: 'Tea.Panel',
    
    test_basic : function()
    {
        var panel = Tea.Panel({
            items: [Tea.Element({html: '1'})],
            title: 'Panel 1'
        });
        
        panel.render();
        var el = panel.source[0];
        
        assertEqual(el.childNodes[2].childNodes[0].innerHTML, '1');
        assertEqual(el.childNodes[1].innerHTML, 'Panel 1');
    },
    
    test_html : function()
    {
        var panel = Tea.Panel({
            html: '<b>Hello</b>',
            title: 'Test HTML'
        });
        
        panel.render();
        var el = panel.source[0];
        
        assertEqual(el.childNodes[2].childNodes[0].tagName, 'B');
        assertEqual(el.childNodes[2].childNodes[0].innerHTML, 'Hello');
    }
})