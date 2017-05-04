module.exports = {
  context: __dirname,
  entry: "./lib/subwait.js",
  output: {
    filename: "./bundle.js"
  },
 module: {
  loaders: [
    {
      test: /\.geojson$/,
      loader: 'json-loader'
      },
    ]
  },
  resolve: {
    extensions: [".js", ".jsx", ".geojson", "*"]
  },
  devtool: 'source-map'
};
