// pages/video/index.js
var AV = require('../../../libs/av-weapp-min.js');

function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}
Page({
  data: {},
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log(options);
    var self = this;
    var id = options.id;
    var query = new AV.Query('Video');
    query.get(id).then(function (video) {
      // 成功获得实例
      self.setData({
        video
      })
    }, function (error) {
      // 异常处理
      console.log(error);
    });
  },
  onReady: function () {
    // 页面渲染完成
    this.videoContext = wx.createVideoContext('myVideo');
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
  inputValue: '',
  bindInputBlur: function (e) {
    this.inputValue = e.detail.value
  },
  bindSendDanmu: function () {
    this.videoContext.sendDanmu({
      text: this.inputValue,
      color: getRandomColor()
    })
  }
})