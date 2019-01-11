function typeOf(val) {
	const type = Object.prototype.toString.call(val).substring(8).replace("]", "");
	return type === "Object" ? val.constructor.name : type;
}

function isObject(val) {
	return typeOf(val) === "Object";
}

module.exports = {
    typeOf,
    isObject,
};