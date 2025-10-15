const path = require('path');
const glob = require('glob');

module.exports = {
  mode: 'production',
  entry: glob.sync('./tests-k6/{local,deploy}/**/*.js').reduce((acc, item) => {
    const entryName = path.relative('./tests-k6', item);
    acc[entryName] = './' + item.replace(/\\/g, '/');
    return acc;
  }, {}),
  output: {
    path: path.resolve(__dirname, 'dist-k6'),
    filename: '[name]',
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  target: 'web',
  externals: /^(k6|https:\/\/.+)/,
};