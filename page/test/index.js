Page({
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },
  onReady: function (e) {
  },
  startX: 0,
  startY: 0,
  touchStart: function (e) {
      this.startX = e.changedTouches[0].x
      this.startY = e.changedTouches[0].y
      this.context = wx.createContext()

      this.context.setStrokeStyle("#000000")
      this.context.setLineWidth(10)
      this.context.setLineCap('round') // 让线条圆润
      this.context.beginPath()
  },
  touchMove: function (e) {
      this.context.moveTo(this.startX, this.startY)
      this.startX = e.changedTouches[0].x
      this.startY = e.changedTouches[0].y
      this.context.lineTo(this.startX, this.startY)
      this.context.stroke()
      wx.drawCanvas({
         canvasId: 'firstCanvas',
         reserve: true,
         actions: this.context.getActions() // 获取绘图动作数组
      })
  },
  touchEnd: function () {
      
  }
});