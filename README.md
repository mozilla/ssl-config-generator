# Mozilla SSL Configuration Generator

The Mozilla SSL Configuration Generator is a tool which builds configuration files to help you follow the Mozilla [Server Side TLS](https://wiki.mozilla.org/Security/Server_Side_TLS) configuration guidelines.

## Installation

```bash
$ npm install
```

## Development

Once you've installed, you can simply run:

```bash
$ npm run watch
```

This starts a local webserver that will automatically reload your changes.

## Adding new software

There are two places that need to be updated in order to add support for a new piece of software:

* `src/js/configs.js`, which sets the supported features for your software, and
* `src/templates/partials/your-software.hbs`, a Handlebars.js template that mirrors your software's configuration

### Creating templates

All of the templates are written in [Handlebars.js](https://handlebarsjs.com/), and so therefore support all of its standard features. This includes `if`/`else`/`unless` conditionals and `each` loops, for example. In addition, the configuration generator supports the following helpers:

- `eq(item, value)` - `true` if `item` equals `value`
- `includes(item, stringOrArray)` - `true` if `stringOrArray` contains `item`
- `join(array, joiner)` - split a array into a string based on `joiner`
  - `{{{join output.ciphers ":"}}}`
- `last(array)` - returns the last item in the array
- `minpatchver(minimumver, curver)` - `true` if `curver` is greater `minimumver` and both versions are the same patch version, e.g. `2.2`
  - `{{#if (minpatchver "2.4.3" form.serverVersion)}}`
- `minver(minimumver, curver)` - `true` if `curver` is greater than `minver`
  - `{{#if (minver "1.9.5" form.serverVersion)}}`
- `replace(string, whattoreplace, replacement)` - replaces whatToReplace with replacement
  - `replace(protocol, "TLSv", "TLS ")`
- `reverse(array)` - reverses the order of an array
  - `{{#each (reverse output.protocols)}`
- `sameminorver(version, otherVersion)` - returns `true` if `version` and `otherVersion` are of the same minor version, e.g. `2.2`
  - `{{#if (sameminorver "2.4.0" form.serverVersion)}}`
- `split(string, splitter)` - split a string into an array based on `splitter`
  - `{{#each (split somearray ":")}}`

## Building

To publish to GitHub Pages, simply run:

```bash
$ npm run build
```

## Authors

* [April King](https://github.com/april)
* [Gene Wood](https://github.com/gene1wood)
* [Julien Vehent](https://github.com/jvehent)

## License

* Mozilla Public License Version 2.0
