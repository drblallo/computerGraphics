
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

// Fragment shader
const fs = `#version 300 es
precision highp float;

out vec4 color;
in vec3 pos;

void main() {
	color = vec4(pos, 1);
}`;

const fs2 = `#version 300 es
precision highp float;

out vec4 color;
in vec3 pos;

void main() {
	if(length(pos)>1.0){
		color= vec4(1,0,0,0);
	}
	else{
		color= vec4(1,0,1,0.4);
	}
}`;

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
		3, 4, 5
	]

let context = 
{
	makeContext: function(gl){
		this.gl = gl;
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
		}

		this.defaultRenderer = function()
		{
			let renderer = new Object(); 
			renderer.context = this;
			renderer.shaderProgram = this.defaultShader(quad, index, this.gl.TRIANGLES, vs, fs2);

			renderer.onPreRender = function(camera, renderObject)
			{
				this.shaderProgram.onPreRender(camera, renderObject);
			}

			renderer.onPostRender = function()
			{
				this.shaderProgram.onPostRender();
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
			return renderer;	

		}

	}

}

module.exports = context;

