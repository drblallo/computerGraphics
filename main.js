let unique = require('uniq');
let view = require('./src/view.js');
let context = require("./context.js")
let utils = require("./src/lib/utils.js")
let renderObject = require("./src/lib/renderObject.js")

console.log("hey");

let renderObjects = [];
let perspectiveMatrix;

function draw()
{
	for (let a = 0; a < renderObjects.length; a++)	
	{
		renderObjects[a].onPreRender();
		
		renderObjects[a].onPostRender();
	}

	window.requestAnimationFrame(draw);
}

function main()
{
	console.log("hey again");
	view.view();
	const canvas = document.getElementById("my-canvas");
	const gl = canvas.getContext("webgl2");
	let c = new context.makeContext(gl);

	let w=canvas.clientWidth;
	let h=canvas.clientHeight;

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.viewport(0.0, 0.0, w, h);
	gl.clear(gl.COLOR_BUFFER_BIT);

	perspectiveMatrix = utils.MakePerspective(60, w/h, 0.1, 1000.0);
	gl.enable(gl.DEPTH_TEST);

	renderObjects.push(new renderObject.MakeRenderObject(c));

	draw();
}	

window.mainFunction = main;

