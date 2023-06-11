const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'development',
	devtool: 'eval-source-map', // or 'eval-source-map'
	module: {
	  rules: [
		// ... existing rules
		{
		  test: /\.css$/,
		  use: [
			'vue-style-loader',
			{
			  loader: 'css-loader',
			  options: {
				importLoaders: 1
			  }
			},
			'postcss-loader'
		  ]
		},
		{
		  test: /\.scss$/,
		  use: [
			'vue-style-loader',
			'css-loader',
			'postcss-loader',
			'sass-loader'
		  ]
		}
	  ]
	},
	resolve: {
		alias: {
			'vue$': '@vue/runtime-dom'
		}
	}
});
