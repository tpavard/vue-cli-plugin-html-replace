const { isObject } = require("./utils.js");
const VueCliPluginHTMLReplace = require("./VueCliPluginHTMLReplace.js");

module.exports = (api, {
		pluginOptions = {},
		pages = {},
	} = {}) => {
	const {
		patterns = [],
		enable = true,
	} = pluginOptions.htmlReplace || {};

	if (isObject(pluginOptions.htmlReplace) && enable === true
		&& (Array.isArray(patterns) || isObject(patterns))) {
		const keys = Object.keys(pages);

		api.configureWebpack(config => {
			config.plugins.push(new VueCliPluginHTMLReplace(patterns, keys.length ? keys : "app"));
		});
	}
};