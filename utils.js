function typeOf(value) {
	if (value === null) return "Null";
	let type = typeof value;
	if (type !== "object") return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
	type = Object.prototype.toString.call(value).slice(8, -1);
	return type === "Object" ? value.constructor.name : type;
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
