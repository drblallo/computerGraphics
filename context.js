
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

const vs2 = `#version 300 es
#define POSITION_LOCATION 0

layout(location = POSITION_LOCATION) in vec3 in_pos;
uniform mat4 modelToWorld;
uniform mat4 worldToCamera;
uniform mat4 cameraToScreen;

out vec3 pos;

void main() {
	gl_Position = modelToWorld * vec4(in_pos, 1); 
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

const fs2 = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
out vec4 color;
in vec3 pos;

void main() {
vec2 loc = vec2((pos.x+1.0)/2.0, (pos.y+1.0)/2.0);  //texture expects 0:1 position (not -1:1)
	color = texture(u_texture, loc);

}`;

const worldVertexShader = `#version 300 es
precision highp float;
#define POSITION_LOCATION 0

layout(location = POSITION_LOCATION) in vec3 in_pos;
uniform mat4 modelToWorld;
uniform mat4 worldToCamera;
uniform mat4 cameraToScreen;

out vec3 worldPosition;

void main() {
	gl_Position = cameraToScreen * worldToCamera * modelToWorld * vec4(in_pos, 1); 
	worldPosition = (modelToWorld * vec4(in_pos,1)).xyz;
}
`;

const worldFragmentShader = `#version 300 es
precision highp float;

in vec3 worldPosition ;
out vec4 fragmentColor ;
uniform vec3 og_cameraEye ;
uniform float u_globeOneOverRadiiSquared;

struct Intersection
{
	bool Intersects ;
	float NearTime ;
	float FarTime;
};


Intersection RayIntersectEllipsoid( vec3 rayOrigin , vec3 rayOriginSquared, 
	vec3 rayDirection , vec3 oneOverEllipsoidRadiiSquared )
{ 

		float a = dot(rayDirection * rayDirection, oneOverEllipsoidRadiiSquared);
    float b = 2.0 * dot(rayOrigin * rayDirection, oneOverEllipsoidRadiiSquared);
    float c = dot(rayOriginSquared, oneOverEllipsoidRadiiSquared) - 1.0;
    float discriminant = b * b - 4.0 * a * c;

    if (discriminant < 0.0)
    {
        return Intersection(false, 0.0, 0.0);
    }
    else if (discriminant == 0.0)
    {
        float time = -0.5 * b / a;
        return Intersection(true, time, time);
    }

    float t = -0.5 * (b + (b > 0.0 ? 1.0 : -1.0) * sqrt(discriminant));
    float root1 = t / a;
    float root2 = c / t;

    return Intersection(true, min(root1, root2), max(root1, root2));
}

void main ( )
{

	vec3 rayDirection = normalize(worldPosition - og_cameraEye) ;
	vec3 oneover = vec3(u_globeOneOverRadiiSquared, u_globeOneOverRadiiSquared, u_globeOneOverRadiiSquared);

	Intersection i = RayIntersectEllipsoid ( og_cameraEye , (og_cameraEye*og_cameraEye),
		rayDirection ,  oneover) ;
		
	fragmentColor = vec4 ( i.Intersects , !i.Intersects , 0.0 ,1 ) ;
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
			renderer.shaderProgram = this.defaultShader(quad, index, this.gl.TRIANGLES, vs2, fs2);

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
			renderer.shaderProgram = this.gridShader();

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
			renderer.shaderProgram = this.defaultShader(quad, index, gl.TRIANGLES, vs2, fs2);
			renderer.shaderProgram.texture = this.makeTexture(textureName);

			renderer.onPreRender = function(camera, renderObject)
			{
				this.context.gl.bindTexture(this.context.gl.TEXTURE_2D, this.shaderProgram.texture);
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

		this.worldRenderer = function()
		{
			let renderer = new Object();
			renderer.context = this;
			renderer.shaderProgram = this.defaultShader(cubeVertex, cubeIndexes, gl.TRIANGLES, worldVertexShader, worldFragmentShader);
			//renderer.shaderProgram.texture = this.makeTexture(textureName);

			renderer.shaderProgram.cameraEyeLocation = gl.getUniformLocation(renderer.shaderProgram, "og_cameraEye");
			renderer.shaderProgram.oneOverRadiiSquared = gl.getUniformLocation(renderer.shaderProgram, "u_globeOneOverRadiiSquared");
			renderer.onPreRender = function(camera, renderObject)
			{
				//this.context.gl.bindTexture(this.context.gl.TEXTURE_2D, this.shaderProgram.texture);
				this.shaderProgram.onPreRender(camera, renderObject);
				gl.uniform3fv(this.shaderProgram.cameraEyeLocation, new Float32Array(camera.transform.translation))
				let size = renderObject.transform.scale[0];
				size = 1.0/(size*size);
				gl.uniform1f(this.shaderProgram.oneOverRadiiSquared, size);
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

