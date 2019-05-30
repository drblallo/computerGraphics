let unique = require('uniq');
let view = require('./src/view.js');
let context = require("./context.js")
let utils = require("./src/lib/utils.js")
let renderObject = require("./src/lib/renderObject.js")
let camera = require("./src/lib/camera.js")

let renderObjects = [];
let transparentRenderObject = [];
let cam;
let gl;

let quad;

function draw()
{
	gl.clear(gl.COLOR_BUFFER_BIT);

	for (let a = 0; a < renderObjects.length; a++)	
	{
		renderObjects[a].onPreRender(cam);
		
		renderObjects[a].onPostRender();
	}
	quad.transform.rotate(1, 1, 0);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	transparentRenderObject.sort(function(a,b) {
		return -(a.distanceFrom(cam) - b.distanceFrom(cam));

	});
	for (let a = 0; a < transparentRenderObject.length; a++) {
		transparentRenderObject[a].onPreRender(cam);

		transparentRenderObject[a].onPostRender();
	}
		gl.disable(gl.BLEND);
	window.requestAnimationFrame(draw);
}

function main()
{
	view.view();
	const canvas = document.getElementById("my-canvas");
	gl = canvas.getContext("webgl2");
	let c = new context.makeContext(gl);

	let w=canvas.clientWidth;
	let h=canvas.clientHeight;

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.viewport(0.0, 0.0, w, h);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	cam = new camera.MakeCamera(w, h);
	gl.enable(gl.DEPTH_TEST);

	quad = new renderObject.MakeRenderObject(c, c.defaultRenderer(), null);
	transparentRenderObject.push(quad);
	transparentRenderObject.push(new renderObject.MakeRenderObject(c, c.defaultRenderer(), null));
	renderObjects.push(new renderObject.MakeRenderObject(c, c.gridRenderer(), null));
	quad.transform.setTranslation(1, 0, 1);
	quad.transform.setScale(1, 1, 1);
	cam.transform.translate(0, 2, 2);

	draw();
}	

window.mainFunction = main;

