// pages/video/index.js
var AV = require('../../libs/av-weapp-min.js');

Page({
  data: {},
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady: function () {
    // 页面渲染完成
    new AV.Query('Video')
      .descending('createdAt')
      .find()
      .then(video => {
        console.log(video);
        this.videoContexts = video;
        this.setData({ video })
      })
      .catch(console.error);
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
  videoPlay: function (event) {
    console.log(event);
  },
  takeVideo: function () {
    // 录像
    wx.chooseVideo({
      sourceType: ['camera'],
      maxDuration: 10,
      camera: 'back',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        var app = getApp();
        app.videoUrl = tempFilePath;  // save in global data
        wx.navigateTo({
          url: '/pages/video/create/index'
        });
      }
    })
  },
  onPullDownRefresh: function () {
    new AV.Query('Video')
      .descending('createdAt')
      .find()
      .then(video => {
        console.log(video);
        this.setData({ video });
        wx.stopPullDownRefresh();
      })
      .catch(console.error);
  }
})