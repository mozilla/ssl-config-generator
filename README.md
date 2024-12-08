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
* `src/js/helpers/your-software.js`, javascript module which outputs your software's configuration

### Creating templates

All of the templates are written in javascript.  The configuration generator supports the following additional helpers:

- `minpatchver(minimum_ver, cur_ver)` - `true` if `cur_ver` is greater than or equal to `minimum_ver`, AND both versions are the same minor version, e.g. `2.4`
  - `minpatchver("2.4.3", form.serverVersion)`
- `minver(minimum_ver, cur_ver)` - `true` if `cur_ver` is greater than or equal to `minimum_ver`
  - `minver("1.9.5", form.serverVersion)`
- `sameminorver(version, otherVersion)` - returns `true` if `version` and `otherVersion` are of the same minor version, e.g. `2.4`
  - `sameminorver("2.4.0", form.serverVersion)`

### Template variables

Highlighted items from src/js/state.js for use in templates.  See src/js/state.js for more.

- `form.serverName` - Server Name
- `form.serverVersion` - Server Version
- `form.opensslVersion` - OpenSSL Version
- `form.config` - configuration name ([ "modern" | "intermediate" | "old" ])
- `form.hsts` - HTTP Strict Transport Security form checkbox (boolean true/false)
- `form.ocsp` - OCSP Stapling form checkbox (boolean true/false)

- `output.header` - description of rendered config
- `output.link` - URL to rendered config
- `output.protocols` - protocol list (e.g. zero or more of: "TLSv1" "TLSv1.1" "TLSv1.2" "TLSv1.3")
- `output.ciphers` - cipher list
- `output.cipherSuites` - cipher suites list
- `output.serverPreferredOrder` - enforce ServerPreference for ordering cipher list (boolean true/false)
- `output.hstsMaxAge` - max-age (seconds) for Strict-Transport-Security: max-age=... HTTP response header
- `output.hstsRedirectCode` - HTTP status code to use for HSTS redirect from http:// to https://
- `output.latestVersion` - server latest version
- `output.usesOpenssl` - server uses openssl (boolean true/false)
- `output.usesDhe` - server might use (<= TLSv1.2 kDHE) Diffie-Hellmann key exchange (boolean true/false)
- `output.dhCommand` - command to generate Diffie-Hellman (DH) parameters
- `output.hasVersions` - server config has versions (boolean true/false)
- `output.supportsConfigs` - supports modern, intermediate, old configs (boolean true/false)
- `output.supportsHsts` - supports HTTP Strict Transport Security (HSTS) (boolean true/false)
- `output.supportsOcspStapling` - server version supporting OCSP Stapling in config
- `output.tls13` - server version supporting TLSv1.3
- `output.tlsCurves` - groups/curves list

## Building

Generate production files in `docs/` files by running

```bash
$ npm run build
```

However, doing so is not necessary for production deployment.
GitHub Pages are published upon commit to the master branch
via .github/workflows/deploy-to-production.yml

## Changelog

The Changelog that captures the history of changes to Mozilla's recommendations
as represented in the JSON guideline files can be found at [`/src/static/guidelines/CHANGELOG.md`](/src/static/guidelines/CHANGELOG.md)

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
