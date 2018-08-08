class VueCliPluginHtmlReplace {
    constructor({
        patterns = [],
        enable = true,
    } = {}, pages = []) {
        if (enable !== false) {
            this.index = 0;
            this.pages = pages;
            this.multipage = (Array.isArray(pages) && pages.length > 0);
            this.patterns = Array.isArray(patterns) ? patterns : [patterns];
            this.patterns.map(pattern => this.patternChecker(pattern));
        }
    }

    patternChecker(pttrn) {
        const {
            pattern = null,
            replacement = null,
            includes = null,
            excludes = null,
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
            excludes: (Array.isArray(excludes) || !excludes) ? excludes : [excludes],
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
        const filename = this.multipage ? this.pages[this.index++] : this.pages;
        const isCurrent = Object.keys(data.assets.chunks).includes(filename);

        this.patterns.forEach(options => {
            const {
                pattern,
                replacement,
                includes,
                excludes,
            } = options;
            
            if (
                isCurrent && (!this.multipage ||
                (!includes && !excludes) ||
                (this.multipage && (
                    (includes && includes.includes(filename)) ||
                    (excludes && !excludes.includes(filename))
                )))
            ) {
                data.html = data.html.replace(pattern, replacement);
            }
        });
        callback(null, data);
    }
}

module.exports = (api, {
        pluginOptions = {},
        pages = {},
    } = {}) => {

    const {
        htmlReplace = {},
    } = pluginOptions;

    if (Object.keys(htmlReplace).length > 0) {
        const keys = Object.keys(pages);

        api.configureWebpack(config => {
            config
                .plugins
                .push(new VueCliPluginHtmlReplace(
                    htmlReplace,
                    keys.length > 0 ? keys : "app"));
        });
    }
};