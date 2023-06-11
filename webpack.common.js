const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const resolvePath = dir => path.join(__dirname, dir);

module.exports = {
  mode: 'production', // or 'development' if needed
  entry: {
    'gacounts.singlepage': resolvePath('src/gacounts.singlepage.js'),
    'researchfarm.publicform': resolvePath('src/researchfarm.publicform.js')
  },
  plugins: [new CleanWebpackPlugin(), new VueLoaderPlugin()],
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '~': resolvePath('src')
    }
  },
  module: {
    rules: [
      // ... existing rules

      {
        test: /\.js$/u,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-regenerator', '@babel/plugin-proposal-object-rest-spread']
          }
        }
      },
      {
        test: /\.vue$/u,
        loader: 'vue-loader'
      }
    ]
  },
  output: {
	filename: "[name].bundle.js",
	path: path.resolve(__dirname, "dist")

  },
  devtool: 'source-map' // Update devtool configuration to 'source-map'
};
