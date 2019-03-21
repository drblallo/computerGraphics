/* eslint  no-mixed-spaces-and-tabs: 0*/
let utils = require('./lib/utils.js');

let view = {
	view:function() {
		console.log(utils.identityMatrix());
	}
}

module.exports = view
