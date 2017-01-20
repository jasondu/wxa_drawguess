// pages/video/create/index.js
var AV = require('../../../libs/av-weapp-min.js');

Page({
  data: {
    url: "",
    title: "",
    thumb: ""
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var app = getApp(); // 获取全局变量
    this.setData({
      url: app.videoUrl
    });
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  changeInputContent(e) {
    this.setData({ title: e.detail.value });
  },
  chooseImage: function () {
    var self = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths[0];
        self.setData({
          thumb: tempFilePaths
        })
      }
    })
  },
  submitVideo: function () {
    console.log(this.data);
    if (this.data.title.trim() === '') {
      wx.showModal({
        title: '提示',
        content: '请输入标题',
        showCancel: false
      })
    } else {
      wx.showNavigationBarLoading();
      new AV.File(this.data.title + '-video', {
        blob: {
          uri: this.data.url,
        },
      }).save().then(
        // 上传视频成功
        file => {
          console.log('上传视频成功');
          console.log(this.data.title);
          new AV.File(this.data.title + '-thumb', {
            blob: {
              uri: this.data.thumb,
            },
          }).save().then(
            thumbFile => {
              console.log('上传封面成功');
              // 上传封面成功
              wx.hideNavigationBarLoading();
              var Video = AV.Object.extend('Video');
              // 新建一个 Todo 对象
              var video = new Video();
              video.set('title', this.data.title);
              video.set('video', file);
              video.set('thumb', thumbFile);
              video.save().then(function (video) {
                wx.showModal({
                  title: '提示',
                  content: '提交成功',
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                      wx.navigateBack();
                    }
                  }
                })
              }, function (error) {
                // 异常处理
                wx.showToast({
                  title: error.message
                })
              })

            }, function () {
              console.log('错误');
              console.log(arguments);
            }).catch(console.error);
        }
      )
    }
  }
})