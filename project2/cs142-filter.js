'use strict';

Array.prototype.cs142filter = function(clientData, isOK) {
	if (typeof isOK !== 'function') {
		console.error('isOK is not a function', typeof isOK);
		return;
	}
	var newArray = [];
	for (var i = 0; i < this.length; i++) {
		if (isOK(clientData, this[i])) {
			newArray.push(this[i]);
		}
	}   
	return newArray;
};