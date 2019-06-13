let renderObject = require("./renderObject.js")

let TextObject = 
	{
		makeLineTextObject: function(text, context, x = 0, y = 0)
		{
			this.text = text;
			this.context = context;
			this.objects = [];

			for (let i = 0; i < text.length; i++)
			{
				this.objects.push(new renderObject.MakeRenderObject(context, context.uiRenderer(text[i] + ".png")));
				this.objects[i].setPixelScale(16, 20);
			}

			this.setTranslation = function(x, y)
			{
				for (let i = 0; i < this.objects.length; i++)
					this.objects[i].setPixelLocation(16*i + x, y);
			}
			this.setAnchorPoint = function(x, y, z)
			{
				for (let i = 0; i < this.objects.length; i++)
					this.objects[i].setAnchorPoint(x, y, z);
			}
			this.setVisible = function(visible)
			{
				for (let i = 0; i < this.objects.length; i++)
					this.objects[i].visible = visible;
			}
			this.setTranslation(x, y);

		},
		makeTextObject: function(text, context)
		{
			let ogg = new Object();
			ogg.text = text;
			ogg.context = context;
			ogg.objects = [];
			let splitted = text.split("\n");

			for (let i = 0; i < splitted.length; i++)
			{
				ogg.objects.push(new this.makeLineTextObject(splitted[i], context));
			}

			ogg.setTranslation = function(x, y)
			{
				for (let i = 0; i < ogg.objects.length; i++)
					ogg.objects[i].setTranslation(x, y - (i*20));
			}
			ogg.setAnchorPoint = function(x, y, z)
			{
				for (let i = 0; i < ogg.objects.length; i++)
					ogg.objects[i].setAnchorPoint(x, y, z);
			}
			ogg.setVisible = function(visible)
			{
				for (let i = 0; i < ogg.objects.length; i++)
					ogg.objects[i].setVisible(visible);
			}
			return ogg;

		},
		makeCity: function(cityName, text, context)
		{
			let ogg = new Object();
			ogg.name = new this.makeLineTextObject(cityName, context);
			ogg.text = this.makeTextObject(text, context);
			ogg.star = new renderObject.MakeRenderObject(context, context.uiRenderer("star.png"), null);
			ogg.star.setPixelScale(32,32);
			ogg.setTranslation = function(x, y)
			{
				ogg.star.setPixelLocation(x, y);
				ogg.name.setTranslation(x, y - 32);
				ogg.text.setTranslation(x, y - 60);
			};
			ogg.setAnchorPoint = function(x, y, z)
			{
				ogg.star.setAnchorPoint(x, y, z);
				ogg.name.setAnchorPoint(x, y, z);
				ogg.text.setAnchorPoint(x, y, z);
			};
			ogg.setTextVisible = function(visible)
			{
				ogg.text.setVisible( visible);
			};
			ogg.setTranslation(0, 0);
			

			return ogg;
		}
	};

module.exports = TextObject;

