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
		this.visible = true;
		if (renderer.isTransparent)
			context.transparentRenderObject.push(this);
		else
			context.renderObjects.push(this);
		if (parentObject != null)
			this.transform = new transform.MakeTransform(parentObject.transform);
		else
			this.transform = new transform.MakeTransform();
		this.parentObject = parentObject;
		this.anchorPoint = [0.0, 0.0, 0.0];
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
		this.render = function()
		{
			this.renderer.render();
		}
		this.modelToWorld = function()
		{
			return this.transform.toMatrix();
		}
		this.worldToModel = function()
		{
			return this.transform.toInvertedMatrix();
		}
		this.setAnchorPoint = function(x, y, z)
		{
			this.anchorPoint = [x, y, z];
		}
    this.distanceFrom = function(other) {
      return this.transform.distanceFrom(other.transform);
    }
    this.setPixelLocation = function(x,y,z) {
			this.transform.setTranslation(
				((x*2.0/context.screenWidth)),
				((y*2.0/context.screenHeight)),
				z);
		}
		this.setPixelScale = function(x,y) {
			this.transform.setScale(x/context.screenWidth,y/context.screenHeight, 1);
		}
	}

}

module.exports = renderObject;
