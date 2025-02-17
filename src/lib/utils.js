/* eslint  no-mixed-spaces-and-tabs: 0*/

let utils = {

//**** MODEL UTILS
	// Function to load a 3D model in JSON format
	get_json: function(url, func) {
		let xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", url, false); // if true == asynchronous...
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status==200) {
				//the file is loaded. Parse it as JSON and launch function
				func(JSON.parse(xmlHttp.responseText));
			}
		};
		//send the request
		xmlHttp.send();
	},
	
	//function to convert decimal value of colors 
	decimalToHex: function(d, padding) {
		let hex = Number(d).toString(16);
		padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

		while (hex.length < padding) {
			hex = "0" + hex;
		}

		return hex;
	},
	
	
	
	
	
	
//*** SHADERS UTILS	
	/*Function to load a shader's code, compile it and return the handle to it
	Requires:
		path to the shader's text (url)

	*/
	
 
	loadFile: function (url, data, callback, errorCallback) {
		// Set up an synchronous request! Important!
		let request = new XMLHttpRequest();
		request.open('GET', url, false);

		// Hook the event that gets called as the request progresses
		request.onreadystatechange = function () {
			// If the request is "DONE" (completed or failed) and if we got HTTP status 200 (OK)
			
				
			if (request.readyState == 4 && request.status == 200) {
					callback(request.responseText, data)
				//} else { // Failed
				//	errorCallback(url);
			}
			
		};

		request.send(null);    
	},

	loadFiles: function (urls, callback, errorCallback) {
    let numUrls = urls.length;
    let numComplete = 0;
    let result = [];

		// Callback for a single file
		function partialCallback(text, urlIndex) {
			result[urlIndex] = text;
			numComplete++;

			// When all files have downloaded
			if (numComplete == numUrls) {
				callback(result);
			}
		}

		for (let i = 0; i < numUrls; i++) {
			this.loadFile(urls[i], i, partialCallback, errorCallback);
		}
	},
	
	
	
	
	
	
	
	
	
	
//*** MATH LIBRARY

	degToRad: function(angle){
		return(angle*Math.PI/180);
	},

	normalizeVector: function(v)
	{
		let abs = 0;
		let toReturn = [];
		for (let b = 0; b < v.length; b++)
			abs += v[b]*v[b];
		abs = Math.sqrt(abs);
		for (let b = 0; b < v.length; b++)
			toReturn.push( v[b]/abs); 
		return toReturn;
	},

	radToDeg: function(angle){
		return((angle/Math.PI)*180);
	},

	identityMatrix: function() {
		return [1,0,0,0,
				0,1,0,0,
				0,0,1,0,
				0,0,0,1];
	},
	
	//requires as a parameter a 4x4 matrix (array of 16 values)
	invertMatrix: function(m){ 
       
		let out = [];
		let inv = [];
		let det, i;

		inv[0] = m[5]  * m[10] * m[15] - m[5]  * m[11] * m[14] - m[9]  * m[6]  * m[15] + 
				 m[9]  * m[7]  * m[14] + m[13] * m[6]  * m[11] - m[13] * m[7]  * m[10];

		inv[4] = -m[4]  * m[10] * m[15] + m[4]  * m[11] * m[14] + m[8]  * m[6]  * m[15] - 
				  m[8]  * m[7]  * m[14] - m[12] * m[6]  * m[11] + m[12] * m[7]  * m[10];

		inv[8] = m[4]  * m[9] * m[15] - m[4]  * m[11] * m[13] - m[8]  * m[5] * m[15] + 
				 m[8]  * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];

		inv[12] = -m[4]  * m[9] * m[14] + m[4]  * m[10] * m[13] + m[8]  * m[5] * m[14] - 
				   m[8]  * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];

		inv[1] = -m[1]  * m[10] * m[15] + m[1]  * m[11] * m[14] + m[9]  * m[2] * m[15] - 
				  m[9]  * m[3] * m[14] - m[13] * m[2] * m[11] +  m[13] * m[3] * m[10];

		inv[5] = m[0]  * m[10] * m[15] - m[0]  * m[11] * m[14] - m[8]  * m[2] * m[15] + 
				 m[8]  * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];

		inv[9] = -m[0]  * m[9] * m[15] + m[0]  * m[11] * m[13] + m[8]  * m[1] * m[15] - 
				  m[8]  * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];

		inv[13] = m[0]  * m[9] * m[14] - m[0]  * m[10] * m[13] - m[8]  * m[1] * m[14] + 
				  m[8]  * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];

		inv[2] = m[1]  * m[6] * m[15] - m[1]  * m[7] * m[14] - m[5]  * m[2] * m[15] + 
				 m[5]  * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];

		inv[6] = -m[0]  * m[6] * m[15] + m[0]  * m[7] * m[14] + m[4]  * m[2] * m[15] - 
				  m[4]  * m[3] * m[14] - m[12] * m[2] * m[7] +  m[12] * m[3] * m[6];

		inv[10] = m[0]  * m[5] * m[15] - m[0]  * m[7] * m[13] - m[4]  * m[1] * m[15] + 
				  m[4]  * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];

		inv[14] = -m[0]  * m[5] * m[14] + m[0]  * m[6] * m[13] + m[4]  * m[1] * m[14] - 
				   m[4]  * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];

		inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] - 
				  m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];

		inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] + 
				 m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];

		inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] - 
				   m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];

		inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] + 
				  m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

		det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

		if (det == 0)
			return out = this.identityMatrix();

		det = 1.0 / det;

		for (i = 0; i < 16; i++){
			out[i] = inv[i] * det;
		}
		
		return out;
	},
	
	transposeMatrix: function(m){
		let out = []; 
		
		let row, column, row_offset;
		
		row_offset=0;
		for (row = 0; row < 4; ++row) {
			row_offset = row * 4;
			for (column = 0; column < 4; ++column){
				out[row_offset + column] = m[row + column * 4];
			  }    
		}
		return out;        
	},
	
	multiplyMatrices: function(m1, m2){
	// Perform matrix product  { out = m1 * m2;}
		let out = [];  
		
		let row, column, row_offset;
		
		row_offset=0;
		for (row = 0; row < 4; ++row) {
			row_offset = row * 4;
			for (column = 0; column < 4; ++column){
				out[row_offset + column] =
					(m1[row_offset + 0] * m2[column + 0]) +
					(m1[row_offset + 1] * m2[column + 4]) +
					(m1[row_offset + 2] * m2[column + 8]) +
					(m1[row_offset + 3] * m2[column + 12]);
			  }    
		}
		return out; 
	},	

	multiplyMatrixVector: function(m, v){
       /* Mutiplies a matrix [m] by a vector [v] */
       
		let out = [];  
		
		let row, row_offset;
		
		row_offset=0;
		for (row = 0; row < 4; ++row) {
			row_offset = row * 4;

			out[row] =
				(m[row_offset + 0] * v[0]) +
				(m[row_offset + 1] * v[1]) +
				(m[row_offset + 2] * v[2]) +
				(m[row_offset + 3] * v[3]);
				 
		}
		return out;        
	},
	
	
	
	
	
	
	
	
//*** MODEL MATRIX OPERATIONS


	MakeTranslateMatrix: function(dx, dy, dz) {
	// Create a transform matrix for a translation of ({dx}, {dy}, {dz}).

		let out = this.identityMatrix();

		out[3]  = dx;
		out[7]  = dy;
		out[11] = dz;
		return out; 
	},
	
	MakeRotateXMatrix: function(a) {
	// Create a transform matrix for a rotation of {a} along the X axis.

		let out = this.identityMatrix();

		let adeg = this.degToRad(a);
		let c = Math.cos(adeg);
		let s = Math.sin(adeg);

		out[5] = out[10] = c;
		out[6] = -s;
		out[9] = s;

		return out; 
	},

	MakeRotateYMatrix: function(a) {
	// Create a transform matrix for a rotation of {a} along the Y axis.

		let out = this.identityMatrix();

		let adeg = this.degToRad(a);
		
		let c = Math.cos(adeg);
		let s = Math.sin(adeg);

		out[0] = out[10] = c;
		out[2] = s;
		out[8] = -s;

		return out; 
	},

	MakeRotateZMatrix: function(a) {                                            
	// Create a transform matrix for a rotation of {a} along the Z axis.

		let out = this.identityMatrix();

		let adeg = this.degToRad(a);
		let c = Math.cos(adeg);
		let s = Math.sin(adeg);

		out[0] = out[5] = c;
		out[4] = -s;
		out[1] = s;

		return out; 
	},

	MakeScaleMatrix: function(s) {
	// Create a transform matrix for proportional scale

		let out = this.identityMatrix();                                               

		out[0] = out[5] = out[10] = s;

		return out; 
	},

	MakeScaleNuMatrix: function(sx, sy, sz) {
	// Create a scale matrix for a scale of ({sx}, {sy}, {sz}).

		let out = this.identityMatrix();
		out[0]  = sx;
		out[5]  = sy;
		out[10] = sz;
		return out; 
	},

	MakeShearXMatrix: function(hy, hz) {
	// Create a scale matrix for a scale of ({sx}, {sy}, {sz}).

		let out = this.identityMatrix();
		out[4]  = hy;
		out[8] = hz;
		return out; 
	},

	MakeShearYMatrix: function(hx, hz) {
	// Create a scale matrix for a scale of ({sx}, {sy}, {sz}).

		let out = this.identityMatrix();
		out[1]  = hx;
		out[9] = hz;
		return out; 
	},

	MakeShearZMatrix: function(hx, hy) {
	// Create a scale matrix for a scale of ({sx}, {sy}, {sz}).

		let out = this.identityMatrix();
		out[2]  = hx;
		out[6] = hy;
		return out; 
	},


//***Projection Matrix operations
	MakeWorld: function(tx, ty, tz, rx, ry, rz, s){
	//Creates a world matrix for an object.

		let Rx = this.MakeRotateXMatrix(ry);                
		let Ry = this.MakeRotateYMatrix(rx);
		let Rz = this.MakeRotateZMatrix(rz);  
		let S  = this.MakeScaleMatrix(s);
		let T =  this.MakeTranslateMatrix(tx, ty, tz);         
		   
		let out = this.multiplyMatrices(Rz, S);
		out = this.multiplyMatrices(Ry, out);
		out = this.multiplyMatrices(Rx, out);  
		out = this.multiplyMatrices(T, out);

		return out;
	},

	MakeView: function(cx, cy, cz, elev, ang) {
	// Creates in {out} a view matrix. The camera is centerd in ({cx}, {cy}, {cz}).
	// It looks {ang} degrees on y axis, and {elev} degrees on the x axis.
		
		let T = [];
		let Rx = [];
		let Ry = [];
		let tmp = [];
		let out = [];

		T =  this.MakeTranslateMatrix(-cx, -cy, -cz);
		Rx = this.MakeRotateXMatrix(-elev);
		Ry = this.MakeRotateYMatrix(-ang);

		tmp = this.multiplyMatrices(Ry, T);
		out = this.multiplyMatrices(Rx, tmp);

		return out;
	},

	MakePerspective:function(fovy, a, n, f) {
	// Creates the perspective projection matrix. The matrix is returned.
	// {fovy} contains the vertical field-of-view in degrees. {a} is the aspect ratio.
	// {n} is the distance of the near plane, and {f} is the far plane.

		let perspective = this.identityMatrix();

		let halfFovyRad = this.degToRad(fovy/2);	// stores {fovy/2} in radiants
		let ct = 1.0 / Math.tan(halfFovyRad);			// cotangent of {fov/2}

		perspective[0] = ct / a;
		perspective[5] = ct;
		perspective[10] = (f + n) / (n - f);
		perspective[11] = 2.0 * f * n / (n - f);
		perspective[14] = -1.0;
		perspective[15] = 0.0;	

		return perspective;
	},

	MakeParallel:function(w, a, n, f) {
	// Creates the parallel projection matrix. The matrix is returned.
	// {w} contains the horizontal half-width in world units. {a} is the aspect ratio.
	// {n} is the distance of the near plane, and {f} is the far plane.

		let parallel = this.identityMatrix();

		parallel[0] = 1.0 / w;
		parallel[5] = a / w;
		parallel[10] = 2.0 / (n - f);
		parallel[11] = (n + f) / (n - f);

		return parallel;
	},
	
	VectorLength:function(vector) {
		return Math.sqrt(Math.pow(vector[0],2)+Math.pow(vector[1],2)+Math.pow(vector[2],2));
	},

	VectorDiff:function(vec1, vec2) {
		let toRet = [];
		for(let i=0; i<3; i++){
			toRet.push(vec1[i]-vec2[i]);
		}
		return toRet;
	}
}

module.exports = utils;
