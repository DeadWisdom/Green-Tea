Tea.require('../src/resource.js')

new Tea.Testing.Suite({
    name: 'Tea.Resource',
    
    test_basic : function()
    {
        var a = Tea.Resource({
            _uri: 1,
            name: 'One'
        });
        
        var b = Tea.Resource({
            _uri: 1,
        });
        
        assert(a === a);
        assert(a === b);
        
        assertEqual(a.name, 'One');
        assertEqual(b.name, 'One');

        a.name = 'The One';
        assertEqual(a.name, 'The One');
        assertEqual(b.name, 'The One');
        
        var c = Tea.Resource({
            _uri: 1,
            name: 'Neo'
        });
        
        assert(a === c);
        assert(b === c);
        
        assertEqual(a.name, 'Neo');
        assertEqual(b.name, 'Neo');
        assertEqual(c.name, 'Neo');
        
        assert(a instanceof Tea.Object);
    },
    test_advanced : function()
    {
        One = Tea.Class('One', {
            name: 'One'
        });
        
        var a = Tea.Resource({
            _uri: 2
        });
        
        assertEqual(a.name, undefined);
        
        var b = Tea.Resource({
            _uri: 3,
            _type: 'One'
        });
        
        assertEqual(b.name, 'One');
    }
})