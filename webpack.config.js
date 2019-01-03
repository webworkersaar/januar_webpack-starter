const { exec } = require('child_process');
const path = require('path');
const packageJSON = require('./package.json');

const devMode = process.env.NODE_ENV !== 'production';

const distPath = `/assets/${packageJSON.version}`;
const distLatestPath = '/assets/latest';
const publicPath = devMode ? `//localhost:9099${distPath}/` : `//production.loc${distLatestPath}/`;
const buildDistPath = path.resolve(__dirname, `public/${distPath}`);

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

console.log('Config:', {
  devMode,
  distPath,
  distLatestPath,
  publicPath,
  buildDistPath,
});

module.exports = {
  entry: './src/index.js',
  devtool: false,
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    compress: true,
    port: 9099,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(scss|css)$/,
        exclude: /normalize-css/,
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: devMode,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: devMode,
            },
          },
        ],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: devMode ? 'index.html' : path.resolve(__dirname, 'public/index.html'),
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
    }),
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
          exec(`ln -sfn ./${packageJSON.version}/ public/assets/latest`, (err, stdout, stderr) => {
            (stdout && process.stdout.write(stdout));
            (stderr && process.stderr.write(stderr));
          });
        });
      },
    },
  ].filter(i => i),
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    modules: ['node_modules', path.resolve(__dirname, 'src')],
  },
  output: {
    path: buildDistPath,
    publicPath,
  }
};
