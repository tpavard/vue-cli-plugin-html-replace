[![npm version](https://badge.fury.io/js/vue-cli-plugin-html-replace.svg)](https://www.npmjs.com/package/vue-cli-plugin-html-replace)
[![GitHub license](https://img.shields.io/github/license/tpavard/vue-cli-plugin-html-replace.svg)](https://github.com/tpavard/vue-cli-plugin-html-replace/blob/master/LICENSE)

# Vue-cli Plugin HTML Replace

A simple plugin to replace HTML contents within templates that are generated by [vue-cli](https://github.com/vuejs/vue-cli).

- [Getting started](#getting-started)
- [Configuration](#configuration)
    - [Basic usage](#basic-usage)
    - [Multi-page mode](#multi-page-mode)
- [API](#api)

## Getting started :

:warning: Make sure you have [vue-cli 3.x.x](https://github.com/vuejs/vue-cli) installed:

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

The `patterns` argument must either be an object or an array of objects. Each pattern must contain both `match` and `replacement` options otherwise it will be ignored.

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

In case you'd need to prevent patterns to be applied on some of your pages, you can specify either one of `excludes` or `includes` options. If both options are set, `excludes` will be ignored.

Each entries must be named after the key given for each page. These properties are optional and will be ignored if you're not building your app in multi-page mode, so all patterns would be applied to your templates.

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

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `enable` | `Boolean` | `true` | Enables/disables the plugin. |
| `patterns` | `Object`&nbsp;\|&nbsp;`Array<Object>` | `[]` | Defines patterns and how to replace the matches. |

### Pattern

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `match` | `String`&nbsp;\|&nbsp;`RegExp` | `null` | The matches to be replaced. |
| `replacement` | `String`&nbsp;\|&nbsp;`Function:String` | `null` | Value with which to replace the matches. |
| `includes` | `String`&nbsp;\|&nbsp;`Array<String>` | `null` | Includes the pages for which the pattern will be applied to when deploying your app in multi-page mode. |
| `excludes` | `String`&nbsp;\|&nbsp;`Array<String>` | `null` | Prevents the pattern to be applied to specific pages in multi-page mode. This option will be ignored if `includes` is already set. |
