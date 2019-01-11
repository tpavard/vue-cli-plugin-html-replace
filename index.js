const VueCliPluginHTMLReplace = require("./VueCliPluginHTMLReplace.js");

function isObject(val) {
    const type = Object.prototype.toString.call(val).substring(8).replace("]", "");
    return type === "Object" && type === val.constructor.name;
}

module.exports = (api, {
        pluginOptions = {},
        pages = {},
    } = {}) => {

    const {
        patterns = [],
        enable = true,
    } = pluginOptions.htmlReplace || {};

    if (isObject(pluginOptions.htmlReplace) && enable === true && (Array.isArray(patterns) || isObject(patterns))) {
        const keys = Object.keys(pages);

        api.configureWebpack(config => {
            config.plugins.push(new VueCliPluginHTMLReplace(patterns, keys.length ? keys : "app"));
        });
    }
};