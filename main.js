let unique = require('uniq');
let view = require('./src/view.js');
let Context = require("./context.js")
let utils = require("./src/lib/utils.js")
let renderObject = require("./src/lib/renderObject.js")
let CityList = require("./src/lib/cityList.js")

let gl;

let quad;
let context;

function removeSeeMore() {
	let elem = document.getElementById('dummy');
	if (elem != null)
		elem.parentNode.removeChild(elem);
}

function cityClicked(index){
	removeSeeMore();
	document.getElementById("city"+(index+1)).innerHTML = '<button id="dummy" class = "see-more" onclick="seeCard()">See more</button>';
	context.cities.setCurrentCity(index);
}
function seeCard() {
	context.cities.showCurrentCityText(true);
}

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
	context.cities = new CityList.makeCityList(context);
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




	context.draw();
}	

window.mainFunction = main;
window.cityClicked = cityClicked;
window.seeCard = seeCard;
