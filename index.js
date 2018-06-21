class VueCliPluginHtmlReplace {
    constructor({
        patterns = [],
        enable = true
    } = {}) {
        if (typeof enable !== "boolean") throw new Error(`Invalid 'enable' option provided. Got ${typeof enable}, expected 'boolean'.`);

        if (enable) {
            this.patterns = Array.isArray(patterns) ? patterns : [patterns];

            this.patterns.forEach(pattern => {

                if (typeof pattern !== "object") {
                    throw new Error(`Invalid pattern. Got ${typeof pattern}, expected 'object'.`);
                } else if (pattern.pattern == null || pattern.replacement == null) {
                    throw new Error("Both 'pattern' and 'replacement' options must be defined.");
                } else {
                    try {
                        new RegExp(pattern.pattern);
                    } catch (e) {
                        throw new Error("Invalid 'pattern' option provided, it must be a valid RegExp.");
                    }
                }
                
            });
        }
    }

    apply(compiler) {
        if (this.patterns) {
            compiler.hooks.compilation.tap(
                "VueCliPluginHtmlReplace",
                compilation => {
                    compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
                        "vue-cli-plugin-html-replace",
                        (data, callback) => {
                            this.patterns.forEach(option => {
                                data.html = data.html.replace(option.pattern, option.replacement);
                            });
                            callback(null, data);
                        });
                    });
        }
    }
}

module.exports = (api, options) => {
    const pluginOptions = options.pluginOptions;

    if(pluginOptions && pluginOptions.htmlReplace) {

        api.configureWebpack(config => {
            config.plugins.push(new VueCliPluginHtmlReplace(pluginOptions.htmlReplace));
        });

    }

}