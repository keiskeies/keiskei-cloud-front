module.exports = {
	// 配置路径别名
	configureWebpack: {
		devServer: {
			// 调试时允许内网穿透，让外网的人访问到本地调试的H5页面
			disableHostCheck: true,
			proxyTable: {
				'/api': {
					target: 'http://localhost:10037', //后期可以改
					changeOrigin: true,
					pathRewrite: {
						'^/api': ''
					}
				}
			},
		}
	},
	//productionSourceMap: false,
}
