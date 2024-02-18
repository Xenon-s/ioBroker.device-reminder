"use strict";
const { isObject } = require("./tools");
/**
 * @description Remove Value from Array
 * @param {Array} arr
 * @param {string} value
 */
async function removeValue(arr, value) {
	return arr.filter(element => {
		return element != value;
	});
};

module.exports = {
	removeValue,
};