Tea.require( '../src/dialog.js' );

Tea.Testing.Suite({
    name: 'Tea.Dialog',
    
    test_basic : function()
    {
        var dialog = Tea.Dialog({
            title: 'Dialog Test', 
            html: 'Succeeded!', 
            time: 2000,
            style: {
                background: 'white',
                border: '1px solid #AAA',
                padding: "0 10px 10px 10px"
            }});
        var source = dialog.show();
        
        dialog.skin.title.css('font-weight', 'bold');
    }
});