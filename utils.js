function typeOf(val) {
	const type = Object.prototype.toString.call(val).substring(8).replace("]", "");
	return type === "Object" ? val.constructor.name : type;
}

function isObject(val) {
	return typeOf(val) === "Object";
}

function warn(msg) {
	console.log("\x1b[31m%s\x1b[0m", `\n${msg}`);
}

module.exports = {
    typeOf,
	isObject,
	warn,
};