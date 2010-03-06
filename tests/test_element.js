Tea.require( '../src/element.js' )

new Tea.Testing.Suite({
    name: 'Tea.Element',
    
    test_element_render : function()
    {
        var e = new Tea.Element({});
        var source = e.render();
        assertEqual(source[0].tagName, 'DIV');
        
        var e = new Tea.Element({source: '<p>'});
        var source = e.render();
        assertEqual(source[0].tagName, 'P');
        
        var e = new Tea.Element({source: '<p>', cls: 'a', id: 'b', html: "<br/>"});
        var source = e.render();
        assertEqual(source[0].tagName, 'P');
        assertEqual(source[0].className, 'a');
        assertEqual(source[0].id, 'b');
        assertEqual(source[0].childNodes[0].tagName, 'BR');
    },
    
    test_diff_skin : function()
    {
        var skin = Tea.Element.Skin.subclass({
            render : function()
            {
                return $("<input/>")
            }
        })
        
        e = new Tea.Element({skin: skin});
        var source = e.render();
        assertEqual(source[0].tagName, 'INPUT');
    }
})