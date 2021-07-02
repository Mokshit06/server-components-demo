const path = require('path');
const rimraf = require('rimraf');
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
