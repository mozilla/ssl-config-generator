# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project doesn't adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- javascript: replace bootstrap with bootstrap.native for Copy button tooltip
- javascript: preserve bootstrap 4 CSS; remove bootstrap, popper, jquery
- javascript: update packages
- javascript: remove highlight.js
- javascript: remove Handlebars; convert .hbs templates to .js per server
- javascript: parse semantic versions, with exception for parsing openssl < 3.0
- haproxy: prefer ssl-min-ver with haproxy 2.2+
- apache,oraclehttp: explicit SSLProtocol list
- lighttpd: explicit protocol list for openssl 1.0.2
- lighttpd: simplify configs when handled by lighttpd defaults
- nginx: allow ssl\_session\_tickets for nginx ≥1.23.2
- nginx: wrap `server` in `http` context
- postfix: add `smtp_tls_*`

### Added

- initial intro text rather than defaulting to nginx config
- add eolBefore before versions; update current vers
- add warning to header for versions < eolBefore
- configure TLSv1.3 key exchange groups/curves (where supported)
- support OpenSSL 3.x: need SECLEVEL=0 to support Old config using TLSv1 and TLSv1.1
- haproxy: OpenSSL 3.x: ssl-security-level to support Old config with dhParamSize 1024

### Fixed

- caddy: fix syntax
- apache,oraclehttp: avoid double-percent-encode in rewrite
- stunnel: fix syntax; prefer sslVersionMin when available
- oraclehttp: OHS uses mod\_ossl, based on custom RSA implementation
- oraclehttp: use IANA naming for ciphers; set usesOpenssl to false
- jetty: TLSv1.3 IncludeCipherSuites
- tomcat: set tls13 ciphersuites when tls12 ciphers defined
- dovecot: always set ssl\_dh if usesDhe; revert an earlier change

## [5.7.1] - 2024-01-04

### Changed

- nginx: add `http2` directive
- use Webpack 5
- use CDN hosted fonts instead of local ones

### Added

- support for stunnel
- support for coturn

### Fixed

- proftpd TLSStaplingCache directive syntax

## [5.7] - 2023-05-15

### Changed

- `intermediate` configuration in order to append `TLS_DHE_RSA_WITH_CHACHA20_POLY1305_SHA256`
  to the bottom of the cipher list for `iana` and `openssl`. [mozilla/server-side-tls#285](https://github.com/mozilla/server-side-tls/issues/285)

## [5.6] - 2020-07-24

### Added

- support for caddy

### Fixed

- incorrect cipher ordering for the `intermediate` configuration for `go` and `iana`

## [5.5] - 2020-07-22

### Added

- `recommended_certificate_lifespan` of 90

### Changed

- `maximum_certificate_lifespan` from 730 to 366

## [5.4] - 2020-01-21

### Changed

- `intermediate` and `old` configuration's `certificate_curves` list from `null` to `prime256v1` and `secp384r1`
- `intermediate` configuration `rsa_key_size` from 2048 to `null`

## [5.3] - 2020-01-02

### Changed

- `intermediate` and `old` configuration's `tls_curves` list, replacing `secp256r1` with `prime256v1`

## [5.2] - 2019-08-20

### Added

- support for `go`

## [5.1] - 2019-07-16

This release has breaking changes due to the renaming of some JSON keys

### Added

- a new `ciphers` key to contain lists of ciphers for various clients
- support for `iana` cipherFormat, an alternative to `openssl`

### Changed

- the `openssl_ciphersuites` key to be called `ciphersuites`
- the `openssl_ciphers` key to be a child of the new `ciphers` key and rename it
  from `openssl_ciphers` to `openssl`

## [5.0] - 2019-06-28

### Added

- three `certificate_signatures` to the `intermediate` configuration : `ecdsa-with-SHA256`, `ecdsa-with-SHA384` and `ecdsa-with-SHA512`
- the `ecdsa` `certificate_type` to the `intermediate` configuration
- `Safari 9` to the list of `oldest_clients` for the `intermediate` configuration
- the new `maximum_certificate_lifespan` key
- the new `ocsp_staple` key
- the new `server_preferred_order` key

### Changed

- the `ciphersuites` key, renaming it to `openssl_ciphers`
- the `hsts_min_age` value for all configurations from 15768000 to 63072000
- the `tls_curves` for the `intermediate` and `modern` configurations, removing `secp521r1` and
  adding `X25519` to the top
- the `openssl_ciphersuites` key from containing a colon-delimited string to
  containing a list
- the `tls_versions` for the `intermediate` configuration, removing `TLSv1` and `TLSv1.1` and adding `TLSv1.3`
- the `tls_versions` for the `modern` configuration from `TLSv1.2` to `TLSv1.3`
- the `tls_versions` for the `old` configuration, removing `SSLv3` and adding `TLSv1.3`
- all of the `oldest_clients` in the `modern` configuration
- and added to the list of `oldest_clients` in the `old` configuration
- the entire order and list of `openssl_ciphers` and `openssl_ciphersuites` for all configurations. This was
  a very significant change.

### Removed

- `sha256WithRSAEncryption` from the `modern` `certificate_signatures` list
- `secp521r1` from the `modern` configuration's `certificate_curves` list

## [4.0] - 2016-02-13

Initial version

[unreleased]: https://github.com/mozilla/ssl-config-generator/compare/c21325296b09df39ee34782ed8c1fa6adfcc8af7...HEAD
[5.7]: https://github.com/mozilla/ssl-config-generator/compare/9e999856e19e604a06b06cfbc2e949d184c5f4d3...c21325296b09df39ee34782ed8c1fa6adfcc8af7
[5.6]: https://github.com/mozilla/ssl-config-generator/compare/aa0718d93437a17258e92313cda708d1b209abd4...9e999856e19e604a06b06cfbc2e949d184c5f4d3
[5.5]: https://github.com/mozilla/ssl-config-generator/compare/c48ecf5dcf43d3ed0f1f0e6a85ca1ae336984f4c...aa0718d93437a17258e92313cda708d1b209abd4
[5.4]: https://github.com/mozilla/ssl-config-generator/compare/477459e9ebeb4ccf7e68aaad6c1c5f7c7a44174b...c48ecf5dcf43d3ed0f1f0e6a85ca1ae336984f4c
[5.3]: https://github.com/mozilla/ssl-config-generator/compare/e3e697518ce58fd0a39d7ff7fd626a0af7abfd54...477459e9ebeb4ccf7e68aaad6c1c5f7c7a44174b
[5.2]: https://github.com/mozilla/ssl-config-generator/compare/8e726dbbad1aec5c95e76d1f90c1b0836b9058f7...e3e697518ce58fd0a39d7ff7fd626a0af7abfd54
[5.1]: https://github.com/mozilla/ssl-config-generator/compare/2d6ded646926e4b9ca050ba28912c144aa49df2d...8e726dbbad1aec5c95e76d1f90c1b0836b9058f7
[5.0]: https://github.com/mozilla/ssl-config-generator/compare/03274e139fa3af3164a920b93f681e3455785516...2d6ded646926e4b9ca050ba28912c144aa49df2d
[4.0]: https://github.com/mozilla/server-side-tls/releases/tag/v4.0
