/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const path = require('path');
const rimraf = require('rimraf');
const globby = require('globby');
const esbuild = require('esbuild');
const reactServerPlugin = require('../esbuild/plugin');

const isProduction = process.env.NODE_ENV === 'production';
rimraf.sync(path.resolve(__dirname, '../build'));

esbuild
  .build({
    bundle: true,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    minify: isProduction,
    entryPoints: [path.resolve(__dirname, '../src/index.client.js')],
    outdir: path.resolve(__dirname, '../build'),
    entryNames: '[dir]/main',
    plugins: [reactServerPlugin({isServer: false})],
    platform: 'browser',
    watch: true,
    splitting: true,
    format: 'esm',
    sourcemap: true,
    loader: {
      '.js': 'jsx',
    },
    inject: [path.resolve(__dirname, './react-shim.js')],
  })
  .then(() => {
    console.log('Finished running esbuild');
  })
  .catch((err) => {
    console.log('Finished running esbuild with errors');
    process.exit(1);
  });

// webpack(
//   {
//     mode: isProduction ? 'production' : 'development',
//     devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
//     entry: [path.resolve(__dirname, '../src/index.client.js')],
//     output: {
//       path: path.resolve(__dirname, '../build'),
//       filename: 'main.js',
//     },
//     module: {
//       rules: [
//         {
//           test: /\.js$/,
//           use: 'babel-loader',
//           exclude: /node_modules/,
//         },
//       ],
//     },
//     plugins: [
//       new HtmlWebpackPlugin({
//         inject: true,
//         template: path.resolve(__dirname, '../public/index.html'),
//       }),
//       new ReactServerWebpackPlugin({isServer: false}),
//     ],
//   },
//   (err, stats) => {
//     if (err) {
//       console.error(err.stack || err);
//       if (err.details) {
//         console.error(err.details);
//       }
//       process.exit(1);
//       return;
//     }
//     const info = stats.toJson();
//     if (stats.hasErrors()) {
//       console.log('Finished running webpack with errors.');
//       info.errors.forEach((e) => console.error(e));
//       process.exit(1);
//     } else {
//       console.log('Finished running webpack.');
//     }
//   }
// );
