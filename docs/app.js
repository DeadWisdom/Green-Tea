App = Tea.Application.subclass('App', {
    init : function()
    {	
        this.path = [];
        this.pollHash = Tea.metronome(100, this.pollHash, this);
        this.stack = null;
        
        Tea.ajax({
            url: 'docs.json',
            success: this.load, 
            context: this
        });
    },
    
    gatherChildren : function(doc)
    {
        var map = {};
        var sources = {};
        
		while(doc) {
		    jQuery.each(doc.children, function() {
		        if (map[this.name])
		            return;
		        
		        map[this.name] = this;
		        sources[this.name] = doc.name;
		    });
		    doc = doc['extends'] ? this.map[doc['extends'][0]] : null;
		}
		
		var children = [];
		for(var n in map)
		    children.push( map[n] );
		
		children.sort(function(a, b) {
		    if (a.important && !b.important) return -1;
		    if (b.important && !a.important) return 1;
		    return a.name.localeCompare(b.name);
		});
		
		return [children, sources];
    },
    
    setHash : function(hash)
    {
        this._hash = hash;
        window.location.hash = hash;
    },
    
    pollHash : function()
    {   
        if (window.location.hash != this._hash)
        {
            this.setHash(window.location.hash);
            this.route(window.location.hash.substr(1));
        }
        
        this.pollHash();
    },
    
    route : function(name)
    {
        if (!this.stack)
            return false;
            
        this.stack.popAfter(this.stack.items[0]);
        
        var path = name.split('.')
        var progress = [];
        var panel = null;
        
        for(var i=0; i<path.length; i++)
        {
            progress.push(path[i]);
            panel = this.stack.items[this.stack.items.length-1];
            panel.each(function()
            {
                if (this.options.name == progress.join("."))
                    this.click();
            });
        }
    },

	createPanel : function(doc, first)
	{
		var items = [{
			type: 'Tea.Element',
			cls: 'info',
			html: doc.text
		}];
		
		if (doc.name == 'Tea')
		{
		    var children = doc.children;
		    var sources = {};
	    }
	    else
	    {
    		var o = this.gatherChildren(doc);
    		var children = o[0];
    		var sources = o[1];   
	    }
		
		for(var i=0; i<children.length; i++)
			items.push( this.createButton(children[i], sources[children[i].name]) );
		
		var title = doc['name'];
		if (doc.sig)
		    title += " <span class='sig'>" + doc.sig + "</span>";
		if (doc['extends'])
		    title += " <a class='extends' href='#" + doc['extends'][0] + "'>- extends " + doc['extends'][0] + "</a>";
		
		return {
			type: 'Tea.Panel',
			skin: first ? null : 'App.Closable',
			title: title,
			items: items/*,
			//size: doc['type'] == 'function' || doc['type'] == 'class' ? 2 : 1*/
		};
	},

	createButton : function(doc, source)
	{
		var panel = this.createPanel(doc);
		var upper = doc['short'][0] == doc['short'][0].toUpperCase();
		
		if (source)
		    var text = doc['short'] + ' ' + " <a class='extends' href='#" + source + "'>" + source + "</a>";
		else
		    var text = doc['short'];
		
		return {
			type: 'Tea.Button',
			text: text,
			name: doc['name'],
			icon: doc['type'],
			panel: panel,
			click: function()
			{
			    App.setHash('#' + doc['name']);
				App.stack.push(panel, this.parent);
			}
		}
	},
	
    accountFor : function(doc)
    {
        this.map[doc.name ? doc.name : 'Tea'] = doc;
        
        jQuery.each(doc.children, this.accountFor);
    },
	
    load : function(roots)
    {
        var map = this.map = {};
        var accountFor = function()
        {
            map[this.name ? this.name : 'Tea'] = this;
            
            if (this.children)
                jQuery.each(this.children, accountFor);
        }
        jQuery.each(roots, accountFor);
        
        roots[0].type = 'module';
        
		var stack = this.stack = new Tea.StackContainer({
		    skin: 'Tea.StackContainer.Stretchy',
			source: '#content',
			items: [this.createPanel(roots[0], true)],
			space: 12
		});
		
		stack.render().hide().fadeIn();
		
		$('#top img')
		    .click(function() { stack.popAfter(stack.items[0]) })
		    .css('cursor', 'pointer');
		
        this.pollHash();
    }
})

Tea.Panel.Skin.subclass('App.Closable', {
    render : function()
    {
        var source = Tea.Panel.Skin.prototype.render.apply(this, arguments);
        var element = this.element;
        var back = $('<div class="t-back">&nbsp;</div>').click(function()
        {
            App.stack.pop(element);
        });
        return source.prepend(back);
    }
})