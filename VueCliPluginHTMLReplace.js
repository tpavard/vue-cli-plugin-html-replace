module.exports = class VueCliPluginHTMLReplace {
    constructor(patterns, pages) {
        this._index = 0;
        this._pages = pages;
        this._multipage = Array.isArray(pages);
        this._patterns = (Array.isArray(patterns) ? patterns : [patterns])
            .filter(this._filter)
            .map(this._validation);
    }

    // @private
    static _typeOf(val) {
        const type = Object.prototype.toString.call(val).substring(8).replace("]", "");
        return type === "Object" ? val.constructor.name : type;
    }

    // @private
    _filter(pattern) {
        return this._typeOf(pattern) === "Object" && /string|function/.test(typeof replacement)
            && (typeof pattern.match === "string" || this._typeOf(pattern.match) === "RegExp");
    }

    // @private
    _validation({
        match,
        replacement,
        includes,
        excludes,
    }) {
        if (this._multipage) {
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
            excludes,
        });
    }

    // @private
    _process(data, callback) {
        const filename = this._multipage ? this._pages[this._index++] : this.pages;
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
