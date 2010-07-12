/** Tea.Testing !module

    @requires Tea

    A testing framework.
 **/

Tea.Testing = {};
Tea.Testing.suites = [];

try
{
    console.log.prototype;
} catch(e) {
    fn = function() {};
    console = {
        log : fn,
        group : fn,
        groupEnd : fn,
        error: fn,
        debug: fn
    }
}

Tea.Testing.run = function(suite, test)
{
    Tea._testing = true;
    
    jQuery.ajaxSetup({async: false});
    
    var suites = Tea.Testing.suites;
    var count = 0;
    var passed = 0;
    
    for(var i = 0; i < suites.length; i++) 
    {
        if (suite && suites[i].name != suite) continue;
        
        var results = suites[i].run(test);
        count += results[0];
        passed += results[1];
    }
    
    if (count == passed)
        console.log("Passed.");
    else
        console.log("Failed: %s of %s passed.", passed, count);
    
    jQuery.ajaxSetup({async: true});
    
    Tea._testing = false;
    
    return {count: count, passed: passed};
}

Tea.Testing.fail = function(msg)
{
    var e = new Error(msg);
    e.failure = true;
    throw e;
}

function assertEqual(a, b, msg)
{
    if (a == b) return;
    if (a == undefined) a = 'undefined';
    if (b == undefined) b = 'undefined';
    Tea.Testing.fail( msg || ("assertEqual failed: " + a.toString() + ' != ' + b.toString()) );
}

function assert(a, msg)
{
    if (a) return;
    Tea.Testing.fail(msg || 'assertion failed.');
}

Tea.Testing.Suite = Tea.Class('test-suite', {
    __init__ : function(attrs)
    {
        this._tests = [];
        for(var k in attrs)
        {
            this[k] = attrs[k];
            
            if (k == 'teardown') continue;
            if (k == 'setup') continue;
            if (k[0] == '_') continue;
            
            if (typeof attrs[k] == 'function')
                this._tests.push(new Tea.Testing.Test(k, attrs[k]));
        }
        
        if (!this.name)
            throw new Error("Unable to build test suite, it was not given a name attribute.");
        
        Tea.Testing.suites.push(this);
    },
    run : function(test)
    {
        this._passed = 0;
        
        console.group(this.name);
        
        if (this.setup)
        {
            try {
                this.setup.call(this);
            } 
            catch(e) {
                console.error('Error setting up suite.');
                console.error(e);
                console.groupEnd();
                return [1, 0];
            }
        }
        
        for(var i = 0; i < this._tests.length; i++)
        {
            if (test && this._tests[i].name != test) continue;
            
            this._tests[i].run(this, test == this._tests[i].name);
        }
        
        if (this.teardown)
        {
            try {
                this.teardown.call(this);
            } 
            catch(e) {
                console.error('Error tearing down suite.');
            }
        }
        
        if (this._passed == this._tests.length)
            console.log("All of %s passed.", this._tests.length);
        else
            console.log("%s of %s passed.", this._passed, this._tests.length);
        
        console.groupEnd();
        
        return [this._tests.length, this._passed];
    }
});

Tea.Testing.Test = Tea.Class('test', {
    __init__ : function(name, entry)
    {
        this.name = name;
        this.entry = entry;
        this.status = null;
        this.comment = null;
    },
    run : function(suite, let)
    {
        try
        {
            this.entry.call(suite);
            this.status = '.';
            suite._passed += 1;
        } 
        catch(e)
        {
            pass = false;
            
            if (let)
                throw e;
            
            if (e.failure)
            {
                this.status = 'F';
                this.comment = e.message;
                console.error("%s Failed - %s: %s\n", this.name, e.name, e.message, Tea.Testing.trace(e));
            }
            else
            {
                this.status = 'E';
                this.comment = e.message;
                console.error("%s Threw - %s: %s\n", this.name, e.name, e.message, Tea.Testing.trace(e));
            }    
        }
    }
});

Tea.Testing.trace = function(e)
{
    if (!e.stack)
        return e.sourceURL + ":" + e.line;
    
    var split = e.stack.split('\n');
    var frames = [];
        
    for(var i = 0; i < split.length; i++)
    {
        var frame = split[i];
        frames.push( frame.split('@').reverse().join(" - ") );
    }
    
    return frames.join("\n");
}

Tea.Testing.setupAjax = function(responses)
{
    Tea.Testing.ajaxCalls = [];
    Tea.Testing._ajax = jQuery.ajax;
    
    jQuery.ajax = function(options)
    {
        Tea.Testing.ajaxCalls.push(options);
        try {
            var response = responses[options.url](options);
        } catch (e) {
            console.error("Unable to find url in the responses: %s", options.url);
            throw e;
        }
        
        options.success.call(this, response);
    }
}

Tea.Testing.teardownAjax = function()
{
    jQuery.ajax = Tea.Testing._ajax
}