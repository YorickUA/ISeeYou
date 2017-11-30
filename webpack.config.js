const webpack = require('webpack');
const path = require('path');

const buildPath = path.join(__dirname, './app/build');
const entry = path.join(__dirname, './app/js/index.js');

var config = {
            entry: entry,

            output: {
                path: buildPath,
                filename: 'bundle.js',
            },
            devtool: 'source-map',

            devServer: {
                inline: true,
                port: 8080
            },

            module: {
                loaders: [
                    {
                        test: /\.jsx?$/,
                        exclude: /node_modules/,
                        loader: 'babel-loader',

                        query: {
                            presets: ['es2015', 'react']
                        }
                    },
                    { test: /\.css$/, loader: "style-loader!css-loader" }
                ]
            }
        };
module.exports = config;