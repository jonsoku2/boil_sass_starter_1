const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (env, options) => {
  const config = {
    watch: true,
    mode: options.mode,
    entry: "./src/js/main.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "./js/[name].bundle.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"]
            }
          }
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            {
              /*
               ** outputStyle:  nested(default), expanded(표준), compact(한줄), compressed(압축)
               */
              loader: "sass-loader",
              options: { sourceMap: true, outputStyle: "compressed" }
            }
          ]
        },
        {
          //css, jss에서 사용된 이미지 소스path를 잡아주는놈
          test: /\.(png|jpe?g|gif)$/,
          use: [
            {
              loader: "url-loader",
              options: {
                limit: 30000,
                useRelativePath: true,
                // 현재 webpack public경로는 dist이기때문에
                // 예시 ) module.exports = __webpack_public_path__ + "../images/css/5.jpeg";
                publicPath: "../images",
                //dist안의 폴더명 정의
                outputPath: "./images", // 대상파일을 저장할 경로 지정
                name: "[name].[ext]"
              }
            }
          ]
        }
      ]
    },
    plugins: [
      // style을 추출하여 file로 구성하는 플러그인
      new MiniCssExtractPlugin({
        filename: "./css/[name].bundle.css" // 위치 : ./dist/css/[name].bundle.css 로 저장이 된다.
      })
    ]
  };
  if (options.mode === "development") {
    config.plugins.push(
      // browser auto reload
      new webpack.HotModuleReplacementPlugin(),

      // 작업할 html file 정의 (복수개의 html이라면 여러번 new 하면 된다.)
      // webpack-dev-server를 사용할 때는 build하지 않으니, 제자리에 저장하는 형식
      new HtmlWebpackPlugin({
        filename: "./src/index.html",
        template: "./src/index.html"
      })

      /* 
      ** html이 복수개일때
      new HtmlWebpackPlugin({
        filename : "./src/second.html",
        template : "./src/second.html"
      })
      */
    );
    config.devServer = {
      host: "0.0.0.0",
      port: 921,
      inline: true,
      overlay: true,
      historyApiFallback: true,
      openPage: "./src/index.html",
      disableHostCheck: true,
      index: "index.html"
    };
  } else {
    // product 모드
    config.plugins.push(
      // dist 파일 초기화
      new CleanWebpackPlugin(),

      //추출할 html 파일
      new HtmlWebpackPlugin({
        filename: "index.html",
        template: "./src/index.html"
      }),

      // 개발폴더의 이미지를 통째로 복사하는것
      // 다른 js, css 폴더가 될 수도 있다.
      // 나는 html파일에서 사용된 이미지소스는 이걸로 사용할것임
      new CopyPlugin([
        {
          from: path.resolve(__dirname, "./src/images/sample"),
          to: path.resolve(__dirname, "./dist/images/sample")
        }
      ])
    );
  }
  return config;
};
