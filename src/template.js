/** Tea.Template

    Naive template implementation.
    NOTE: There is no escaping done here, only apply on trusted data.
    
    @requires Tea
    
    Example:
        var context = {must: 'will'};
        var t = new Tea.Template('Bugs {{must}} go.  They {{ must }}.');
        assertEqual(t.apply(context), 'Bugs will go.  They will.');
 **/
Tea.Template = Tea.Class({
    /** Tea.Template.options
    
        re:
            The regular expression used, defaults to: /{{\s*(.*?)\s*}}/g, which
            matches things like: something something {match} something.
        missing_throws:
            Throw an exception if a variable cannot be resolved, otherwise
            it merely replaces the variable with an empty string ''.
        html_encode:
            Converts "&", "<", and ">" to "&amp;", "&lt;", and "&gt;", respectively.
     **/
    options: {
        re: /{{\s*(.*?)\s*}}/g,
        html_encode: false,
        missing_throws: false
    },
    
    /** Tea.Template.__init__ (src, [options])
        
        Instantiate a template with the given source, and optionally options.
     **/
    __init__ : function(src, options)
    {
        this.src = src;
        this.__super__(options);
    },
    
    /** Tea.Template.apply (context)
    
        Applies the template with the given context.
     **/
    apply : function( context )
    {
        var self = this;
        
        return this.src.replace(this.re, 
            function(match, group, index, full)
            {
                return self.getVar(group, context);
            });
    },
    
    // Returns the variable value for the given context.
    getVar : function( variable, context )
    {
        if (!variable)
            throw new Error("Empty group in template.");
        
        var path = variable.split('.');
        var value = context;
        for( var i = 0; i < path.length; i++)
        {
            if (path[i] == '*') continue;
            value = value[path[i]];
            if (value == undefined)
                if (this.missing_throws)
                    throw new Error("Unable to find variable in context: " + path.join("."));
                else
                    value = '';
        }
        if (this.html_encode)
            value = value.replace(/&/g,'&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
        return value;
    }
})