const ERRORS = {
	PATTERN_KEY_DEPRECATED:
		"The 'pattern' option has been deprecated. Please use 'match' instead: https://github.com/tpavard/vue-cli-plugin-html-replace#pattern",
	BOTH_INCLUDES_EXCLUDES_SET: "Cannot set both 'includes' and 'excludes' options.",
	MATCH_WRONG_TYPE: "Wrong type provided for 'match' option, String or RegExp expected.",
	REPLACEMENT_WRONG_TYPE:
		"Wrong type provided for 'replacement' option, String or Function returning a String expected.",
	INCLUDES_WRONG_TYPE:
		"Wrong type provided for 'includes' option, String or Array of Strings expected.",
	EXCLUDES_WRONG_TYPE:
		"Wrong type provided for 'excludes' option, String or Array of Strings expected.",
	PATTERNS_WRONG_TYPE:
		"Wrong type provided for 'patterns' option, Object or Array of Objects expected.",
};

function warn(key) {
	console.log("\x1b[31m%s\x1b[0m", `\n${ERRORS[key]}`);
}

function error(key) {
	throw Error(ERRORS[key]);
}

function getType(value) {
	return Object
		.prototype
		.toString
		.call(value)
		.slice(8, -1);
}

function formatRelation(value) {
	if (typeof value === "string") return [value];
	return Array.isArray(value)
		&& value.length
		&& value.every(item => typeof item === "string")
			? value : null;
}

function format(patterns, isMultipage) {
	return patterns.reduce((acc, value) => {
		if (getType(value) !== "Object") return acc;

		const {
			replacement,
			includes: includesRaw,
			excludes: excludesRaw,
		} = value;

		const match = (() => {
			if ("match" in value) return value.match;
			if ("pattern" in value) {
				warn("PATTERN_KEY_DEPRECATED");
				return value.pattern;
			}
			return null;
		})();

		if (
			!(typeof match === "string" || getType(match) === "RegExp")
			|| !["string", "function"].includes(typeof replacement)
			|| (includesRaw && excludesRaw)
		) return acc;

		const pattern = {
			match,
			replacement,
		};

		if (isMultipage) {
			const includes = formatRelation(includesRaw);
			const excludes = includes ? formatRelation(excludesRaw) : null;

			if (includes) pattern.includes = includes;
			else if (excludes) pattern.excludes = excludes;
		}

		acc.push(pattern);

		return acc;
	}, []);
}

function validate(patterns, isMultipage) {
	patterns.forEach(pattern => {
		if ("pattern" in pattern && !("match" in pattern)) error("PATTERN_KEY_DEPRECATED");

		const { match, replacement } = pattern;

		if (!(typeof match === "string" || getType(match) === "RegExp")) error("MATCH_WRONG_TYPE");
		if (!["string", "function"].includes(typeof replacement)) error("REPLACEMENT_WRONG_TYPE");
		if ("includes" in pattern && "excludes" in pattern) error("BOTH_INCLUDES_EXCLUDES_SET");

		if (!isMultipage) return;

		const { includes, excludes } = pattern;

		if (!formatRelation(includes)) error("INCLUDES_WRONG_TYPE");
		if (!formatRelation(excludes)) error("EXCLUDES_WRONG_TYPE");
	});
	return patterns;
}

module.exports = (api, { pluginOptions: options, pages: pagesRecord }) => {
	if (!options || typeof options !== "object") return;
	const isEnabled = options.enable !== false;
	const isSilent = options.silent === true;
	const isMultipage = !!pagesRecord;

	if (isEnabled) {
		const patterns = (() => {
			const raw = options.patterns;
			if (raw == null || typeof raw !== "object") {
				if (isSilent) return [];
				else error("PATTERNS_WRONG_TYPE");
			}
			return (isSilent ? format : validate)(Array.isArray(raw) ? raw : [raw], isMultipage);
		})();

		// TODO
		// https://cli.vuejs.org/dev-guide/plugin-dev.html#modifying-webpack-config
		// configureWebpack | chainWebpack
		if (patterns.length) {
			const pages = isMultipage ? Object.keys(pagesRecord) : ["app"];
			let i = 0;

			api.configureWebpack(config => {
				config.plugins.push({
					apply(compiler) {
						compiler.hooks.compilation.tap("VueCliPluginHTMLReplace", compilation =>
							compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
								"vue-cli-plugin-html-replace",
								(data, callback) => {
									const filename = pages[isMultipage ? i++ : 0];
									const isCurrent = !isMultipage
										|| Object.keys(data.assets.chunks).includes(filename);
									patterns.forEach(
										({ match, replacement, includes, excludes }) => {
											if (!isCurrent) return;
											if (isMultipage) {
												if (includes && !includes.includes(filename)) return;
												if (excludes && excludes.includes(filename)) return;
											}
											data.html = data.html.replace(match, replacement);
										}
									);
									callback(null, data);
								}
							)
						);
					},
				});
			});
		}
	}
};
