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

`js/configs.js`, which sets the supported features for your software, and
`templates/partials/your-software.hbs`, a Handlebars.js template that mirrors your software's configuration

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
