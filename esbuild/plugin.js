/** @license React vundefined
 * react-server-dom-webpack-plugin.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-check

'use strict';

'use strict';

const path = require('path');
const url = require('url');
const {promises: fs} = require('fs');
const esbuild = require('esbuild');
const globby = require('globby');

const PLUGIN_NAME = 'React Server Plugin';

/** @param {esbuild.Metafile} metafile */
function getClientFiles(metafile) {
  const clientFiles = {};

  for (const [chunk, data] of Object.entries(metafile.outputs)) {
    const chunkName = path.parse(chunk).name;

    // clientFiles[data.entryPoint] = {chunkName, file: chunk};
    // for (const [input] of Object.entries(data.inputs)) {
    //   if (input.endsWith('.client.js')) {
    //     clientFiles[input] = {chunkName, file: chunk};
    //   }
    // }

    if (!data.entryPoint) continue;

    if (data.entryPoint.endsWith('.client.js')) {
      clientFiles[data.entryPoint] = {chunkName, file: chunk};
    }
  }

  return clientFiles;
}

/** @type {(options: any) => esbuild.Plugin} */
const reactServerPlugin = (options) => {
  if (!options || typeof options.isServer !== 'boolean') {
    throw new Error(
      PLUGIN_NAME + ': You must specify the isServer option as a boolean.'
    );
  }

  if (options.isServer) {
    throw new Error('TODO: Implement the server compiler.');
  }

  return {
    name: 'react-server-dom-plugin',
    setup(build) {
      build.initialOptions.metafile = true;

      build.onResolve({filter: /^__routes__$/}, (args) => {
        return {
          namespace: 'route-map',
          path: args.path,
        };
      });

      build.onLoad({filter: /.*/, namespace: 'route-map'}, async (args) => {
        const files = globby.sync('src/**/*.client.js', {});

        return {
          contents: `
          export default {
            ${files.map(
              (file) => `
            ${JSON.stringify(`./${file}`)}: () => import(${JSON.stringify(
                `./${file}`
              )})
            `
            )}
          }
          `,
          resolveDir: process.cwd(),
        };
      });

      build.onEnd(async (result) => {
        const manifestFilename = 'react-client-manifest.json';
        const manifestContent = {};
        const outPath = path.join(
          build.initialOptions.outdir,
          manifestFilename
        );
        const {metafile} = result;
        const clientFiles = getClientFiles(metafile);

        for (const [file, chunk] of Object.entries(clientFiles)) {
          const moduleExports = {};
          const filePath = url.pathToFileURL(file);

          ['', '*', ...metafile.outputs[chunk.file].exports].forEach((name) => {
            moduleExports[name] = {
              id: `./${file}`,
              chunks: [chunk.chunkName],
              name,
            };
          });

          manifestContent[filePath] = moduleExports;
        }

        await fs.writeFile(
          outPath,
          JSON.stringify(manifestContent, null, 2),
          'utf-8'
        );
      });
    },
  };
};

module.exports = reactServerPlugin;
