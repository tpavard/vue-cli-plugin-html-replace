const VueCliPluginHTMLReplace = require("./VueCliPluginHTMLReplace.js");

module.exports = (api, {
        pluginOptions = {},
        pages = {},
    } = {}) => {
    const {
        patterns = [],
        enable = true,
    } = pluginOptions.htmlReplace || {};

    if (enable === true && Array.isArray(patterns) && patterns.length) {
        const keys = Object.keys(pages);

        api.configureWebpack(config => {
            config.plugins.push(new VueCliPluginHTMLReplace(patterns, keys.length ? keys : "app"));
        });
    }
};