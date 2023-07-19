const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin"); // Import CssMinimizerPlugin
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

module.exports = merge(common, {
	devtool: "source-map",
	mode: "production",
	module: {
		rules: [
			// ... existing rules
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
			},
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"postcss-loader",
					"sass-loader",
				],
			},
		],
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				parallel: true,
				extractComments: false,
				terserOptions: {
					format: {
						comments: false,
					},
				},
			}),
			new CssMinimizerPlugin(), // Add CssMinimizerPlugin to the minimizer array
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css",
		}),
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(),
	],
	resolve: {
		alias: {
			vue$: "vue/dist/vue.runtime.esm-bundler.js",
		},
	},
});
