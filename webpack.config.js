const { exec } = require('child_process');
const path = require('path');
const packageJSON = require('./package.json');
const webpack = require('webpack');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const purgecss = require('@fullhuman/postcss-purgecss');

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LessPluginCleanCSS = require('less-plugin-clean-css');
const VisualizerPlugin = require('webpack-visualizer-plugin');
const WebpackNotifierPlugin = require('webpack-build-notifier');

const devMode = process.env.NODE_ENV !== 'production';
const distPath = `/assets/${packageJSON.version}`;
const distLatestPath = '/assets/latest';
const publicPath = devMode ? `//localhost:9099${distPath}/` : `//production.loc${distLatestPath}/`;
const buildDistPath = path.resolve(__dirname, `public/${distPath}`);

const {
  DefinePlugin,
  ProvidePlugin,
  SourceMapDevToolPlugin,
  ContextReplacementPlugin,
} = webpack;

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
  watchOptions: {
    // ignored: ['ignore/files/path with glob patterns'],
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
            loader: 'postcss-loader',
            options: {
              plugins: [
                purgecss({
                  content: [
                    'src/**/*.js',
                  ],
                  whitelist: ['body'],
                  extractors: [
                    {
                      extractor: class {
                        static extract(content) {
                          return content.match(/[A-Za-z0-9-_:\\//]+/g) || [];
                        }
                      },
                      extensions: ['js', 'jsx'], // file extensions
                    },
                  ],
                }),
              ],
              sourceMap: devMode,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                tailwindcss('./tailwind.js'),
                autoprefixer(),
              ].filter(i => i),
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
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: devMode,
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: devMode,
              plugins: [
                devMode ? null : new LessPluginCleanCSS({ advanced: true }),
              ].filter(i => i),
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        }],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'img/',
          },
        }],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      PUBLIC_PATH: JSON.stringify(publicPath),
    }),
    new ProvidePlugin({ jQuery: 'jquery', $: 'jquery' }),
    new ContextReplacementPlugin(/moment[/\\]locale$/, /de|en/),
    new HtmlWebpackPlugin({
      filename: devMode ? 'index.html' : path.resolve(__dirname, 'public/index.html'),
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
    }),
    new VisualizerPlugin({ filename: 'statistics.html' }),
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
    new WebpackNotifierPlugin({ suppressWarning: true }),
    devMode ? new SourceMapDevToolPlugin({ exclude: ['/node_modules/'] }) : null,
  ].filter(i => i),
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    modules: ['node_modules', path.resolve(__dirname, 'src')],
  },
  optimization: {
    minimizer: devMode ? [] : [
      new OptimizeCSSAssetsPlugin({
        // cssProcessorOptions: { safe: true, discardComments: { removeAll: true } },
      }),
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false, // set to true if you want JS source maps
        extractComments: true,
      }),
    ],
  },
  output: {
    path: buildDistPath,
    publicPath,
  }
};
