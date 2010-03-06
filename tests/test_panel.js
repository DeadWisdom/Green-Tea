Tea.require( '../src/panel.js' );

new Tea.Testing.Suite({
    name: 'Tea.Panel',
    
    test_basic : function()
    {
        var panel = new Tea.Panel({
            items: [new Tea.Element({html: '1'})],
            title: 'Panel 1'
        });
        
        panel.render();
        var el = panel.source[0];
        
        assertEqual(el.childNodes[2].childNodes[0].innerHTML, '1');
        assertEqual(el.childNodes[1].innerHTML, 'Panel 1');
    },
    
    test_html : function()
    {
        var panel = new Tea.Panel({
            html: '<b>Hello</b>',
            title: 'Test HTML'
        });
        
        panel.render();
        var el = panel.source[0];
        
        assertEqual(el.childNodes[2].childNodes[0].tagName, 'B');
        assertEqual(el.childNodes[2].childNodes[0].innerHTML, 'Hello');
    },
    
    test_window : function()
    {
        var panel = new Tea.Panel({
            skin: 'Tea.Panel.WindowSkin',
            html: 'Hello'
        })
        
        var source = panel.render();
        
        assertEqual(source[0].className, 't-window t-panel');
    }
})