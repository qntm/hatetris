import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

export default {
  mode: 'production',

  // "Recommended choice for production builds with high quality SourceMaps"
  devtool: 'source-map',

  entry: [
    './src/index.tsx'
  ],
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css'
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      favicon: './src/favicon.png',
      filename: 'hatetris.html',
      xhtml: true
    })
  ],
  resolve: {
    // TypeScript requires us to lie in our `import`s
    extensionAlias: {
      '.js': [
        '.ts',
        '.js' // third-party code
      ],
      '.jsx': '.tsx'
    },

    extensions: [
      '.tsx',
      '.ts',
      '.js' // third-party code
    ]
  },
  module: {
    rules: [{
      test: /\.tsx$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-react'],
            ['@babel/preset-typescript', {
              isTSX: true,
              allExtensions: true
            }]
          ]
        }
      }
    }, {
      test: /\.ts$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-typescript'
          ]
        }
      }
    }, {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader'
      ]
    }]
  },
  output: {
    filename: 'bundle.js'
  },
  externals: {
    react: 'React',
    'react-dom/client': 'ReactDOM'
  }
}
