const CopyWebpackPlugin = require('copy-webpack-plugin');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const path = require('path');
const { port } = require('minimist')(process.argv.slice(2));
const webpack = require('webpack');

const { NODE_ENV } = process.env;
let devtool = 'source-map';
const entry = {
    app: []
};
const plugins = [
    new HtmlWebpackPlugin({
        template: 'index.html',
        chunksSortMode: (a, b) => {
            const order = ['manifest', 'vendor', 'app'];
            const nameA = a.names[0];
            const nameB = b.names[0];

            return order.indexOf(nameA) - order.indexOf(nameB);
        }
    })
];

if (NODE_ENV === 'development') {
    entry.app.push(`webpack-dev-server/client?http://localhost:${port}`);
    plugins.push(
        new OpenBrowserPlugin({
            url: `http://localhost:${port}`,
            ignoreErrors: true
        })
    );
    devtool = 'cheap-source-map';
} else {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );
}

entry.app.push(
    'babel-polyfill',
    './src/index'
);

plugins.push(
    new CopyWebpackPlugin([])
);

module.exports = {
    entry,
    plugins,
    devtool,
    output: {
        path: 'dist/',
        filename: 'js/[name].js',
        library: 'app',
        libraryTarget: 'var',
        chunkFilename: 'js/[name].chunk.js'
    },
    module: {
        loaders: [{
            test: /.js?$/,
            loader: 'babel',
            exclude: /node_modules/
        }, {
            test: /.js?$/,
            loaders: [
                `string-replace?search=require(config.parser)&replace=require("../../src/lint/parser")`, // eslint itself
                `string-replace?search=require(rules[ruleId])&replace=void 0`, // eslint itself
            ]
        }, {
            test: /.json?$/,
            loader: 'json'
        }]
    }
};
