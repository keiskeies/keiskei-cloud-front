<template>
	<view class="wrap">
		<u-waterfall v-model="flowList" ref="uWaterfall">
			<template v-slot:left="{ leftList }">
				<view class="demo-warter" v-for="(item, index) in leftList" :key="index" @click="showDetal(item)">
					<u-lazy-load threshold="-450" border-radius="10"
						:image="$u.http.config.baseUrl + '/api/file/video/show/' + item.url + '?x-oss-process=video/snapshot,t_2000,m_jpg'"
						:index="index"></u-lazy-load>
					<view class="demo-title">{{ item.name }}</view>
					<view class="demo-shop">{{ item.uploadTime }}</view>
				</view>
			</template>
			<template v-slot:right="{ rightList }">
				<view class="demo-warter" v-for="(item, index) in rightList" :key="index" @click="showDetal(item)">
					<u-lazy-load threshold="-450" border-radius="10"
						:image="$u.http.config.baseUrl + '/api/file/video/show/' + item.url + '?x-oss-process=video/snapshot,t_2000,m_jpg'"
						:index="index"></u-lazy-load>
					<view class="demo-title">{{ item.name }}</view>
					<view class="demo-shop">{{ item.uploadTime }}</view>
				</view>
			</template>
		</u-waterfall>
		<u-loadmore bg-color="rgb(8, 8, 8)" :status="loadStatus" @loadmore="addRandomData"></u-loadmore>
		<u-back-top :scroll-top="scrollTop" top="1"></u-back-top>
		<u-popup border-radius="10" v-model="show" mode="top" length="50%" mask closeable close-icon-pos="top-right">
			<video class="video-dialog" v-if="show" :src="showUrl" controls autoplay show-mute-btn></video>
		</u-popup>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loadStatus: 'loadmore',
				flowList: [],
				show: false,
				showUrl: undefined,
				scrollTop: 0
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
				this.$u.get('/api/file/video/list').then(res => {
					res.forEach(item => {
						item.id = this.$u.guid();
						this.flowList.push(item);
					})
				})
			},
			showDetal(item) {
				this.showUrl = this.$u.http.config.baseUrl + '/api/file/video/show/' + item.url;
				this.show = true
			},
			clear() {
				this.$refs.uWaterfall.clear();
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

	.video-dialog {
		width: 100%;
		height: 100%;
	}
	.upload-btn {
		position: absolute;
		right: 0;
		bottom: 0;
	}
</style>
