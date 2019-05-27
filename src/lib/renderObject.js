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
		renderer, 
		parentObject)
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
		this.onPreRender = function(camera)
		{
			this.renderer.onPreRender(camera, this);
		}
		this.onPostRender = function()
		{
			this.renderer.onPostRender();
		}
		this.modelToWorld = function()
		{
			return this.trasform.toMatrix();
		}
		this.worldToModel = function()
		{
			return this.trasform.toInvertedMatrix();
		}
	}

}

module.exports = renderObject;
