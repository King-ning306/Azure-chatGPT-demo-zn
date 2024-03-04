// webpack.config.js
const path = require("path");
const webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: {
        main: "./public/index.js",
        profileManager: "./public/profile-manager.js"
    },
    output: {
        filename: "[name].bundle.js", // This will create main.bundle.js and profileManager.bundle.js
        path: path.resolve(__dirname, "./public/dist"),
    },
    plugins: [
        new webpack.DefinePlugin({
          'process.env.AZURE_OCR_API_KEY': JSON.stringify(process.env.AZURE_OCR_API_KEY),
          'process.env.AZURE_OCR_ENDPOINT': JSON.stringify(process.env.AZURE_OCR_ENDPOINT),
        }),
      ],
};
