// pages/todo/index.js
var AV = require('../../libs/av-weapp-min.js');
var Realtime = require('../../libs/realtime.weapp.min.js').Realtime;
var TextMessage = require('../../libs/realtime.weapp.min.js').TextMessage;
Page({
  data:{
    value: '',
    code: '',
    todos: [],
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  fetch: function () {
    new AV.Query('Todo')
      .descending('createdAt')
      .find()
      .then(todos => this.setData({ todos }))
      .catch(console.error);
  },
  onReady:function(){
    var self = this;
    // 页面渲染完成
    this.fetch();
    this.realtime = new Realtime({
      appId: 'I0j7ktVKS8It7VRU8iEfQF2f-gzGzoHsz',
      noBinary: true,
    });
    this.realtime.on('disconnect', function() {
      console.log('网络连接已断开');
    });
    this.realtime.on('schedule', function(attempt, delay) {
      console.log(delay + 'ms 后进行第' + (attempt + 1) + '次重连');
    });
    this.realtime.on('retry', function(attempt) {
      console.log('正在进行第' + attempt + '次重连');
    });
    this.realtime.on('reconnect', function() {
      console.log('网络连接已恢复');
    });
    // 登陆
    wx.login({
      success: function(res) {
        let code = res.code;
        // 加入
        var id = '587c7dd12f301e00591b03f7';
        self.realtime.createIMClient(code).then(function(mine) {
          console.log('login success: ' + code);
          mine.on('message', function(message, conversation) {
            console.log('get message');
            self.fetch();
          });
          return mine.getConversation(id);
        })
        .then(function(conversation) {
          self.conversation = conversation;
          return conversation.add([code])
        })
        .then(function(conversation) {
          console.log('加入成功', conversation.members);
          return conversation.count()
        })
        .then(function(count) {
          console.log('在线人数: ' + count);
        })
        .catch(console.error.bind(console));
      }
    });
  },
  onShow:function(){
    // 页面显示
    console.log('页面显示');
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  okInput: function (e) {
    var self = this;
    var value = e.detail.value;
    var Todo = AV.Object.extend('Todo');
    // 新建一个 Todo 对象
    var todo = new Todo();
    todo.set('title', value);
    todo.set('content', '');
    todo.save().then(function (todo) {
      // 成功保存之后，执行其他逻辑.
      self.fetch();
      self.setData({value: ''});
      self.conversation.send(new TextMessage(' '));
    }, function (error) {
      // 异常处理
      console.error('Failed to create new object, with error message: ' + error.message);
    });
  },

    checkboxChange: function (e) {
        this.conversation.send(new TextMessage(' '));

        var checkboxItems = this.data.todos, values = e.detail.value;
        for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
            var todo = AV.Object.createWithoutData('Todo', checkboxItems[i].get('objectId'));
            todo.set('checked', false);
            checkboxItems[i].set('checked', false);

            for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
                if(checkboxItems[i].get('objectId') == values[j]){
                    todo.set('checked', true);
                    checkboxItems[i].set('checked', true);
                    break;
                }
            }
            todo.save();
        }
        this.setData({
            todos: checkboxItems
        });
    },

    onShareAppMessage: function () {
        return {
        title: '微待办',
        desc: '同步协作待办小程序',
        path: '/pages/todo/index'
        }
    },
    onPullDownRefresh: function () {
      new AV.Query('Todo')
        .descending('createdAt')
        .find()
        .then(todos => {
          this.setData({ todos });
          wx.stopPullDownRefresh();
          })
        .catch(console.error);
    }
})