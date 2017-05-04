module.exports = {
  context: __dirname,
  entry: "./subwait.js",
  output: {
    filename: "./bundle.js"
  },
  resolve: {
    extensions: [".js", ".jsx", "*"]
  }
};
