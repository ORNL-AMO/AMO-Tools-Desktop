const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');

const EXPORT_DIR = './dist';

module.exports = options => {
  return {
    mode: "development",
    entry: "./src/index.tsx",
    devServer: {
            static: path.join(__dirname, './dist'),
            port: 3000,
          },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        // todo fix css module loading
        // {
        //   test: /\.css$/,
        //   use: [
        //     "style-loader",
        //     {
        //       loader: "css-loader",
        //       options: {
        //         importLoaders: 1,
        //         modules: true,
        //       },
        //     },
        //   ],
        //   include: /\.module\.css$/,
        // },
        // {
        //   test: /\.css$/,
        //   use: ["style-loader", "css-loader"],
        //   exclude: /\.module\.css$/,
        // },
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
      alias: {
        'process-flow-lib': path.resolve(__dirname, '../src/process-flow-lib')
      },
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "process-flow-diagram-component.js",
      path: path.resolve(__dirname, EXPORT_DIR),
    },
    plugins: [
      new MiniCssExtractPlugin({filename: 'process-flow-diagram-component.css'}),
      new HtmlWebpackPlugin({
        template: './index.html',
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