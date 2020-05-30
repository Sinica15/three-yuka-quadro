const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const PORT = 9000;

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new webpack.HotModuleReplacementPlugin({ multistep: true }),
  ],
  devServer: (() => {
    const line = new Array(30).fill('=').join('');
    console.log(`${line}\n| starting on localhost:${PORT} |\n${line}\n`);
    return {
      contentBase: path.join(__dirname, "dist"),
      hot: true,
      port: PORT,
    };
  })(),
};
