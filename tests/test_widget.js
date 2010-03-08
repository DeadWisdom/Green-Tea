Tea.require( '../src/widget.js' )

new Tea.Testing.Suite({
    name: 'Tea.Widget',
    
    test_button : function()
    {
        var button = new Tea.Button({
            text: 'The Button!',
            icon: 'the-icon-class'
        });
        
        assertEqual(button.getText(), 'The Button!');
        assertEqual(button.getIcon(), 'the-icon-class');
        
        var source = button.render();
        
        assertEqual(source[0].childNodes[0].className, 't-icon the-icon-class icon-the-icon-class');
        assertEqual(source[0].childNodes[1].innerHTML, 'The Button!');
    }
})