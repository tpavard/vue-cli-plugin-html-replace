[![npm version](https://badge.fury.io/js/vue-cli-plugin-html-replace.svg)](https://www.npmjs.com/package/vue-cli-plugin-html-replace)
[![GitHub license](https://img.shields.io/github/license/tpavard/vue-cli-plugin-html-replace.svg)](https://github.com/tpavard/vue-cli-plugin-html-replace/blob/master/LICENSE)

# Vue-cli Plugin HTML Replace

A simple plugin to replace contents within your HTML files generated by [Vue CLI](https://github.com/vuejs/vue-cli).

- [Getting started](#getting-started)
- [Configuration](#configuration)
    - [Basic usage](#basic-usage)
    - [Multi-page mode](#multi-page-mode)
- [API](#api)
    - [Global](#global)
    - [Pattern](#pattern)

## Getting started

:warning: Make sure you have [Vue CLI 3.x.x](https://github.com/vuejs/vue-cli) installed:

```
vue -V
```

Navigate to your vue app folder and add the cli plugin:

```
vue add html-replace
```
## Configuration

### Basic usage

This plugin can be configured by defining `htmlReplace` via the `pluginOptions` in your `vue.config.js`.

The `patterns` property must either be an object or an array of objects. Each pattern must contain both `match` and `replacement` options, otherwise it will be ignored.

```javascript
module.exports = {
    pluginOptions: {
        htmlReplace: {
            enable: (process.env.NODE_ENV === "production"),
            patterns: [
                {
                    match: "foo",
                    replacement: "bar",
                },
                {
                    match: /any/g,
                    replacement: "Globally replaced",
                },
                {
                    match: /<title>(.*)<\/title>/,
                    replacement: (match, $1) => `<title>"${$1}" has been replaced.</title>`,
                },
            ],
        },
    },
};
```

### Multi-page mode

In case you'd need to prevent patterns to be applied to some of your pages, you can specify either one of `excludes` or `includes` options. If both options are set, then `excludes` will be ignored.

Each entry must be named after the key given for the page(s) to be excluded/included. These properties are optional and will be ignored when you're not building your app in multi-page mode. Thus all the patterns would be applied to your HTML files.

```javascript
module.exports = {
    pages: {
        index: {
            entry: "src/App_1/main.js",
            filename: "app_1.html"
        },
        app_2: "src/App_2/main.js",
        app_3: "src/App_3/main.js",
    },
    pluginOptions: {
        htmlReplace: {
            patterns: [
                {
                    match: "foo",
                    replacement: "All of your pages will be affected",
                },
                {
                    match: /<title>.*<\/title>/,
                    replacement: "<title>This is the index page</title>",
                    includes: "index",
                },
                {
                    match: /<title>.*<\/title>/,
                    replacement: "<title>This is the second page</title>",
                    excludes: ["index" , "app_3"],
                },
            ],
        },
    },
};
```

## API

### Global

| Name | Type | Default | Description |
| :--: | :--: | :--: | --- |
| `enable` | `Boolean` | `true` | Enables/disables the plugin. |
| `patterns` | `Object`&nbsp;\|&nbsp;`Array<Object>` | `[]` | Defines some patterns and how to replace their corresponding matches. |

### Pattern

| Name | Type | Default | Description |
| :--: | :--: | :--: | --- |
| `match` | `String`&nbsp;\|&nbsp;`RegExp` | `null` | Defines the matches to be replaced. When missing, the pattern will be ignored. |
| `replacement` | `String`&nbsp;\|&nbsp;`Function:String` | `null` | Specifies the value with which to replace the matches. When missing, the pattern will be ignored. |
| `includes` | `String`&nbsp;\|&nbsp;`Array<String>` | `null` | Includes the pages for which the pattern will be applied to, when deploying your app in multi-page mode. Each entry must be named after the key of a page. |
| `excludes` | `String`&nbsp;\|&nbsp;`Array<String>` | `null` | Prevents the pattern to be applied to specific pages in multi-page mode. Each entry must be named after the key of a page. This option will be ignored if `includes` has already been set. |
