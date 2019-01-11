module.exports = class VueCliPluginHTMLReplace {
    constructor(patterns, pages) {
        this._index = 0;
        this._multipage = Array.isArray(pages);
        this._pages = this._multipage ? pages : [pages];
        this._patterns = (Array.isArray(patterns) ? patterns : [patterns])
            .filter(pattern => pattern.constructor.name === "Object")
            .map(this._validation);
    }

    // @private
    _validation({
        match,
        replacement,
        includes,
        excludes,
    }) {
        if (typeof match !== "string" && match.constructor.name !== "RegExp") {
            throw new TypeError(`Invalid 'match' option provided, 'String' or 'RegExp' expected.`);
        }

        if (this._multipage && (includes || excludes)) {
            if (includes) {
                includes = (Array.isArray(includes) ? includes : [includes])
                    .filter(val => typeof val === "string");
                excludes = null;
            } else if (excludes) {
                excludes = (Array.isArray(excludes) ? excludes : [excludes])
                    .filter(val => typeof val === "string");
                includes = null;
            }
        } else {
            includes = null;
            excludes = null;
        }

        return ({
            match,
            replacement: (/string|function/.test(typeof replacement) ? replacement : ""),
            includes,
            excludes,
        });
    }

    // @private
    _process(data, callback) {
        const filename = this._pages[this._multipage ? this._index++ : this._index];
        const isCurrent = Object.keys(data.assets.chunks).includes(filename);

        this._patterns.forEach(({
            match,
            replacement,
            includes,
            excludes,
        }) => {
            if (
                isCurrent && (!this._multipage ||
                (!includes && !excludes) ||
                (this._multipage && (
                    (includes && includes.includes(filename)) ||
                    (excludes && !excludes.includes(filename))
                )))
            ) {
                data.html = data.html.replace(match, replacement);
            }
        });
        callback(null, data);
    }

    apply(compiler) {
        if (this._patterns) {
            compiler
                .hooks
                .compilation
                .tap("VueCliPluginHTMLReplace",
                    compilation => compilation.hooks.htmlWebpackPluginAfterHtmlProcessing
                        .tapAsync("vue-cli-plugin-html-replace", (data, callback) => this._process(data, callback))
                );
        }
    }
}
