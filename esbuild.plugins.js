// Stream fall back required for issue currently coming from Babel, see issue 8256

/** @type {import('@angular/build').Plugin[]} */
module.exports = [
  {
    name: 'stream-browserify-polyfill',
    setup(build) {
      build.onResolve({ filter: /^stream$/ }, () => ({
        path: require.resolve('stream-browserify'),
      }));
    },
  },
];
