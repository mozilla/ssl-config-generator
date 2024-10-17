![ssl-config.mozilla.org](https://github.com/user-attachments/assets/b8c79382-a3e4-4470-88c2-3cb74bd1ba0a)

# Mozilla SSL Configuration Generator

The Mozilla SSL Configuration Generator is a tool which builds configuration files to help you follow the Mozilla [Server Side TLS](https://wiki.mozilla.org/Security/Server_Side_TLS) recommendations.

## JSON guidelines

Each revision of the Mozilla Server Side TLS guidelines is published in a machine-readable format from this repository as a [JSON specification](/src/static/guidelines/) that can be found at [`/src/static/guidelines/`](/src/static/guidelines/) 📟

## Changelog

The [Changelog](/src/static/guidelines/CHANGELOG.md) that tracks the history of changes to Mozilla's recommendations is available along the versioned JSON guideline files at [`/src/static/guidelines/CHANGELOG.md`](/src/static/guidelines/CHANGELOG.md) 🔬

## Contributing

The project is written in JavaScript, uses Webpack for development and production builds, and most of the templating logic to turn the recommendations into the various server configs is done in Handlebars.

We keep a list of things that would make a great contribution tagged with [*help wanted*](https://github.com/mozilla/ssl-config-generator/labels/help%20wanted), [*good first issue*](https://github.com/mozilla/ssl-config-generator/labels/good%20first%20issue), and [*new software support*](https://github.com/mozilla/ssl-config-generator/labels/new%20software%20support) labels.

If you'd like to see your favorite tool added or compatibility expanded, we're always happy to mentor a PR or receive a bug report to make the configs better for everyone.

Even when you don't feel comfortable contributing actual templates, posting some nice verified configs or compatibility hints is equally welcome! 💝

Get involved by sharing your ideas or joining the conversation in the [Discussions](https://github.com/mozilla/ssl-config-generator/discussions) tab. 🗨️

This repository is governed by Mozilla's [Community Participation Guidelines](/CODE_OF_CONDUCT.md)
so please make yourself familiar with it to get the idea of what level of developer etiquette and standards are expected across Mozilla projects.

## Installation

NodeJS and npm are required to install and run the project locally:

```bash
$ npm install
```

Node v20 is recommended and we use that in production, but the codebase is compatible with many older and newer versions too.

## Development

Once you've installed, you can simply run:

```bash
$ npm start   # or: npm run watch
```

This starts a local webserver that will automatically reload your changes.

## Adding new software

There are two places that need to be updated in order to add support for a new piece of software:

* `src/js/configs.js`, which sets the supported features for your software, and
* `src/templates/partials/your-software.hbs`, a Handlebars.js template that mirrors your software's configuration

### Creating templates

All of the templates are written in [Handlebars.js](https://handlebarsjs.com/), and so therefore support all of its standard features. This includes `if`/`else`/`unless` conditionals and `each` loops, for example. In addition, the configuration generator supports the following helpers:

- `eq(item value)` - `true` if `item` equals `value`
- `includes(item stringOrArray)` - `true` if `stringOrArray` contains `item`
- `join(array joiner)` - joins an array into a string based on `joiner`
  - `{{{join output.ciphers ":"}}}` (NOTE: the "triple-stash" `{{{` brackets are to avoid [HTML escaping](https://handlebarsjs.com/guide/#html-escaping))
- `last(array)` - returns the last item in the array
- `minpatchver(minimum current)` - only `true` if `current` version is greater than or equal to `minimum`, and both are of the same minor version, e.g. `2.4.x` (won't match any higher `2.5.x` or `3.x`)
  - `{{#if (minpatchver "2.4.3" form.serverVersion)}}`
- `minver(minimum current)` - `true` if `current` is greater than or equal to `minimum`
  - `{{#if (minver "1.9.5" form.serverVersion)}}`
- `replace(string old new)` - returns `string` with occurences of `old` substring replaced with `new` when found
  - `{{replace protocol "TLSv" "TLS "}}`
- `reverse(array)` - reverses the order of an array
  - `{{#each (reverse output.protocols)}}`
- `sameminorver(version another)` - returns `true` if `version` and `another` are of the same minor version, e.g. `2.4`
  - `{{#if (sameminorver "2.4.0" form.serverVersion)}}`
- `split(string splitter)` - splits a string into an array based on `splitter`
  - `{{#each (split stringdata ":")}}`

### Template variables

Highlighted items from src/js/state.js for use in templates.  See src/js/state.js for more.

- `form.serverName` - display name of the server
- `form.serverVersion` - desired server version
- `form.opensslVersion` - desired OpenSSL version
- `form.config` - configuration name ([ "modern" | "intermediate" | "old" ])
- `form.hsts` - HTTP Strict Transport Security form checkbox (boolean true/false)
- `form.ocsp` - OCSP Stapling form checkbox (boolean true/false)

- `output.header` - description of rendered config (`# {{output.header}}`)
- `output.link` - URL to rendered config (`# {{{output.link}}}`)
- `output.protocols` - protocol list (e.g. zero or more of: "TLSv1" "TLSv1.1" "TLSv1.2" "TLSv1.3")
- `output.ciphers` - TLSv1.2- cipher list for given config and server support (`{{join output.ciphers ":"}}`)
- `output.cipherSuites` - TLSv1.3+ cipher suites list
- `output.serverPreferredOrder` - enforce ServerPreference for ordering cipher list (boolean true/false)
- `output.hstsMaxAge` - max-age (seconds) for Strict-Transport-Security: max-age=... HTTP response header
- `output.latestVersion` - server latest version
- `output.usesOpenssl` - server uses openssl (boolean true/false)
- `output.usesDhe` - config includes Diffie-Hellmann key exchange (boolean true/false)
- `output.dhCommand` - command to generate Diffie-Hellman (DH) parameters
- `output.hasVersions` - config supports several server versions (boolean true/false)
- `output.supportsConfigs` - _(unused)_ server can support different recommendations (boolean true/false)
- `output.supportsHsts` - supports HTTP Strict Transport Security (HSTS) (boolean true/false)
- `output.supportsOcspStapling` - supports OCSP Stapling (boolean true/false)
- `output.tls13` - minimum server version supporting TLSv1.3

## Building

Production builds have different CSP headers, included scripts, and version info added to the output, so to verify that locally you can run:

```bash
$ npm run build
```

to inspect the exact production-level artifacts as used in deployment.

Automation publishes the production site via GitHub Pages, so once your PR merges the changes deploy within a minute or two.

## History

The SSL Config Generator was originally part of [`mozilla/server-side-tls@v5.0`](https://github.com/mozilla/server-side-tls/tree/12fda41)
prior to mid-2019 at which point it was moved to this dedicated repository. It
was initially created [at the end of 2014](https://github.com/mozilla/server-side-tls/commit/b201a11)
and started out supporting Apache HTTP, Nginx and HAProxy.

## Authors

* [April King](https://github.com/april)
* [Gene Wood](https://github.com/gene1wood)
* [Julien Vehent](https://github.com/jvehent)

## License

This software is licensed under the [MPL version 2.0](https://www.mozilla.org/MPL/). For more
information, read this repository's [LICENSE](LICENSE).
