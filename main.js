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

		cam.transform.translate(0, 0, 0.01);
	for (let a = 0; a < renderObjects.length; a++)	
	{
		renderObjects[a].transform.rotate(0, 0,1);
		renderObjects[a].onPreRender(cam);
		renderObjects[a].render();

		renderObjects[a].onPostRender();
	}

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	transparentRenderObject.sort(function(a,b) {
		return -(a.distanceFrom(cam) - b.distanceFrom(cam));

	});
	for (let a = 0; a < transparentRenderObject.length; a++) {
		transparentRenderObject[a].onPreRender(cam);
		transparentRenderObject[a].render();

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
	let w=canvas.clientWidth;
	let h=canvas.clientHeight;
	let c = new context.makeContext(gl, w, h);

	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.viewport(0.0, 0.0, w, h);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	cam = new camera.MakeCamera(w, h);
	gl.enable(gl.DEPTH_TEST);

	quad = new renderObject.MakeRenderObject(c, c.uiRenderer("star.jpg"), null);
	transparentRenderObject.push(quad);
	renderObjects.push(new renderObject.MakeRenderObject(c, c.gridRenderer(), null));

	let globe = new renderObject.MakeRenderObject(c, c.worldRenderer(), null);
	//globe.transform.setScale(2, 2, 2);
	renderObjects.push(globe);
	quad.setPixelLocation(0, 0, -1);
	//quad.transform.setScale(0.5, 0.5, 0.5);
	cam.transform.translate(0, 0, 2);
	quad.setPixelScale(50, 50);

	draw();
}	

window.mainFunction = main;

