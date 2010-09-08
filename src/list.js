/** Tea.List

    A container that lists content as Tea.ListItem elements.
    
    @requires Tea.Container
 **/
 
Tea.List = Tea.Container.extend('t-list', {
    options: {
        item: null,
        cls: 't-list'
    },
    createItem : function(value) {
        if (value instanceof Tea.Element)
            return value;
        return this.item({value: value});
    },
    setValue : function(value) {
        this.value = value;
        
        var self = this;
        this.empty();
        jQuery.each(value, function(index, value) {
            self.add(value);
        });
    },
    getValue : function() {
        var value = [];
        this.each(function(index, item){
            value.push( item.getValue() );
        })
        return value;
    },
    add : function(value)
    {
        this.append( this.createItem(value) );
    }
});