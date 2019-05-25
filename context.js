
const vs = `#version 300 es
#define POSITION_LOCATION 0

layout(location = POSITION_LOCATION) in vec3 in_pos;

void main() {
	gl_Position = vec4(in_pos, 1); 
}`;

// Fragment shader
const fs = `#version 300 es
precision highp float;

out vec4 color;

void main() {
	color = vec4(1, 0, 0, 1);
}`;

const quad =
	[
		0.5, -0.5, 0.0,
		0.5, 0.5, 0.0,
		-0.5, -0.5, 0.0,
		-0.5, -0.5, 0.0,
		-0.5, 0.5, 0.0,
		0.5, 0.5, 0.0
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

		this.defaultShader = function()
		{
			let vShader = this.makeShader(vs, this.gl.VERTEX_SHADER);
			let fShader = this.makeShader(fs, this.gl.FRAGMENT_SHADER);

			let program = this.makeProgram(vShader, fShader);
			gl.useProgram(program);
			program.vertexPositionAttribute = this.gl.getAttribLocation(program, "in_pos");
			this.gl.enableVertexAttribArray(program.vertexPositionAttribute);
			program.vertexBuffer = this.createAndFillBufferObject(quad, gl.ARRAY_BUFFER);
			program.indexBuffer = this.createAndFillBufferIndexObject(index, gl.ELEMENT_ARRAY_BUFFER);
			program.gl = this.gl;

			program.onPreRender = function()
			{
				let gl = this.gl;
				gl.useProgram(this);
				gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

				gl.vertexAttribPointer(this.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(this.vertexPositionAttribute);

				gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
			}

			program.onPostRender = function()
			{
					
			}

			return program;
		}

		this.defaultRenderer = function()
		{
			let renderer = new Object(); 
			renderer.context = this;
			renderer.shaderProgram = this.defaultShader();

			renderer.onPreRender = function()
			{
				this.shaderProgram.onPreRender();
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
