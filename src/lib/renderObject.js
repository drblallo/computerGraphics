let transform = require("./transform.js")


let renderObject = {
	EmptyContext: function()
	{
		this.defaultRenderer = function()	
		{
			return null;
		}
	},
	MakeRenderObject: function(
		context, 
		renderer = context.defaultRenderer(context), 
		parentObject = null)
	{
		this.renderer = renderer;
		this.context = context;
		if (parentObject != null)
			this.transform = new transform.MakeTransform(parentObject.trasform);
		else
			this.trasform = new transform.MakeTransform();
		this.parentObject = parentObject;
		this.setParent = function(newParent)
		{
			this.transform.setParent(newParent.trasform);
			this.parentObject = newParent;
		}
		this.getParent = function()
		{
			return this.parentObject;
		}
		this.onPreRender = function()
		{
			this.renderer.onPreRender();
		}
		this.onPostRender = function()
		{
			this.renderer.onPostRender();
		}
	}

}

module.exports = renderObject;
