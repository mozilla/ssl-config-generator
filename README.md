# Mozilla SSL Configuration Generator

The Mozilla SSL Configuration Generator is a tool which builds configuration files to help you follow the Mozilla [Server Side TLS](https://wiki.mozilla.org/Security/Server_Side_TLS) configuration guidelines.

This tool is built and deployed to https://ssl-config.mozilla.org/

To be notified when the Mozilla [Server Side TLS](https://wiki.mozilla.org/Security/Server_Side_TLS) configuration guidelines are updated (infrequent), use github notifications to subscribe to Releases on this repository (mozilla/ssl-config-generator).

To modify and build this tool locally, please see Installation and Development sections below.

## JSON guidelines

Each revision of the Mozilla Server Side TLS guidelines is published in a machine-readable format from this repository as a [JSON specification](/src/static/guidelines/) that can be found at [`/src/static/guidelines/`](/src/static/guidelines/) 📟

## Changelog

The [Changelog](/src/static/guidelines/CHANGELOG.md) that tracks the history of changes to Mozilla's configuration guidelines is available along the versioned JSON guideline files at [`/src/static/guidelines/CHANGELOG.md`](/src/static/guidelines/CHANGELOG.md) 🔬

## Contributing

The project is written in JavaScript, and uses Webpack for development and production builds.

We keep a list of things that would make a great contribution tagged with [*help wanted*](https://github.com/mozilla/ssl-config-generator/labels/help%20wanted), [*good first issue*](https://github.com/mozilla/ssl-config-generator/labels/good%20first%20issue), and [*new software support*](https://github.com/mozilla/ssl-config-generator/labels/new%20software%20support) labels.

If you'd like to see your favorite tool added or compatibility expanded, we're always happy to mentor a PR or receive a bug report to make the configs better for everyone.

Even when you don't feel comfortable contributing actual templates, posting some nice verified configs or compatibility hints is equally welcome! 💝

Get involved by sharing your ideas or joining the conversation in the [Discussions](https://github.com/mozilla/ssl-config-generator/discussions) tab. 🗨️

This repository is governed by Mozilla's [Community Participation Guidelines](/CODE_OF_CONDUCT.md)
so please make yourself familiar with it to get the idea of what level of developer etiquette and standards are expected across Mozilla projects.

## Installation

NodeJS and npm are required to install and run the project locally:
Node v22 is recommended and we use that in production, but the codebase may be compatible with other versions too.

```bash
$ npm install
```

## Development

Once you've installed, you can simply run:

```bash
$ npm start   # or: npm run watch
```

This starts a local webserver that will automatically reload your changes.

Alternatively, you can use [Docker](https://www.docker.com/) to run the local webserver to avoid
cluttering your local environment with npm dependencies. You first need to build the docker:

```bash
docker build -t moz-ssl-config-gen:latest .
```

You can then run the webserver:

```bash
docker run -p 3001:3001 -p 5500:5500 moz-ssl-config-gen:latest
```

## Adding new software

There are two places that need to be updated in order to add support for a new piece of software:

* `src/js/configs.js`, which sets the supported features for your software, and
* `src/js/helpers/your-software.js`, javascript module which outputs your software's configuration

### Creating templates

All of the templates are written in javascript.  The configuration generator supports the following additional helpers:

- `minpatchver(minimum_ver, cur_ver)` - `true` if `cur_ver` is greater than or equal to `minimum_ver`, AND both versions are the same major/minor version, e.g. `2.4`
  - `minpatchver("2.4.3", form.serverVersion)`
- `minver(minimum_ver, cur_ver)` - `true` if `cur_ver` is greater than or equal to `minimum_ver`
  - `minver("1.9.5", form.serverVersion)`

### Template variables

Highlighted items from src/js/state.js for use in templates.  See src/js/state.js for more.

- `form.serverName` - display name of the server
- `form.serverVersion` - requested server version
- `form.opensslVersion` - requested OpenSSL version
- `form.config` - configuration name ([ "modern" | "intermediate" | "old" ])
- `form.hsts` - HTTP Strict Transport Security form checkbox (boolean true/false)
- `form.ocsp` - OCSP Stapling form checkbox (boolean true/false)

- `output.header` - description of rendered config
- `output.link` - URL to rendered config
- `output.protocols` - protocol list (e.g. zero or more of: "TLSv1" "TLSv1.1" "TLSv1.2" "TLSv1.3")
- `output.ciphers` - TLSv1.2 (and older) cipher list
- `output.cipherSuites` - TLSv1.3+ cipher suites list
- `output.serverPreferredOrder` - enforce ServerPreference for ordering cipher list (boolean true/false)
- `output.hstsMaxAge` - max-age (seconds) for Strict-Transport-Security: max-age=... HTTP response header
- `output.hstsRedirectCode` - HTTP status code to use for HSTS redirect from http:// to https://
- `output.latestVersion` - server latest version
- `output.usesOpenssl` - server uses openssl (boolean true/false)
- `output.usesDhe` - server might use (<= TLSv1.2 kDHE) Diffie-Hellmann key exchange (boolean true/false)
- `output.dhCommand` - command to generate Diffie-Hellman (DH) parameters
- `output.hasVersions` - config supports several server versions (boolean true/false)
- `output.supportsHsts` - supports HTTP Strict Transport Security (HSTS) (boolean true/false)
- `output.supportsOcspStapling` - server version supporting OCSP Stapling in config
- `output.tls13` - server version supporting TLSv1.3
- `output.tlsCurves` - groups/curves list

## Building

Production builds have different CSP headers, included scripts, and version info added to the output, so to verify that locally you can inspect the exact production-level artifacts as used in deployment after running:


```bash
$ npm run build
```

However, this step is not necessary for production deployment.
Automation publishes the production site via GitHub Pages, so once your PR merges the changes deploy within a minute or two.
GitHub Pages are published upon commit to the master branch
via .github/workflows/deploy-to-production.yml

## History

The SSL Config Generator was originally part of [`mozilla/server-side-tls@v5.0`](https://github.com/mozilla/server-side-tls/tree/12fda41) ([last-revision-before-move](https://github.com/mozilla/server-side-tls/tree/last-revision-before-move))
prior to mid-2019 at which point it was moved to this dedicated repository. It
was initially created [at the end of 2014](https://github.com/mozilla/server-side-tls/commit/b201a11)
and [started out supporting Apache HTTP, Nginx and HAProxy](https://web.archive.org/web/20141026012016/https://mozilla.github.io/server-side-tls/ssl-config-generator/).

## Authors

* [April King](https://github.com/april)
* [Gene Wood](https://github.com/gene1wood)
* [Julien Vehent](https://github.com/jvehent)

## License

This software is licensed under the [MPL version 2.0](https://www.mozilla.org/MPL/). For more
information, read this repository's [LICENSE](LICENSE).
