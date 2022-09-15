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
- `minpatchver(minimumver, curver)` - `true` if `curver` is greater than or equal to `minimumver`, and both versions are the same patch version, e.g. `2.2`
  - `{{#if (minpatchver "2.4.3" form.serverVersion)}}`
- `minver(minimumver, curver)` - `true` if `curver` is greater than or equal to `minver`
  - `{{#if (minver "1.9.5" form.serverVersion)}}`
- `replace(string, whattoreplace, replacement)` - replaces whatToReplace with replacement
  - `replace(protocol, "TLSv", "TLS ")`
- `reverse(array)` - reverses the order of an array
  - `{{#each (reverse output.protocols)}`
- `sameminorver(version, otherVersion)` - returns `true` if `version` and `otherVersion` are of the same minor version, e.g. `2.2`
  - `{{#if (sameminorver "2.4.0" form.serverVersion)}}`
- `split(string, splitter)` - split a string into an array based on `splitter`
  - `{{#each (split somearray ":")}}`

### Template variables

Highlighted items from src/js/state.js for use in templates.  See src/js/state.js for more.

- `form.serverName` - Server Name
- `form.serverVersion` - Server Version
- `form.opensslVersion` - OpenSSL Version
- `form.config` - configuration name ([ "modern" | "intermediate" | "old" ])
- `form.hsts` - HTTP Strict Transport Security form checkbox (boolean true/false)
- `form.ocsp` - OCSP Stapling form checkbox (boolean true/false)

- `output.header` - description of rendered config (`# {{output.header}}`)
- `output.link` - URL to rendered config (`# {{{output.link}}}`)
- `output.protocols` - protocol list (e.g. zero or more of: "TLSv1" "TLSv1.1" "TLSv1.2" "TLSv1.3")
- `output.ciphers` - cipher list (`{{join output.ciphers ":"}}`)
- `output.cipherSuites` - cipher suites list
- `output.serverPreferredOrder` - enforce ServerPreference for ordering cipher list (boolean true/false)
- `output.hstsMaxAge` - max-age (seconds) for Strict-Transport-Security: max-age=... HTTP response header
- `output.permanentRedirect` - HTTP status code ([ 301 | 308 ]) to use for permanent redirect from http://site to https://site

- `output.latestVersion` - server latest version
- `output.usesOpenssl` - server uses openssl (boolean true/false)
- `output.usesDhe` - server might use Diffie-Hellmann key exchange (boolean true/false)
- `output.dhCommand` - command to generate Diffie-Hellman (DH) parameters
- `output.hasVersions` - server config has versions (boolean true/false)
- `output.supportsConfigs` - supports modern, intermediate, old configs (boolean true/false)
- `output.supportsHsts` - supports HTTP Strict Transport Security (HSTS) (boolean true/false)
- `output.supportsOcspStapling` - supports OCSP Stapling (boolean true/false)
- `output.tls13` - minimum server version supporting TLSv1.3

## Building

To publish to GitHub Pages, simply run:

```bash
$ npm run build
```

Then commit the newly built `docs/` files and push the commit to GitHub

## History

The SSL Config Generator was kept in [the `mozilla/server-side-tls` repository](https://github.com/mozilla/server-side-tls/tree/last-revision-before-move)
prior to mid 2019 at which point it was moved to this dedicated repository. It
was initially created [at the end of 2014](https://github.com/mozilla/server-side-tls/commit/b201a1191ba38e6f933cd02a4f425f683ffa9be4)
and started out supporting Apache HTTP, Nginx and HAProxy.

## Authors

* [April King](https://github.com/april)
* [Gene Wood](https://github.com/gene1wood)
* [Julien Vehent](https://github.com/jvehent)

## License

* Mozilla Public License Version 2.0
