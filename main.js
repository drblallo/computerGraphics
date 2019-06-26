let unique = require('uniq');
let view = require('./src/view.js');
let Context = require("./context.js")
let utils = require("./src/lib/utils.js")
let renderObject = require("./src/lib/renderObject.js")
let CityList = require("./src/lib/cityList.js")

let gl;

let context;

function removeSeeCard() {
	let elem = document.getElementById('dummy');
	if (elem != null)
		elem.parentNode.removeChild(elem);
}

function cityClicked(index){
	removeSeeCard();
	document.getElementById("city"+(index+1)).innerHTML = '<button id="dummy" class = "see-more" onclick="seeCard()">See more</button>';
	context.cities.setCurrentCity(index);
}
function seeCard() {
	context.cities.showCurrentCityText(true);
}

function changeLight(index){
	context.setLightChoice(index);
}

function ambientToggled() {
	context.setAmbient();
}

function specularToggled() {
	context.setSpecular();
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
	//let grid = new renderObject.MakeRenderObject(context, context.gridRenderer(), null);
	context.camera.transform.translate(0, 0, 4);

	context.globe.transform.setScale(3, 3, 3);

	context.skybox = new renderObject.MakeRenderObject(context, context.skyBoxRenderer(), context.globe);
	context.skybox.transform.setScale(5, 5, 5);

	context.skybox.getSun = function()
	{
		let v = utils.multiplyMatrixVector(utils.transposeMatrix(this.transform.toMatrix()), [0.3, 0.25, 1, 1]);
		return v;
	}
	context.skybox.lightDir = function()
	{
		let v = this.getSun();
		v = [-1*v[0], -1*v[1], -1*v[2]];
		//v = [0,0,-1]; 
		v = utils.normalizeVector(v);
		return v;
	}

	let atm = new renderObject.MakeRenderObject(context, context.atmRenderer(), null);
	atm.transform.setScale(3, 3, 3);


	context.draw();
}	

window.mainFunction = main;
window.cityClicked = cityClicked;
window.seeCard = seeCard;
window.changeLight = changeLight;
window.ambientToggled = ambientToggled;
window.specularToggled = specularToggled;
