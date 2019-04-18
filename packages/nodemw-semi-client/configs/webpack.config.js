const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const NODEMODULES_DIR = path.resolve(__dirname, '../node_modules')
const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor')

var config = {
  stats: 'errors-only',
  entry: {
    main: ['./src/main.js']
  },
  output: {
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[name].[chunkhash].chunk.bundle.js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: NODEMODULES_DIR,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        exclude: NODEMODULES_DIR,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        include: MONACO_DIR,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      title: 'Nodemw-Semi | The Semi-Automatic scriptable WikiBot'
    }),
    new MonacoWebpackPlugin({
      languages: ['json', 'xml', 'markdown', 'html']
    })
  ]
}

var devConfig = {
  devtool: 'source-map',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    stats: 'errors-only',
    contentBase: 'src/',
    progress: true,
    compress: true,
    historyApiFallback: true
  }
}

module.exports = (env, argv) => {
  var cfg = config
  const isDevServer = process.argv.some(s => s.match(/webpack-dev-server$/))

  if (isDevServer) {
    cfg = Object.assign(config, devConfig) // Appending config specific for dev
    cfg.entry.main.push('./configs/status-bar.js') // Loading webpack-dev-server-status-bar w/ custom config
  }

  return cfg
}
