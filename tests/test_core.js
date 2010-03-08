new Tea.Testing.Suite({
    name: 'Tea',
    
    test_class_example : function()
    {
        Greeter = Tea.Class('Greeter', {
            options: {
               recipient : "world"
            },
            greet : function()
            {
                return "Hello " + this.options.recipient + "!";
            }
        })
        
        var greeter = new Greeter();
        assertEqual(greeter.greet(), 'Hello world!');

        var greeter = new Greeter({recipient: 'javascripter'});
        assertEqual(greeter.greet(), "Hello javascripter!");
    },
    
    test_subclassing : function()
    {
        One = Tea.Class({});
        Two = One.subclass({});
        
        assertEqual(Two.supertype, One.prototype);
        assertEqual(Two.supertype.constructor, One);
    },
    
    test_registration : function()
    {
        Class = Tea.Class('Class', {});
        assertEqual(Class, Tea.getClass('Class'));
    },
    
    test_options : function()
    {
        One = Tea.Class({
            options: {a: 1, b: 2}
        });
        Two = One.subclass({
            options: {b: 'b'}
        });
        
        var uber = new One();
        var sub = new Two();
        
        assertEqual(uber.options.a, 1);
        assertEqual(uber.options.b, 2);
        assertEqual(sub.options.a, 1);
        assertEqual(sub.options.b, 'b');
        
        var nother = new One({a: 'a'});
        assertEqual(nother.options.a, 'a');
        assertEqual(nother.options.b, 2);
    },
    
    test_events : function()
    {
        var object = new Tea.Object();
        var state = 0;
        
        object.bind("signal", function(step) { state += step }, [1]);
        object.trigger('signal');
        assertEqual(state, 1);
        
        object.bind("signal", function(step) { state += step }, [2]);
        object.trigger('signal');
        assertEqual(state, 4)
        
        object.unbind('signal');
        object.trigger('signal');
        assertEqual(state, 4);
        
        var add_one = function() { state += 1 };
        object.bind('signal', add_one);
        object.trigger('signal');
        assertEqual(state, 5);
        
        var add_two = function() { state += 2 };
        object.bind('signal', add_two);
        object.trigger('signal');
        assertEqual(state, 8);
        
        object.unbind('signal', add_two);
        object.trigger('signal');
        assertEqual(state, 9);
    },
    
    test_extend : function()
    {
        One = Tea.Class({
            options: {one: 1},
            one: 1,
            two: 2
        });
        
        One.extend({
            options: {one: 'one'}
        });
        
        Two = Tea.Class({
            one: 'one'
        })
        
        One.extend(Two);
        
        var o = new One();
        assertEqual(o.options.one, 'one');
        assertEqual(o.one, 'one');
        assertEqual(o.two, 2);
    },
    
    test_routes : function()
    {
        Tea.route('document', '/document/');
        Tea.route('document.list', '/document/list/');
        
        assertEqual(Tea.getRoute('document'), '/document/');
        assertEqual(Tea.getRoute('document.list'), '/document/list/');
        
        Tea.route({
            'document' : '/ajax/document/',
            'document.all' : '/ajax/document/all/'
        });
        
        assertEqual(Tea.getRoute('document'), '/ajax/document/');
        assertEqual(Tea.getRoute('document.all'), '/ajax/document/all/');
        
    },
    
    test_json : function()
    {
        function testJSON(input, expected)
        {
            assertEqual(expected, Tea.toJSON(input));
            
            if (JSON && JSON.stringify)
            {
                JSON._stringify = JSON.stringify;
                JSON.stringify = null;
                try {
                    assertEqual(expected, Tea.toJSON(input));
                    JSON.stringify = JSON._stringify;
                } catch(e) {
                    JSON.stringify = JSON._stringify;
                    throw(e);
                }
            }
        }
        
        testJSON('hi', "\"hi\"");
        testJSON({apple: 2}, "{\"apple\":2}");
        testJSON({apple: {apple: 2}}, "{\"apple\":{\"apple\":2}}");
        testJSON(2.5, "2.5");
        testJSON(25, "25");
        testJSON([2, 5], "[2,5]");
        
        testJSON({apple: 2, banana: function() {}}, "{\"apple\":2}");
        
        testJSON(function() {}, undefined);
        testJSON(undefined, undefined);
    },
    
    test_app : function()
    {
        App = Tea.Application.subclass('App', {});
    }
})