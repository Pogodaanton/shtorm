const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

var config = {
  stats: 'errors-only',
  entry: {
    main: ['./src/main.js']
  },
  output: {
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[name].[chunkhash].chunk.bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      title: 'Loading... | Nodemw-Semi'
    })
  ]
}

var devConfig = {
  devtool: 'source-map',
  devServer: {
    stats: 'errors-only',
    contentBase: 'src/',
    progress: true,
    compress: true,
    historyApiFallback: true,
    port: 3000
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
