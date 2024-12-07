const constants = require('../src/js/constants.js');
const configs = require('../src/js/configs.js');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const exec = require('child_process').spawnSync;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');
const production = process.env.NODE_ENV === 'production';

// function that returns the github short revision
const revision = () => {
  return exec('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'ascii' }).stdout.trim();
}

// the many plugins used
const plugins = [
  new HtmlWebpackPlugin({
    constants,
    configs,
    csp: production ? constants.contentSecurityPolicy : constants.localContentSecurityPolicy,
    date: new Date().toISOString().substr(0, 10),
    production,
    revision: revision(),

    title: 'Mozilla SSL Configuration Generator',
    template: 'src/templates/index.ejs',
    favicon: 'src/images/favicon.png'
  }),
  new CopyWebpackPlugin({
    patterns: [
        {from: 'config/CNAME'},
        {from: 'src/static'},
        {from: 'src/js/analytics.js'}
    ]
  }),
  new MiniCssExtractPlugin({
    filename: '[contenthash].index.css',
  })
];

// either we analyze or watch
if (process.env.NODE_ENV === 'analyze') {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  plugins.push(
    new BundleAnalyzerPlugin({})
  );
} else if (process.env.NODE_ENV === 'development') {
  const BrowserSyncWebpackPlugin = require('browser-sync-v3-webpack-plugin');
  plugins.push(
    new BrowserSyncWebpackPlugin({
      host: 'localhost',
      port: 5500,
      server: {
        baseDir: 'build'
      }
    })
  );
}

module.exports = {
  output: {
    crossOriginLoading: 'anonymous',
    library: 'SSLConfigGenerator',
    libraryTarget: 'var',
    path: production ? path.resolve(__dirname, '..', 'docs') : path.resolve(__dirname, '..', 'build'),
    filename: '[contenthash].[name]'
  },
  stats: {
    errorDetails: true,
    children: true
  },
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify")
    }
  },
  entry: {
    'index.js': ['regenerator-runtime/runtime', path.resolve(__dirname, '..', 'src', 'js', 'index.js')]
  },
  mode: production ? 'production' : 'development',
  devtool: production ? undefined : 'source-map',
  module: {
    rules: [
      {
        test: /\.ejs$/,
        use: ['ejs-easy-loader'],
      },
      {
        test: /\.hbs$/,
        use: {
          loader: 'handlebars-loader',
          options: {
            'helperDirs': [
              path.resolve(__dirname, '..', 'src', 'js', 'helpers')
            ]
          }
        }
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, '..', 'src'),
        use: [{
          loader: 'babel-loader',
          options: {
            babelrc: false,
            plugins: [
              '@babel/plugin-transform-object-rest-spread'
            ],
            presets: [
              ['@babel/preset-env', {
                'targets': {
                  'ie': 11
                },
                'shippedProposals': true
              }]
            ]
          }
        }]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        //include: path.resolve(__dirname, '..', 'src'),
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader', // Run post css actions
            options: {
              postcssOptions: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('autoprefixer')
                  ];
                }
              }
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: plugins,
};
