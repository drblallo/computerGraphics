let Earth2K = require("./Earth2K");
let camera = require("./src/lib/camera.js");
let textureDB = require("./src/lib/textureDB.js");
let utils = require("./src/lib/utils.js")
let renderObject = require("./src/lib/renderObject.js")


const vs = `#version 300 es
#define POSITION_LOCATION 0

layout(location = POSITION_LOCATION) in vec3 in_pos;
uniform mat4 modelToWorld;
uniform mat4 worldToCamera;
uniform mat4 cameraToScreen;

out vec3 pos;

void main() {
	gl_Position = cameraToScreen * worldToCamera* modelToWorld * vec4(in_pos, 1); 
	pos = in_pos;
}`;

const uiVertexShader = `#version 300 es
#define POSITION_LOCATION 0

layout(location = POSITION_LOCATION) in vec3 in_pos;
uniform mat4 modelToWorld;
uniform mat4 worldToCamera;
uniform mat4 cameraToScreen;

uniform mat4 parentModelToWorld;
uniform vec3 anchorPoint;

out vec3 pos;

void main() {
	vec4 sAnchorPoint = cameraToScreen * worldToCamera* parentModelToWorld* vec4(anchorPoint, 1);
	sAnchorPoint = sAnchorPoint/sAnchorPoint.w;
	vec2 xyAnchorPoint = sAnchorPoint.xy;

	vec4 pos2 = modelToWorld * vec4(in_pos, 1.0);
	pos2 = pos2/pos2.w;
	vec2 relPos = pos2.xy;
	
	gl_Position = vec4(xyAnchorPoint + relPos, sAnchorPoint.z, 1);

	pos = in_pos;
}`;

// Fragment shader
const fs = `#version 300 es
precision highp float;

out vec4 color;
in vec3 pos;

void main() {
	color = vec4(0,0,0, 1);
}`;

const uiFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
out vec4 color;
in vec3 pos;


void main() {
vec2 loc = vec2((pos.x+1.0)/2.0, 1.0- ((pos.y+1.0)/2.0));  //texture expects 0:1 position (not -1:1)
	color = texture(u_texture, loc);

}`;

const worldVertexShader = `#version 300 es
precision highp float;
#define POSITION_LOCATION 0

layout(location = POSITION_LOCATION) in vec3 in_pos;
layout(location = 1) in vec2 uv_pos;
layout(location = 2) in vec3 norm_pos;


uniform mat4 modelToWorld;
uniform mat4 worldToCamera;
uniform mat4 cameraToScreen;

out vec2 uv;
out vec3 worldPosition;
out vec3 norm;

void main() {
	gl_Position = cameraToScreen * worldToCamera * modelToWorld * vec4(in_pos, 1); 
	worldPosition = (modelToWorld * vec4(in_pos,1)).xyz;
	norm = norm_pos;
	uv = vec2(uv_pos.x, 1.0-uv_pos.y);
}
`;

const worldFragmentShader = `#version 300 es
precision highp float;

in vec3 norm;
in vec2 uv;
in vec3 worldPosition ;
out vec4 fragmentColor ;
uniform sampler2D u_texture;
uniform sampler2D u_ReflectTexture;

uniform vec3 ADir;
uniform vec4 AlightType;
uniform vec3 APos;
uniform vec3 eyePos;

vec3 compLightDir(vec3 LPos, vec3 LDir, vec4 lightType) {
	//lights
	// -> Point
	vec3 pointLightDir = normalize(LPos - worldPosition);
	// -> Direct
	vec3 directLightDir = -LDir;
	// -> Spot
	vec3 spotLightDir = normalize(LPos - worldPosition);

	return            directLightDir * lightType.x +
					  pointLightDir * lightType.y +
					  spotLightDir * lightType.z;
}

vec4 compLightColor(vec4 lightColor, float LTarget, float LDecay, vec3 LPos, vec3 LDir,
					float LConeOut, float LConeIn, vec4 lightType) {
	float LCosOut = cos(radians(LConeOut / 2.0));
	float LCosIn = cos(radians(LConeOut * LConeIn / 2.0));

	//lights
	// -> Point
	vec4 pointLightCol = lightColor * pow(LTarget / length(LPos - worldPosition), LDecay);
	// -> Direct
	vec4 directLightCol = lightColor;
	// -> Spot
	vec3 spotLightDir = normalize(LPos - worldPosition);
	float CosAngle = dot(spotLightDir, LDir);
	vec4 spotLightCol = lightColor * pow(LTarget / length(LPos - worldPosition), LDecay) *
						clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);
	
	spotLightCol = vec4(1.0-spotLightCol.x, 1.0-spotLightCol.y, 1.0-spotLightCol.z, 1);
						
	// ----> Select final component
	return          directLightCol * lightType.x +
					pointLightCol * lightType.y +
					spotLightCol * lightType.z;
}

void main ( )
{
	float LAConeOut =10.0;
	float LAConeIn = 5.0;
	float LADecay = 0.0;
	float LATarget = 61.0;
	vec4 LAlightColor = vec4(1, 1, 1, 1);
	vec4 diffuseColor = texture(u_texture, uv);


	vec3 LDir = compLightDir(APos, ADir, AlightType);
	vec3 UDir = -normalize(1.0 * ADir);
	vec4 LlightCol = compLightColor(LAlightColor, LATarget, LADecay, APos, UDir,
								     LAConeOut, LAConeIn, AlightType);
	vec3 normalVec = normalize(worldPosition);
	vec3 eyedirVec = normalize(eyePos - worldPosition);

	vec4 specularColor = vec4(0.6, 0.6, 1, 1);
	vec3 reflection = -reflect(LDir, normalVec);
	vec3 shine = texture(u_ReflectTexture, uv).xyz;
	float shineAbs = (1.0-shine.x)*100.0;
	vec4 specularPhong = LlightCol * pow(max(dot(reflection, eyedirVec), 0.0), shineAbs) * specularColor;
	if (shine.x >= 0.9)
		specularPhong = vec4(0, 0, 0, 0);


	vec4 diffuseLambert = LlightCol * clamp(dot(normalVec, LDir),0.0,1.0) * diffuseColor;
	//vec4 diffuseLambert = vec4(0, 0, 0,1)* clamp(dot(normalVec, LDir),0.0,1.0);
	//
	if (dot(normalVec, LDir) <= -0.5)
	{
		specularPhong = vec4(0, 0, 0, 0);
		diffuseLambert = vec4(0, 0, 0, 0);
	}

	fragmentColor =  diffuseLambert + specularPhong;
	fragmentColor = clamp(fragmentColor, 0.0, 1.0);	
	fragmentColor = vec4(fragmentColor.rgb, 1.0);

	fragmentColor = diffuseColor;
}
`;

const atmosphereVertexShader = `#version 300 es
precision highp float;
#define POSITION_LOCATION 0

layout(location = POSITION_LOCATION) in vec3 in_pos;

uniform mat4 modelToWorld;
uniform mat4 worldToCamera;
uniform mat4 cameraToScreen;

out vec3 norm;

void main() {
	
	vec4 atmPos = worldToCamera * modelToWorld * vec4(1.04*in_pos, 1);
	gl_Position = cameraToScreen * atmPos;
	norm = normalize(in_pos);
}
`;

const atmFragmentShader = `#version 300 es
precision highp float;

in vec3 norm;
out vec4 fragmentColor ;
uniform sampler2D u_texture;
uniform vec3 ADir;

void main ( )
{

	float amBlend = (dot(norm, ADir) + 1.0) / 2.0;
	vec4 ambientLightColor = vec4(0, 0, 0, 0.0);
	vec4 ambientLightLowColor = vec4(0, 0.0,1, 1);
	vec4 ambColor = vec4(1, 1, 1, 0.2);
	vec4 ambientHemi = (ambientLightColor * amBlend + ambientLightLowColor * (1.0 - amBlend)) * ambColor;                                                                                     
	fragmentColor = ambientHemi;
	
}
`;
const skyBoxVertexShader = `#version 300 es
precision highp float;
#define POSITION_LOCATION 0

layout(location = POSITION_LOCATION) in vec3 in_pos;
layout(location = 1) in vec2 uv_pos;

uniform mat4 modelToWorld;
uniform mat4 worldToCamera;
uniform mat4 cameraToScreen;

out vec2 uv;

void main() {
	
	gl_Position = cameraToScreen * worldToCamera * modelToWorld * vec4(in_pos, 1); 
	uv = vec2(uv_pos.x, uv_pos.y);

}
`;

const skyBoxFragmentShader = `#version 300 es
precision highp float;

in vec2 uv;
out vec4 fragmentColor ;
uniform sampler2D u_texture;

void main ( )
{
	fragmentColor = texture(u_texture, uv); 
}
`;

let cubeVertex = [
	-1.0,-1.0, 1.0,
	1.0, -1.0, 1.0,
	1.0,  1.0, 1.0,
	-1.0, 1.0, 1.0,
	-1.0,-1.0, -1.0,
	1.0, -1.0, -1.0,
	1.0,  1.0, -1.0,
	-1.0, 1.0, -1.0];

let skyBox = [
	-1.0,-1.0, 1.0, //back
	1.0, -1.0, 1.0, //back
	1.0,  1.0, 1.0, //back
	-1.0, 1.0, 1.0, //back
	-1.0,-1.0, -1.0, //front
	1.0, -1.0, -1.0, //front 
	1.0,  1.0, -1.0, //front 
	-1.0, 1.0, -1.0, //front

	-1.0, 1.0, -1.0,  //up
	1.0,  1.0, -1.0,  //up
	1.0,  1.0,  1.0,  //up
	-1.0, 1.0,  1.0,  //up
	-1.0,-1.0, -1.0,  //down
	1.0, -1.0, -1.0,  //down
	1.0, -1.0,  1.0,  //down
	-1.0,-1.0,  1.0,  //down

	1.0,-1.0, -1.0,  //right
	1.0,1.0,  -1.0,  //right
	1.0,1.0,   1.0,  //right
	1.0,-1.0,  1.0,  //right
	-1.0,-1.0, -1.0,  //left
	-1.0,1.0,  -1.0,  //left
	-1.0,1.0,   1.0,  //left
	-1.0,-1.0,  1.0,  //left
]; 

let skyBoxUV = [
	0.25, 0.333,
	0.5, 0.333,
	0.5, 0.666,
	0.25, 0.666,
	1, 0.333,
	0.75, 0.333,
	0.75, 0.666,
	1, 0.666,

	0.25, 1,
	0.5, 1,
	0.5, 0.666,
	0.25, 0.666,
	0.25, 0.0,
	0.5, 0.0,
	0.5, 0.333,
	0.25, 0.333,

	0.75, 0.333,
	0.75, 0.666,
	0.5, 0.666,
	0.5, 0.333,
	0.0, 0.333,
	0.0, 0.666,
	0.25, 0.666,
	0.25, 0.333
	
];

let skyBoxIndicies = [
	0, 2, 1,
	0, 3, 2,

	4, 5, 6,
	4, 6, 7,

	8, 9, 10,
	8, 10, 11,

	12, 14, 13,
	12, 15, 14,

	16, 18, 17,
	16, 19, 18,

	20, 21, 22,
	20, 22, 23
];



let cubeIndexes = [
	0, 1, 2,
	0, 2, 3,
	3, 2, 6,
	3, 6, 7,
	4, 0, 3,
	4, 3, 7,
	1, 5, 6,
	1, 6, 2,
	4, 5, 1,
	4, 1, 0,
	5, 4, 7,
	5, 7, 6];

const quad =
	[
		1, -1.0, 0.0,
		1, 1, 0.0,
		-1, -1, 0.0,
		-1, -1, 0.0,
		-1, 1, 0.0,
		1, 1, 0.0
	]


const index = 
	[
		0, 1, 2, 
		4, 3, 5
	]

let context = 
{
	makeContext: function(gl, width, height){
		this.gl = gl;
		this.screenWidth = width;
		this.screenHeight = height;
		this.textureDB = new textureDB.makeDB(this);
		this.renderObjects = [];
		this.transparentRenderObject = [];
		this.uiObjects = [];
		this.camera = new camera.MakeCamera(width, height);

	this.draw = function ()
	{
		let gl = this.gl;
		let cam = this.camera;
		gl.clear(gl.COLOR_BUFFER_BIT);

			//this.globe.transform.rotate(0, 0,1);

			let t = this.cities.getCurrentAnchorPoint();
			this.globe.transform.rotationLerp(t, 0.01);
			//this.globe.transform.rotationLerp(0, 1, 0, 0.01);
			this.skybox.transform.rotate(0, 0,0.2);
			//this.globe.transform.setRotation(0, 100,0);
			for (let a = 0; a < this.renderObjects.length; a++)	
			{
				if (!this.renderObjects[a].visible)
					continue;
				this.renderObjects[a].onPreRender(cam);
				this.renderObjects[a].render();

				this.renderObjects[a].onPostRender();
			}

			gl.enable(gl.BLEND);
			gl.disable(gl.DEPTH_TEST);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			this.transparentRenderObject = this.transparentRenderObject.sort(function(a,b) {
				return -(a.distanceFrom(cam) - b.distanceFrom(cam));

			});
			for (let a = 0; a < this.transparentRenderObject.length; a++) {
				if (!this.transparentRenderObject[a].visible)
					continue;
				this.transparentRenderObject[a].onPreRender(cam);
				this.transparentRenderObject[a].render();

				this.transparentRenderObject[a].onPostRender();
			}

			this.uiObjects.sort(function(a,b) {
				return -(a.distanceFrom(cam) - b.distanceFrom(cam));

			});
			for (let a = 0; a < this.uiObjects.length; a++) {
				if (!this.uiObjects[a].visible)
					continue;
				this.uiObjects[a].onPreRender(cam);
				this.uiObjects[a].render();

				this.uiObjects[a].onPostRender();
			}
			gl.disable(gl.BLEND);
			gl.enable(gl.DEPTH_TEST);

			//could not use this directly because inside the lambda it was referncing
			//the lambda caller instead of context
			let otherMe = this; 
			window.requestAnimationFrame(function(){otherMe.draw();});
		}

		this.makeShader = function(code, shaderType)
		{
			let shader = this.gl.createShader(shaderType);
			this.gl.shaderSource(shader, code);
			this.gl.compileShader(shader);
			if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
					alert("ERROR IN SHADER : " + this.gl.getShaderInfoLog(shader));
			}
			return shader;
		}

		this.getTexture = function(textureName)
		{
			return this.textureDB.getTexture(textureName);
		}

		this.makeTexture = function (textureName) {
			// Create a texture.
			let texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);

			// Fill the texture with a 1x1 blue pixel.
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([0, 0, 255, 255]));

			let image = new Image();
			image.crossOrigin = "anonymous";
			image.src = "resources/" + textureName;
			image.addEventListener('load', function() {
				// Now that the image has loaded make copy it to the texture.
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
				gl.generateMipmap(gl.TEXTURE_2D);
			});

			return texture;
		};

		this.makeProgram = function(vertexShader, fragmentShader)
		{
			let program = this.gl.createProgram();
			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);
			gl.linkProgram(program);
			return program;
		}

		this.createAndFillBufferObject = function(data, type) {
			let buffer_id = this.gl.createBuffer();
			if (!buffer_id) {
				alert('Failed to create the buffer object');
				return null;
			}

			// Make the buffer object the active buffer.
			this.gl.bindBuffer(type, buffer_id);

			// Upload the data for this buffer object to the GPU.
			this.gl.bufferData(type, new Float32Array(data), gl.STATIC_DRAW);
			this.gl.bindBuffer(type, null);

			return buffer_id;
		}

		this.createAndFillBufferIndexObject = function(data, type) {
			let buffer_id = this.gl.createBuffer();
			if (!buffer_id) {
				alert('Failed to create the buffer object');
				return null;
			}

			// Make the buffer object the active buffer.
			this.gl.bindBuffer(type, buffer_id);

			// Upload the data for this buffer object to the GPU.
			this.gl.bufferData(type, new Uint16Array(data), gl.STATIC_DRAW);
			this.gl.bindBuffer(type, null);

			return buffer_id;
		}


		this.defaultShader = function(mesh, index, renderType, vertex, fragment)
		{
			let vShader = this.makeShader(vertex, this.gl.VERTEX_SHADER);
			let fShader = this.makeShader(fragment, this.gl.FRAGMENT_SHADER);

			let program = this.makeProgram(vShader, fShader);

			gl.useProgram(program);
			program.vertexPositionAttribute = gl.getAttribLocation(program, "in_pos");
			program.modelToWorldUniform = gl.getUniformLocation(program, "modelToWorld");
			program.worldToCameraUniform = gl.getUniformLocation(program, "worldToCamera");
			program.cameraToScreenUniform = gl.getUniformLocation(program, "cameraToScreen");
			program.mesh = mesh;
			program.index = index;
			program.renderType = renderType;

			this.gl.enableVertexAttribArray(program.vertexPositionAttribute);
			program.vertexBuffer = this.createAndFillBufferObject(mesh, gl.ARRAY_BUFFER);
			program.indexBuffer = this.createAndFillBufferIndexObject(index, gl.ELEMENT_ARRAY_BUFFER);
			program.gl = this.gl;

			program.onPreRender = function(camera, renderObject)
			{
				let gl = this.gl;
				gl.useProgram(this);
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

				gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(this.vertexPositionAttribute);

				gl.uniformMatrix4fv(this.modelToWorldUniform, gl.FALSE, renderObject.modelToWorld());
				gl.uniformMatrix4fv(this.worldToCameraUniform, gl.FALSE, camera.worldToCamera());
				gl.uniformMatrix4fv(this.cameraToScreenUniform, gl.FALSE, camera.cameraToScreen);

			}

			program.render = function()
			{
				gl.drawElements(this.renderType, this.index.length, gl.UNSIGNED_SHORT, 0);
			}

			program.onPostRender = function()
			{
					
			}

			return program;
		}

		this.gridShader = function()
		{
			let lines = [];
			for (let a = -10; a <= 10; a++)
			{
				lines.push(a);
				lines.push(0);
				lines.push(-10);
				lines.push(a);
				lines.push(0);
				lines.push(10);

				lines.push(-10);
				lines.push(0);
				lines.push(a);
				lines.push(10);
				lines.push(0);
				lines.push(a);
			}

			let linesIndex = [];
			for (let a = 0; a < lines.length/3; a++)
			{
				linesIndex.push(a);
			}

			return this.defaultShader(lines, linesIndex, this.gl.LINES, vs, fs);
		};


		this.defaultRenderer = function()
		{
			let renderer = new Object(); 
			renderer.context = this;
			renderer.shaderProgram = this.defaultShader(quad, index, this.gl.TRIANGLES, uiVertexShader, uiFragmentShader);

			renderer.isUI = false;
			renderer.onPreRender = function(camera, renderObject)
			{
				this.shaderProgram.onPreRender(camera, renderObject);
			}

			renderer.onPostRender = function()
			{
				this.shaderProgram.onPostRender();
			}

			renderer.render = function()
			{
				this.shaderProgram.render();
			}

			return renderer;	

		}

		this.gridRenderer = function()
		{
			let renderer = new Object(); 
			renderer.context = this;
			renderer.isTransparent = false;
			renderer.shaderProgram = this.gridShader();
			renderer.isUI = false;

			renderer.onPreRender = function(camera, renderObject)
			{
				this.shaderProgram.onPreRender(camera, renderObject);
			}

			renderer.onPostRender = function()
			{
				this.shaderProgram.onPostRender();
			}
			renderer.render = function()
			{
				this.shaderProgram.render();
			}
			return renderer;	

		};

		this.uiRenderer = function(textureName)
		{
			let renderer = new Object();
			renderer.context = this;
			renderer.isTransparent = true;
			renderer.isUI = true;
			renderer.shaderProgram = this.defaultShader(quad, index, gl.TRIANGLES, uiVertexShader, uiFragmentShader);
			renderer.shaderProgram.texture = this.getTexture(textureName);
			renderer.shaderProgram.parentModelToWorld = gl.getUniformLocation(renderer.shaderProgram, "parentModelToWorld");
			renderer.shaderProgram.anchorPoint = gl.getUniformLocation(renderer.shaderProgram, "anchorPoint");
			renderer.shaderProgram.textureLocation = gl.getUniformLocation(renderer.shaderProgram, "u_texture");

			renderer.onPreRender = function(camera, renderObject)
			{
				this.shaderProgram.onPreRender(camera, renderObject);
				this.context.gl.uniform1i(this.shaderProgram.textureLocation, 0);
				this.context.gl.activeTexture(gl.TEXTURE0);
				this.context.gl.bindTexture(this.context.gl.TEXTURE_2D, this.shaderProgram.texture);

				gl.uniformMatrix4fv(this.shaderProgram.parentModelToWorld, gl.FALSE, this.context.globe.modelToWorld());

				let ac = renderObject.anchorPoint;
				gl.uniform3f(this.shaderProgram.anchorPoint, ac[0], ac[1], ac[2] );
			}

			renderer.onPostRender = function()
			{
				this.shaderProgram.onPostRender();
			}
			renderer.render = function()
			{
				this.shaderProgram.render();
			}
			return renderer;

		}

		this.backGroundRenderer = function(textureName)
		{
			let renderer = new Object();
			renderer.context = this;
			renderer.isTransparent = false;
			renderer.isUI = false;
			renderer.shaderProgram = this.defaultShader(quad, index, gl.TRIANGLES, uiVertexShader, uiFragmentShader);
			renderer.shaderProgram.texture = this.getTexture(textureName);
			renderer.shaderProgram.parentModelToWorld = gl.getUniformLocation(renderer.shaderProgram, "parentModelToWorld");
			renderer.shaderProgram.anchorPoint = gl.getUniformLocation(renderer.shaderProgram, "anchorPoint");

			renderer.onPreRender = function(camera, renderObject)
			{
				this.context.gl.bindTexture(this.context.gl.TEXTURE_2D, this.shaderProgram.texture);
				this.shaderProgram.onPreRender(camera, renderObject);

				gl.uniformMatrix4fv(this.shaderProgram.parentModelToWorld, gl.FALSE, this.context.globe.modelToWorld());

				let ac = renderObject.anchorPoint;
				gl.uniform3f(this.shaderProgram.anchorPoint, ac[0], ac[1], ac[2] );
			}

			renderer.onPostRender = function()
			{
				this.shaderProgram.onPostRender();
			}
			renderer.render = function()
			{
				this.shaderProgram.render();
			}
			return renderer;
		}

		this.skyBoxRenderer = function()
		{
			let renderer = new Object();
			renderer.context = this;
			renderer.isTransparent = false;
			renderer.isUI = false;
			renderer.shaderProgram = this.defaultShader(skyBox, skyBoxIndicies, gl.TRIANGLES, skyBoxVertexShader, skyBoxFragmentShader);
			renderer.shaderProgram.texture = this.getTexture("skybox.png");

			renderer.shaderProgram.uvPositionAttribute = gl.getAttribLocation(renderer.shaderProgram, "uv_pos");
			renderer.shaderProgram.uvBuffer = this.createAndFillBufferObject(skyBoxUV, gl.ARRAY_BUFFER);


			renderer.shaderProgram.textureLocation = gl.getUniformLocation(renderer.shaderProgram, "u_texture");
			renderer.onPreRender = function(camera, renderObject)
			{
				this.shaderProgram.onPreRender(camera, renderObject);
				this.context.gl.uniform1i(this.shaderProgram.textureLocation, 0);
				this.context.gl.activeTexture(gl.TEXTURE0);
				this.context.gl.bindTexture(this.context.gl.TEXTURE_2D, this.shaderProgram.texture);

				gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.uvBuffer);
				gl.vertexAttribPointer(this.shaderProgram.uvPositionAttribute, 2, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(this.shaderProgram.uvPositionAttribute);

			}

			renderer.onPostRender = function()
			{
				this.shaderProgram.onPostRender();
			}
			renderer.render = function()
			{
				this.shaderProgram.render();
			}
			return renderer;

		};

		this.worldRenderer = function()
		{
			let renderer = new Object();
			renderer.context = this;
			renderer.isTransparent = false;
			renderer.isUI = false;
			let indices = [];
			let faces = Earth2K.meshes[0].faces;
			for (let a = 0; a < faces.length; a++)
			{
				indices.push(faces[a][0]);
				indices.push(faces[a][1]);
				indices.push(faces[a][2]);
			}
			let mesh = Earth2K.meshes[0].vertices;
			for (let i = 0; i < mesh.length; i = i +3)
			{
				let l = (mesh[i] ** 2) + (mesh[i+1] ** 2) + (mesh[i+2] ** 2);
				l = Math.sqrt(l);
				for (let b = 0; b < 3; b++)
					mesh[i+b] = mesh[i+b]/l;
			}
			renderer.shaderProgram = this.defaultShader(mesh, indices, gl.TRIANGLES, worldVertexShader, worldFragmentShader);
			renderer.shaderProgram.texture = this.getTexture("EarthTex.png");
			renderer.shaderProgram.reflectTexture = this.getTexture("EarthReflectionTex.png");

			renderer.shaderProgram.uvPositionAttribute = gl.getAttribLocation(renderer.shaderProgram, "uv_pos");
			renderer.shaderProgram.uvBuffer = this.createAndFillBufferObject(Earth2K.meshes[0].texturecoords[0], gl.ARRAY_BUFFER);

			renderer.shaderProgram.normPositionAttribute = gl.getAttribLocation(renderer.shaderProgram, "norm_pos");
			renderer.shaderProgram.normBuffer = this.createAndFillBufferObject(Earth2K.meshes[0].normals, gl.ARRAY_BUFFER);

			renderer.shaderProgram.aDir = gl.getUniformLocation(renderer.shaderProgram, "ADir");
			renderer.shaderProgram.aPos= gl.getUniformLocation(renderer.shaderProgram, "APos");
			renderer.shaderProgram.lightType = gl.getUniformLocation(renderer.shaderProgram, "AlightType");
			renderer.shaderProgram.eyePosLocation = gl.getUniformLocation(renderer.shaderProgram, "eyePos");

			renderer.shaderProgram.textureLocation = gl.getUniformLocation(renderer.shaderProgram, "u_texture");
			renderer.shaderProgram.reflectTextureLocation = gl.getUniformLocation(renderer.shaderProgram, "u_ReflectTexture");

			renderer.onPreRender = function(camera, renderObject)
			{
				this.shaderProgram.onPreRender(camera, renderObject);
				this.context.gl.uniform1i(this.shaderProgram.textureLocation, 0);
				this.context.gl.uniform1i(this.shaderProgram.reflectTextureLocation, 1);
				this.context.gl.activeTexture(gl.TEXTURE0);
				this.context.gl.bindTexture(this.context.gl.TEXTURE_2D, this.shaderProgram.texture);
				this.context.gl.activeTexture(gl.TEXTURE1);
				this.context.gl.bindTexture(this.context.gl.TEXTURE_2D, this.shaderProgram.reflectTexture);

				gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.uvBuffer);
				gl.vertexAttribPointer(this.shaderProgram.uvPositionAttribute, 2, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(this.shaderProgram.uvPositionAttribute);

				gl.bindBuffer(gl.ARRAY_BUFFER, this.shaderProgram.normBuffer);
				gl.vertexAttribPointer(this.shaderProgram.normPositionAttribute, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(this.shaderProgram.normPositionAttribute);
				let lightDir = this.context.skybox.lightDir();
				gl.uniform3f(this.shaderProgram.aDir, lightDir[0], lightDir[1], lightDir[2] );

				let lightPos = this.context.skybox.getSun();
				gl.uniform3f(this.shaderProgram.aPos, lightPos[0], lightPos[1], lightPos[2] );

				let eyePos = this.context.camera.transform.translation;
				gl.uniform3f(this.shaderProgram.eyePosLocation, eyePos[0], eyePos[1], eyePos[2] );

				gl.uniform4f(this.shaderProgram.lightType, 1,0, 0, 0);

			}

			renderer.onPostRender = function()
			{
				this.shaderProgram.onPostRender();
			}
			renderer.render = function()
			{
				this.shaderProgram.render();
			}
			return renderer;

		};
		this.atmRenderer = function()
		{
			let renderer = new Object();
			renderer.context = this;
			renderer.isTransparent = true;
			renderer.isUI = false;
			let indices = [];
			let faces = Earth2K.meshes[0].faces;
			for (let a = 0; a < faces.length; a++)
			{
				indices.push(faces[a][0]);
				indices.push(faces[a][1]);
				indices.push(faces[a][2]);
			}
			let mesh = Earth2K.meshes[0].vertices;
			for (let i = 0; i < mesh.length; i = i +3)
			{
				let l = (mesh[i] ** 2) + (mesh[i+1] ** 2) + (mesh[i+2] ** 2);
				l = Math.sqrt(l);
				for (let b = 0; b < 3; b++)
					mesh[i+b] = mesh[i+b]/l;
			}
			renderer.shaderProgram = this.defaultShader(mesh, indices, gl.TRIANGLES, atmosphereVertexShader, atmFragmentShader);
			renderer.shaderProgram.aDir = gl.getUniformLocation(renderer.shaderProgram, "ADir");

			renderer.onPreRender = function(camera, renderObject)
			{
				this.context.gl.bindTexture(this.context.gl.TEXTURE_2D, this.shaderProgram.texture);
				this.shaderProgram.onPreRender(camera, renderObject);
				let lightDir = this.context.skybox.lightDir();
				gl.uniform3f(this.shaderProgram.aDir, lightDir[0], lightDir[1], lightDir[2] );


			}

			renderer.onPostRender = function()
			{
				this.shaderProgram.onPostRender();
			}
			renderer.render = function()
			{
				this.shaderProgram.render();
			}
			return renderer;

		}
	}

}


module.exports = context;

