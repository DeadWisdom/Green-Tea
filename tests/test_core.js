Tea.Testing.Suite({
    name: 'Tea',
    
    test_class_example : function()
    {
        var Greeter = Tea.Class('Greeter', {
            options: {
               recipient : "world"
            },
            greet : function()
            {
                return "Hello " + this.recipient + "!";
            }
        });
        
        var greeter = Greeter();
        assertEqual(greeter.greet(), 'Hello world!');
        
        var greeter2 = new Greeter();   // "new" is optional (damn straight)
        assertEqual(greeter.greet(), greeter2.greet());

        var greeter = Greeter({recipient: 'javascripter'});
        assertEqual(greeter.greet(), "Hello javascripter!");
    },
    
    test_instanceof : function()
    {
        var A = Tea.Class('A', {});
        var B = Tea.Class('B', {});
        var C = B.extend('C', {});
        
        var a = new A();
        var b = new B();
        var c = new C();
        var d = new Object();
        
        // Basics
        assert(a instanceof A);
        assert(b instanceof B);
        assert(c instanceof C);
        assert(d instanceof Object);
        
        // Inheritance
        assert(c instanceof B);
        assert(c instanceof Object);
        assert(c instanceof Tea.Object);
        assert(a instanceof Object);
        assert(a instanceof Tea.Object);
        
        // Anti
        assert(! (c instanceof A));
        assert(! (d instanceof A));
        assert(! (b instanceof C));
    },
    
    test_subclassing : function()
    {
        var One = Tea.Class({});
        var Two = One.extend({});
        
        assertEqual(Two.__super__, One);
        assertEqual(Two.prototype.constructor, One);
    },
    
    test_registration : function()
    {
        var Class = Tea.Class('Class', {});
        assertEqual(Class, Tea.getClass('Class'));
    },
    
    test_options : function()
    {
        One = Tea.Class('One', {
            options: {a: 1, b: 2}
        });
        Two = One.extend('Two', {
            options: {b: 'b'}
        });
        
        var uber = One();
        var sub = Two();
        
        assertEqual(uber.a, 1);
        assertEqual(uber.b, 2);
        
        assertEqual(sub.a, 1);
        assertEqual(sub.b, 'b');
        
        sub.a = 2;
        assertEqual(sub.a, 2);
        assertEqual(sub.options.a, 1);
        
        var nother = One({a: 'a'});
        assertEqual(nother.a, 'a');
        assertEqual(nother.b, 2);
    },
    
    test_events : function()
    {
        var object = Tea.Object();
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

        testJSON(null, "null");
    },
    
    test_app : function()
    {
        App = Tea.Application.extend('App', {});
    },
    
    test_hook : function() {
        var counter = 0;
        
        a = Tea.Object();
        b = Tea.Object();
        
        a.hook(b, 'incr', function() { counter += 1; });
        
        assertEqual(counter, 0);
        b.trigger('incr');
        assertEqual(counter, 1);
        b.trigger('incr');
        assertEqual(counter, 2);
        
        a.unhookAll();
        b.trigger('incr');
        assertEqual(counter, 2);
        
        a.hook(b, 'incr', function() { counter += 1; });
        b.trigger('incr');
        assertEqual(counter, 3);
        
        a.unhook(b);
        b.trigger('incr');
        assertEqual(counter, 3);
    }
})