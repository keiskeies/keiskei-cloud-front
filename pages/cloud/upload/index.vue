<template>
	<view class="wrap">
		<u-upload :custom-btn="true" ref="imageUpload"  show-upload-list
			:limitType="imageLimitType" :file-list="imageList" :action="imageAction">
			<view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
				<u-icon name="photo" size="60" color="#c0c4cc"></u-icon>
			</view>
		</u-upload>

		<u-upload :custom-btn="true" ref="videoUpload" show-upload-list
			:limitType="videoLimitType" :file-list="videoList" :action="videoAction">
			<view slot="addBtn" class="slot-btn" hover-class="slot-btn__hover" hover-stay-time="150">
				<u-icon name="photo" size="60" color="#c0c4cc"></u-icon>
			</view>
		</u-upload>

		<view v-show="false">
			<form @submit="formSubmit" @reset="formReset">
				<view class="uni-form-item uni-column">
					<view class="title">switch</view>
					<view>
						<switch name="switch" />
					</view>
				</view>
			</form>
		</view>


	</view>
</template>

<script>
	import Qs from 'qs' //引入qs库
	export default {
		data() {
			return {
				imageList: [],
				imageAction: this.$u.http.config.baseUrl + '/api/file/image/upload',
				imageLimitType: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
				videoList: [],
				videoAction: this.$u.http.config.baseUrl + '/api/file/video/upload',
				videoLimitType: ["mp4"],
				percent: 0
			}
		},
		onLoad() {
			console.log(this.$u.http)
		},
		methods: {
			beforeUploadImage(index, list) {
				return new Promise((resolve, reject) => {
					this.beforeUpload(index, list, 'image').then(() => {
						this.imageList = list;
						reject();
					})
				})
			},
			beforeUploadVideo(index, list) {
				return new Promise((resolve, reject) => {
					this.beforeUpload(index, list, 'video').then(() => {
						this.videoList = list
						reject()
					})
				})
			},
			beforeUpload(index, list, type) {
				const self = this

				const file = list[index].file
				console.log(file)
				return new Promise((resolve, reject) => {
					const fileSize = file.size
					// 分片最小单位
					const chunkSize = 5 * 1024 * 1024

					// 上传过程中用到的变量
					let progressNum = 0 // 进度
					let successAllCount = 0 // 上传成功的片数
					let AllChunk = 0 // 所有文件的chunk数之和
					let chunkCount // chunk数量
					let token // 文件唯一标识

					const readChunk = () => {
						token = guid()
						chunkCount = Math.ceil(fileSize / chunkSize) // 总片数
						AllChunk = AllChunk + chunkCount // 计算全局chunk数
						for (let i = 0; i < chunkCount; i++) {
							uploadChunk(i) // 针对单个文件进行chunk上传
						}
					}
					const uploadChunk = (index) => {
						const {
							chunk
						} = getChunkInfo(file, index, chunkSize)
						const chunkFR = new FileReader()
						chunkFR.readAsBinaryString(chunk)
						chunkFR.addEventListener('load', () => {
							const fetchForm = new FormData()
							fetchForm.append('id', token)
							fetchForm.append('name', file.name)
							fetchForm.append('size', fileSize)
							fetchForm.append('file', chunk)
							fetchForm.append('chunks', chunkCount)
							fetchForm.append('chunk', index)

							const fetchData = {
								id: token,
								name: file.name,
								size: fileSize,
								chunks: chunkCount,
								chunk: index
							}

							uni.uploadFile({
								url: self.$u.http.config.baseUrl + '/api/file/' + type +
									'/uploadPart', //仅为示例，并非真实接口地址。
								files: [chunk],
								name: 'file',
								method: 'POST',
								formData: fetchData,
								header: {
									'Content-Type': 'multipart/form-data;charset=utf-8'
								},
								success: (res) => {
									successAllCount++
									progressFun()
									// 当总数大于等于分片个数的时候合并文件
									if (successAllCount >= chunkCount) {
										mergingFile()
									}
								},
								fail: (e) => {
									console.error(e)
									self.percent = 0
									list.splice(index, 1)
								}
							});
							// self.$u.post('/api/file/' + type + '/uploadPart', fetchData, {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}).then(() => {
							// 	successAllCount++
							// 	progressFun()
							// 	// 当总数大于等于分片个数的时候合并文件
							// 	if (successAllCount >= chunkCount) {
							// 		mergingFile()
							// 	}
							// 	// successAllCount >= chunkCount ? mergingFile() : uploadChunk(successAllCount)
							// }).catch((e) => {
							// 	console.error(e)
							// 	self.percent = 0
							// 	list.splice(index, 1)
							// })
						}, false)
					}

					// 对分片已经处理完毕的文件进行上传
					const mergingFile = () => {
						const mergingData = {
							id: token,
							name: file.name,
							chunks: chunkCount
						}

						// const makeFileForm = new FormData()
						// makeFileForm.append('id', token)
						// makeFileForm.append('name', file.name)
						// makeFileForm.append('chunks', chunkCount)
						self.$u.post('/api/file/' + type + '/mergingChunks', Qs.stringfy(mergingData), {
							"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
						}).then(res => {
							list[index].url = res.data
							// success && success(res)
						}).catch(e => {
							self.percent = 0
							list.splice(index, 1)
						})
					}
					// 截取文件信息
					const getChunkInfo = (file, currentChunk, chunkSize) => {
						const start = currentChunk * chunkSize
						const end = Math.min(fileSize, start + chunkSize)
						const chunk = file.slice(start, end)
						return {
							start,
							end,
							chunk
						}
					}
					// 获取唯一文件标识
					const guid = () => {
						return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
							const r = Math.random() * 32 | 0
							const v = c === 'x' ? (Math.random() * 32 | 0) : (r & 0x1 | 0x32)
							return v.toString(32)
						})
					}
					// 更新进度
					const progressFun = () => {
						progressNum = Math.ceil(successAllCount / AllChunk * 100)
						// progress(progressNum)
						this.percent = progressNum
						list[index].progress = progressNum
					}
					readChunk()
				})
			}
		}
	}
</script>

<style lang="scss">
	.wrap {
		padding: 24rpx;
		background-color: #000000;
	}

	.slot-btn {
		width: 341rpx;
		height: 140rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgb(244, 245, 246);
		border-radius: 10rpx;
	}

	.slot-btn__hover {
		background-color: rgb(235, 236, 238);
	}

	.pre-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.pre-item {
		flex: 0 0 48.5%;
		border-radius: 10rpx;
		height: 140rpx;
		overflow: hidden;
		position: relative;
		margin-bottom: 20rpx;
	}

	.pre-item-image {
		width: 100%;
		height: 140rpx;
	}
</style>
