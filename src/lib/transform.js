let utils = require("./utils.js")
let quaternion = require('./quaternion.min.js')

let trasform  = {
	MakeTransform: function(pTransform = null)
	{
		this.translation = [0.0, 0.0, 0.0];
		this.scale = [1.0, 1.0, 1.0];
		this.rotation = quaternion.fromEuler(0, 0, 0, 'XYZ');
		this.parentTransform = pTransform;

		this.toMatrix = function()
		{
			let toReturn = utils.multiplyMatrices(
				utils.MakeScaleMatrix(
					this.scale[0],
					this.scale[1],
					this.scale[2]),
				utils.identityMatrix());

			toReturn = utils.multiplyMatrices(
				this.rotation.toMatrix4(),
				toReturn
			);

			toReturn = utils.multiplyMatrices(
				utils.MakeTranslateMatrix(
					this.translation[0], 
					this.translation[1], 
					this.translation[2]), 
				toReturn);


			if (this.parentTransform != null)
				toReturn = utils.multiplyMatrices(toReturn, this.parentTransform.toMatrix());

			return toReturn;
		}

		//translate by relative means
		this.translate = function(x, y, z)
		{
			this.translation[0] += x;
			this.translation[1] += y;
			this.translation[2] += z;
		}

		//set absolute translation
		this.setTranslation = function(x, y, z)
		{
			this.translation[0] = x;
			this.translation[1] = y;
			this.translation[2] = z;
		}

		//scale by relative means
		this.scalate = function(x, y, z)
		{
			this.scale[0] *= x;
			this.scale[1] *= y;
			this.scale[2] *= z;
		}

		//set absolute scale 
		this.setScale = function(x, y, z)
		{
			this.scale[0] = x;
			this.scale[1] = y;
			this.scale[2] = z;
		}

		//rotate by relative means
		this.rotate = function(x, y, z)
		{
			let rotDiff = quaternion.fromEuler(
				utils.degToRad(x),
				utils.degToRad(y),
				utils.degToRad(z));

			this.rotation = this.rotation.mul(rotDiff);
		}

		//set absolute rotate 
		this.setRotation = function(x, y, z)
		{
			let rotDiff = quaternion.fromEuler(x, y, z);

			this.rotation = rotDiff;
		}

		this.getRotation =  function()
		{
			return [
				this.rotation.x,
				this.rotation.y,
				this.rotation.z
			];
		}

		this.getParent = function()
		{
			return this.parentTransform;
		}

		this.setParent = function(newP)
		{
			this.parentTransform = newP;
		}

	}
	
}

module.exports = trasform;
