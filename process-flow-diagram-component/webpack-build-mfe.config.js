const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

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
    ],
  }
}