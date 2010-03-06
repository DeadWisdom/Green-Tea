Tea.require( '../src/dialog.js' );

new Tea.Testing.Suite({
    name: 'Tea.Dialog',
    
    test_basic : function()
    {
        var dialog = new Tea.Dialog({title: 'Dialog Test', html: 'Succeeded!', time: 2000});
        var source = dialog.show();
        
        dialog.skin.title.css('font-weight', 'bold');
    }
});