let transform = require("./transform.js")
let utils = require("./utils.js")

let camera = {
	MakeCamera: function(width, height)
	{
		this.transform = new transform.MakeTransform();
		this.cameraToScreen = utils.MakePerspective(120, width/height, 0.1, 100.0);
		this.cameraToScreen = utils.invertMatrix(this.cameraToScreen);
		this.cameraToWorld = function()
		{
			return this.transform.toMatrix();
		}
		this.worldToCamera = function()
		{
			return this.transform.toInvertedMatrix();
		}
	}
}


module.exports = camera;
