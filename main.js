let unique = require('uniq');
let view = require('./src/view.js');
let Context = require("./context.js")
let utils = require("./src/lib/utils.js")
let renderObject = require("./src/lib/renderObject.js")
let TextObject = require("./src/lib/textObject.js")

let gl;

let quad;
let context;


function main()
{
	view.view();
	const canvas = document.getElementById("my-canvas");
	gl = canvas.getContext("webgl2");
	let w=canvas.clientWidth;
	let h=canvas.clientHeight;
	context = new Context.makeContext(gl, w, h);

	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.viewport(0.0, 0.0, w, h);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	gl.enable(gl.DEPTH_TEST);


	context.globe = new renderObject.MakeRenderObject(context, context.worldRenderer(), null);
	let grid = new renderObject.MakeRenderObject(context, context.gridRenderer(), null);
	context.camera.transform.translate(0, 1, 4);

	context.globe.transform.setScale(3, 3, 3);
	quad = new renderObject.MakeRenderObject(context, context.skyBoxRenderer(), context.globe);
	quad.transform.setScale(10, 10, 10);
	//let quad2 = new renderObject.MakeRenderObject(context, context.uiRenderer("star.png"), null);
	let atm = new renderObject.MakeRenderObject(context, context.atmRenderer(), null);
	atm.transform.setScale(3, 3, 3);
	//alert(h);
	//alert(w);
	//quad.setPixelLocation(0, 58, 0);
	//quad.setPixelScale(32, 32);
	//quad.setAnchorPoint(1.1, 0, 0.0);
	//quad2.setPixelScale(32, 32);
	//quad2.setAnchorPoint(Math.sqrt(2)/2*1.11, Math.sqrt(2)/2*1.11, 0.0);

	let ogg = TextObject.makeCity("citA", "text\next", context);
	let ogg2 = TextObject.makeCity("AAA", "text\next", context);
	//ogg.setTranslation(200, 200);
	ogg.setAnchorPoint(0, 1, 0);
	ogg2.setAnchorPoint(0, 0, 1);
	ogg.setTextVisible(false);


	context.draw();
}	

window.mainFunction = main;

