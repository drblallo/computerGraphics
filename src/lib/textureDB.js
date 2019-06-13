
let textureDB =
	{
		makeDB: function(context)
		{
			this.context = context;
			this.textures = {}
			this.getTexture = function(textName)
			{
				if (!(textName in this.textures))
					this.textures[textName] = context.makeTexture(textName);

				return this.textures[textName];
			}
		}

	};


module.exports = textureDB;
