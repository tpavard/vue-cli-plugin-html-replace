const { typeOf, isObject, warn } = require("./utils.js");

module.exports = class VueCliPluginHTMLReplace {
	constructor(patterns, pages) {
		this._pages = pages;
		this._index = Array.isArray(pages) ? 0 : null;
		this._patterns = (Array.isArray(patterns) ? patterns : [patterns])
			.filter(pattern => {
				if (pattern && pattern.pattern) {
					warn("The 'pattern' option is deprecated. Please use 'match' instead: https://github.com/tpavard/vue-cli-plugin-html-replace#pattern");
					pattern.match = pattern.pattern;
				}
				return isObject(pattern)
					&& /String|Function/.test(typeOf(pattern.replacement))
					&& /String|RegExp/.test(typeOf(pattern.match));
			})
			.map(pattern => this._validation(pattern));
	}

	// @private
	_validation({
		match,
		replacement,
		includes,
		excludes,
	}) {
		if (this._index !== null) {
			if (typeof includes === "string") {
				includes = [includes];
			} else if (typeof excludes === "string") {
				excludes = [excludes];
			} else {
				includes = Array.isArray(includes) ? includes.filter(val => typeof val === "string") : null;
				excludes = Array.isArray(excludes) ? excludes.filter(val => typeof val === "string") : null;
			}

			if (includes != null && excludes != null) {
				excludes = null;
			}
		} else {
			includes = null;
			excludes = null;
		}

		return ({
			match,
			replacement,
			includes,
			excludes
		});
	}

	// @private
	_process(data, callback) {
		const filename = this._index === null ? this._pages : this._pages[this._index++];
		const isCurrent = Object.keys(data.assets.chunks).includes(filename);

		this._patterns.forEach(({
			match,
			replacement,
			includes,
			excludes,
		}) => {
			if (isCurrent
				&& (this._index === null
					|| (!includes && !excludes)
					|| (this._index !== null
						&& (
							(includes && includes.includes(filename)) ||
							(excludes && !excludes.includes(filename))
						)))) {
				data.html = data.html.replace(match, replacement);
			}
		});
		callback(null, data);
	}

	apply(compiler) {
		if (this._patterns) {
			compiler.hooks.compilation
				.tap("VueCliPluginHTMLReplace", compilation => compilation.hooks.htmlWebpackPluginAfterHtmlProcessing
					.tapAsync("vue-cli-plugin-html-replace", (data, callback) => this._process(data, callback)));
		}
	}
}
