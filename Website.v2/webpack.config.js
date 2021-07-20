const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { NONAME } = require('dns');

module.exports = (env) => {
  return {
    resolve: {
      extensions: ['.ts', '.js', '.tsx'],
    },
    mode: env.mode,
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            // Creates `style` nodes from JS strings
            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            'sass-loader',
          ],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: ['file-loader?name=app/images/[name].[ext]'],
        },
      ],
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: './src/index.html',
        filename: './index.html',
      }),
      new Dotenv({safe: true})
    ],
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'public'),
    },
    devServer: {
      historyApiFallback: {
        index: '/',
      },
    }
  };
};