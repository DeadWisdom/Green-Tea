/** Tea.Route

    @requires Tea
 **/

Tea.Route = Tea.Object.subclass({
    options : {
        url: null,
        method: 'get',
        data: {},
        dataType: 'json',
        success: null,
        failure: null,
        context: null,
        
        async: true,
        beforeSend: null,
        cache: false,
        complete: null,
        dataFilter: null,
        contentType: "application/x-www-form-urlencoded",
        global: true,
        ifModified: false,
        jsonp: null,
        password: null,
        processData: true,
        scriptCharset: null,
        timeout: null,
        username: null,
        xhr: null
    },
    clone : function(options)
    {
        if (!options) options = {};
        if (options.constructor === Tea.Route)
            options = options.options;
        return new this.constructor(jQuery.extend({}, this.options, options));
    },
    
    as_json :   function() {  return this.clone({dataType: 'json'})     },
    as_xml :    function() {  return this.clone({dataType: 'xml'})      },
    as_text :   function() {  return this.clone({dataType: 'text'})     },
    as_script : function() {  return this.clone({dataType: 'script'})   },
    as_html :   function() {  return this.clone({dataType: 'html'})     },
    as_jsonp :  function() {  return this.clone({dataType: 'jsonp'})    },
    
    apply : function(context)
    {
        if (!this.template)
            this.template = new Tea.Template(url);
        
        return this.clone({url: this.template.apply(context)});
    },
    get : function(data)
    {
        if (data)
            return this.clone({method: 'get', data: data});
        else
            return this.clone({method: 'get'});
    },
    post : function(data)
    {
        if (data)
            return this.clone({method: 'post', data: data});
        else
            return this.clone({method: 'post'});
    },
    del : function(data)
    {
        if (data)
            return this.clone({method: 'delete', data: data});
        else
            return this.clone({method: 'delete'});
    },
    more_data : function(data)
    {
        return this.clone({data: jQuery.extend({}, this.options.data, data)});
    },
    with_data : function(data)
    {
        return this.clone({data: data});
    },
    and : function(url)
    {
        if (url[url.length-1] != '/') url = url + '/';
        return this.clone({url : this.options.url + url});
    },
    success : function(func)
    {
        return this.clone({success: func});
    },
    failure : function(func)
    {
        return this.clone({failure: func});
    },
    context : function(obj)
    {
        return this.clone({context: obj})
    },
    call : function()
    {
        
    }
})