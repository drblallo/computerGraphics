let unique = require('uniq');
let view = require('./src/view.js');
let context = require("./context.js")
let utils = require("./src/lib/utils.js")
let renderObject = require("./src/lib/renderObject.js")
let camera = require("./src/lib/camera.js")

let renderObjects = [];
let cam;

let quad;

function draw()
{
	for (let a = 0; a < renderObjects.length; a++)	
	{
		//quad.trasform.rotate(1, 0, 0);
		renderObjects[a].onPreRender(cam);
		
		renderObjects[a].onPostRender();
	}

	window.requestAnimationFrame(draw);
}

function main()
{
	view.view();
	const canvas = document.getElementById("my-canvas");
	const gl = canvas.getContext("webgl2");
	let c = new context.makeContext(gl);

	let w=canvas.clientWidth;
	let h=canvas.clientHeight;

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.viewport(0.0, 0.0, w, h);
	gl.clear(gl.COLOR_BUFFER_BIT);

	cam = new camera.MakeCamera(w, h);
	gl.enable(gl.DEPTH_TEST);

	quad = new renderObject.MakeRenderObject(c, c.defaultRenderer(), null);
	renderObjects.push(quad);
	renderObjects.push(new renderObject.MakeRenderObject(c, c.gridRenderer(), null));
	quad.trasform.setTranslation(1, 0, 0);
	quad.trasform.setScale(1, 1, 1);
	cam.transform.translate(0, 5, 15);

	draw();
}	

window.mainFunction = main;

