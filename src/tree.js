/** Tea.Tree

    A Tree item, each tree has a head and tail, the tail is a container,
    the head is a button.
    
    @requires Tea.Widget
    @requires Tea.Container
    @extends Tea.Container
 **/

Tea.Tree = Tea.Container.extend('t-tree-item', {
    options: {
        expanded: false,
        icon: null,
        text: null,
        skin: 'Tea.Tree.Skin',
        click: null,
        context: null
    },
    expand : function() {
        this.expanded = true;
        if (this.isRendered())
            this.skin.setExpanded(true);
    },
    collapse : function() {
        this.expanded = false;
        if (this.isRendered())
            this.skin.setExpanded(false);
    },
    setExpanded : function(flag) {
        if (flag) return this.expand();
        return this.collapse();
    },
    setText : function(src) {
        this.text = src;
        if (this.isRendered())
            this.skin.setText(src);
    },
    setIcon : function(icon) {
        this.icon = icon;
        if (this.isRendered())
            this.skin.setIcon(icon);
    },
    remove : function(item)
    {   
        this.__super__(item);
        this.setExpanded(this.expanded);
    },
    empty : function()
    {
        this.__super__();
        this.setExpanded(this.expanded);
    },
    walk : function(func)
    {
        for(var i = 0; i < this.items.length; i++) {
            func(this.items[i]);
            var next = this.items[i].walk;
            if (next) next(func);
        }
    }
});

Tea.Tree.Skin = Tea.Container.Skin.extend('Tea.Tree.Skin', {
    options: {
        cls: 't-tree-item'
    },
    render : function(source) {
        this.head = $('<div class="t-head">');
        this.tail = $('<div class="t-tail">');
        
        source = this.__super__(source);
        
        source.append(this.head).append(this.tail);
        
        this.button = Tea.Button({
            text: this.element.text,
            icon: this.element.icon,
            click: Tea.method(this.element.click || jQuery.noop, this.element.context || this.element)
        });
        this.button.render().appendTo(this.head);
        
        this.anchor = $('<div class="t-anchor t-icon">')
                        .prependTo(this.button.source)
                        .click(Tea.method(this.clickAnchor, this));
        
        this.setExpanded(this.element.expanded);
        
        return source;
    },
    append : function(src) {
        this.tail.append(src);
        if (this.anchor)
            this.setExpanded(this.element.expanded);
    },
    prepend : function(src) {
        this.tail.prepend(src);
        if (this.anchor)
            this.setExpanded(this.element.expanded);
    },
    setText : function(src) {
        this.button.setText(src);
    },
    setIcon : function(icon) {
        this.button.setIcon(icon);
    },
    setExpanded : function(flag) {
        if (this.element.items.length == 0) {
            this.setAnchor(null);
            this.tail.hide();
            return;
        }
        
        if (flag == null)
            this.setAnchor(null);
        else if (flag)
            this.setAnchor('collapse');
        else
            this.setAnchor('expand');
        
        if (flag) this.tail.slideDown('fast');
        else this.tail.hide();
    },
    clickAnchor : function() {
        this.element.setExpanded(!this.element.expanded);
        return false;
    },
    setAnchor : function(anchor) {
        this.anchor[0].className = 't-anchor t-icon';
        if (anchor) {
            this.anchor.addClass(anchor);
            this.anchor.addClass('icon-' + anchor);
        }
    }
})
