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
			this.transform = new transform.MakeTransform(parentObject.transform);
		else
			this.transform = new transform.MakeTransform();
		this.parentObject = parentObject;
		this.setParent = function(newParent)
		{
			this.transform.setParent(newParent.transform);
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
			return this.transform.toMatrix();
		}
		this.worldToModel = function()
		{
			return this.transform.toInvertedMatrix();
		}
    this.distanceFrom = function(other) {
      return this.transform.distanceFrom(other.transform);
    }
	}

}

module.exports = renderObject;
