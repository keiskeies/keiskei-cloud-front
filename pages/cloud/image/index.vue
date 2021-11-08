<template>
	<view class="wrap">
		<u-waterfall v-model="flowList" ref="uWaterfall">
			<template v-slot:left="{ leftList }">
				<view class="demo-warter" v-for="(item, index) in leftList" :key="index" @click="showDetal(item)">
					<u-lazy-load threshold="-450" border-radius="10"
						:image="$u.http.config.baseUrl + '/api/file/image/show/' + item.url + '?x-oss-process=image/resize,w_200,limit_0'"
						:index="index"></u-lazy-load>
					<view class="demo-title">{{ item.name }}</view>
					<view class="demo-shop">{{ item.uploadTime }}</view>
				</view>
			</template>
			<template v-slot:right="{ rightList }">
				<view class="demo-warter" v-for="(item, index) in rightList" :key="index" @click="showDetal(item)">
					<u-lazy-load threshold="-450" border-radius="10"
						:image="$u.http.config.baseUrl + '/api/file/image/show/' + item.url + '?x-oss-process=image/resize,w_200,limit_0'"
						:index="index"></u-lazy-load>
					<view class="demo-title">{{ item.name }}</view>
					<view class="demo-shop">{{ item.uploadTime }}</view>
				</view>
			</template>
		</u-waterfall>
		<u-back-top :scroll-top="scrollTop" top="1"></u-back-top>
		<u-loadmore bg-color="rgb(8, 8, 8)" :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
		<u-popup class="image-dialog" border-radius="10" v-model="show" mode="top" length="100%" mask closeable close-icon-pos="top-right">
			<u-lazy-load threshold="-450" border-radius="10":image="showUrl"></u-lazy-load>
			<!-- <u-loadmore bg-color="rgb(8, 8, 8)" :status="loadNextStatus" @loadmore="addNextData"></u-loadmore> -->
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loadStatus: 'loadmore',
				loadNextStatus: 'loadmore',
				flowList: [],
				show: false,
				showUrl: undefined,
				sort: 0,
				scrollTop: 0,
				sortSelect: 0
			};
		},
		onLoad() {
			this.addRandomData();
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onReachBottom() {
			// this.loadStatus = 'loading';
			// // 模拟数据加载
			// setTimeout(() => {
			// 	this.addRandomData();
			// 	this.loadStatus = 'loadmore';
			// }, 1000);
		},
		methods: {
			addRandomData() {
				this.$u.get('/api/file/image/list').then(res => {
					res.forEach(item => {
						item.id = this.$u.guid();
						item.sort = this.sort++;
						this.flowList.push(item);
					})
				})
			},
			showDetal(item) {
				this.showUrl = this.$u.http.config.baseUrl + '/api/file/image/show/' + item.url;
				this.sortSelect = item.sort
				this.show = true
			},
			addNextData() {
				const sortSelect = this.sortSelect + 1
				const item = this.flowList[sortSelect]
				this.showDetal(item)
			}
		}
	};
</script>

<style>
	/* page不能写带scope的style标签中，否则无效 */
	page {
		background-color: rgb(0, 0, 0);
	}
</style>

<style lang="scss" scoped>
	.demo-warter {
		border-radius: 8px;
		margin: 5px;
		background-color: #030303;
		padding: 8px;
		position: relative;
	}

	.u-close {
		position: absolute;
		top: 32rpx;
		right: 32rpx;
	}

	.demo-img-wrap {}

	.demo-image {
		width: 100%;
		border-radius: 4px;
	}

	.demo-title {
		font-size: 30rpx;
		margin-top: 5px;
		color: $u-main-color;
		word-break: break-all;
	}


	.demo-shop {
		font-size: 22rpx;
		color: $u-tips-color;
		margin-top: 5px;
	}
	.image-dialog, .image-dialog-content {
		background-color: #000000;
	}
	.image-dialog-content-image {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
