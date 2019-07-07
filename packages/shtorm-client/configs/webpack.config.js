const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const NODEMODULES_DIR = path.resolve(__dirname, '../node_modules')
const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor')
const clientConfigPathRelative = '../src/config.json'

var config = {
  stats: 'errors-only',
  entry: {
    main: ['./src/main.js']
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
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets'
            }
          }
        ]
      },
      {
        type: 'javascript/auto',
        test: /\.json$/,
        exclude: NODEMODULES_DIR,
        use: [
          {
            loader: 'file-loader?name=[name].json',
            options: {
              outputPath: 'assets'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      title: 'Shtorm | The semi-automatic scriptable WikiBot'
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
  const clientCfgPath = path.join(__dirname, clientConfigPathRelative)

  if (!fs.existsSync(clientCfgPath)) {
    console.error('You need to create a config.json in "packages/shtorm-client/src" first! There is an example file called config.example.json in that directory which you can modify and save as config.json.')
    process.exit(9)
  }

  try {
    const clientCfgRaw = fs.readFileSync(clientCfgPath)
    const clientCfg = JSON.parse(clientCfgRaw)

    cfg.output = {
      filename: '[name].[hash].bundle.js',
      chunkFilename: '[name].[chunkhash].chunk.bundle.js',
      path: path.join(__dirname, '../dist'),
      publicPath: clientCfg.clientPath
    }
  } catch (err) {
    console.error('An unexpected error happened when reading src/config.json!', err)
    process.exit()
  }

  if (isDevServer) {
    cfg = Object.assign(config, devConfig) // Appending config specific for dev
    cfg.entry.main.push('./configs/status-bar.js') // Loading webpack-dev-server-status-bar w/ custom config
  }

  return cfg
}
