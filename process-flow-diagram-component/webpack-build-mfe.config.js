const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');

// * this const is not the same location as devServer ./dist
const EXPORT_DIR = './dist';
module.exports = options => {
  return {
    mode: options.mode,
    entry: "./process-flow-diagram-component/src/index.tsx",
    devtool: 'inline-source-map',
    devServer: {
            static: path.join(__dirname, EXPORT_DIR),
            port: 3000,
          },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: {
            loader: "ts-loader",
            options: {
              projectReferences: true,
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: EXPORT_DIR,
              },
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
                
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "process-flow-diagram-component.js",
      path: path.resolve(__dirname, EXPORT_DIR),
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'process-flow-diagram-component.css',
      }),
      new CopyPlugin({
        patterns: [
            {
                from: path.resolve(__dirname, './src/assets/'),
                to: path.resolve(__dirname, 'dist/assets/')
            }
        ]
      }),
    ],
  }
}