class VueCliPluginHtmlReplace {
    constructor({
        patterns = [],
        enable = true
    } = {}, multipage = false) {
        if (typeof enable !== "boolean") {
            throw new Error(`Invalid 'enable' option provided. Got ${typeof enable}, 'boolean' expected.`);
        }

        if (enable) {
            this.patterns = Array.isArray(patterns) ? patterns : [patterns];
            this.multipage = multipage;
            this.patterns.map(pattern => this.patternChecker(pattern));
        }
    }

    patternChecker(pttrn) {
        const {
            pattern = null,
            replacement = null,
            includes = null,
            excludes = null
        } = pttrn;

        if (typeof pttrn !== "object") {
            throw new Error(`Invalid pattern. Got ${typeof pttrn}, 'object' expected.`);
        } else if (!/string|function/.test(typeof replacement)) {
            throw new Error("Invalid 'pattern' option provided, 'string' or 'function' expected");
        } else if (pattern === null || replacement === null) {
            throw new Error("Both 'pattern' and 'replacement' options must be defined.");
        } else {
            try {
                new RegExp(pattern);
            } catch (e) {
                throw new Error("Invalid 'pattern' option provided, it must be a valid RegExp.");
            }
        }

        if (this.multipage) {
            if (includes != null && excludes != null) {
                throw new Error("Only one from either 'includes' or 'excludes' options should be defined.");
            } else if (includes && !(typeof includes === "string" || Array.isArray(includes))) {
                throw new Error("Invalid 'includes' option provided, string or array of strings expected");
            } else if (excludes && !(typeof excludes === "string" || Array.isArray(excludes))) {
                throw new Error("Invalid 'excludes' option provided, string or array of strings expected");
            }
        }

        return ({
            pattern,
            replacement,
            includes: (Array.isArray(includes) || !includes) ? includes : [includes],
            excludes: (Array.isArray(excludes) || !excludes) ? excludes : [excludes]
        });
    }

    apply(compiler) {
        if (this.patterns) {
            compiler
                .hooks
                .compilation
                .tap("VueCliPluginHtmlReplace",
                    compilation => compilation
                        .hooks
                        .htmlWebpackPluginAfterHtmlProcessing
                        .tapAsync("vue-cli-plugin-html-replace", (data, callback) => this.process(data, callback))
                );
        }
    }

    process(data, callback) {
        const filename = Object.keys(data.assets.chunks)[1];

        this.patterns.forEach(options => {
            const {
                pattern,
                replacement,
                includes,
                excludes
            } = options;
            
            if (
                !this.multipage ||
                (!includes && !excludes) ||
                (this.multipage && (
                    (includes && includes.includes(filename)) ||
                    (excludes && !excludes.includes(filename))
                ))
            ) {
                data.html = data.html.replace(pattern, replacement);
            }
        });
        callback(null, data);
    }
}

module.exports = (api, options) => {
    const {
        pluginOptions = {},
        pages = [],
    } = options;

    if (
        pluginOptions.htmlReplace &&
        Object.keys(pluginOptions.htmlReplace).length > 0
    ) {
        api.configureWebpack(config => {
            config.plugins.push(new VueCliPluginHtmlReplace(
                pluginOptions.htmlReplace,
                Object.keys(pages).length > 0
            ));
        });
    }
};