var AV = require('../../libs/av-weapp-min.js');
var Realtime = require('../../libs/realtime.weapp.min.js').Realtime;
var TextMessage = require('../../libs/realtime.weapp.min.js').TextMessage;

Page({
    data: {
        inputContent: '',
        nickname: '',
        waiting: false,
        peoples: []
    },
    login: function (options) {
        console.log(options);
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
        })
        var self = this;
        wx.getSystemInfo({
            success: function (res) {
                if (res.platform === 'devtools') {
                    // 测试
                    AV.User.logIn('rq9nhw1g5v4kn9ozl6ifilqg3', 'cat!@#123').then(function (user) {
                        const userInfo = user.toJSON();
                        if (!userInfo.nickName) {
                            self.updateUser((userInfo) => {
                                self.joinRoom(userInfo, options);
                            });
                        } else {
                            self.joinRoom(userInfo, options);
                        }
                    }, function (error) {
                    });
                } else {
                    AV.Promise.resolve(AV.User.current()).then(user =>
                        user ? (user.isAuthenticated().then(authed => authed ? user : null)) : null
                    ).then(user =>
                        user ? user : AV.User.loginWithWeapp()
                        ).then((user) => {
                            console.log('登陆成功');
                            const userInfo = user.toJSON();
                            if (!userInfo.nickName) {
                                self.updateUser((userInfo) => {
                                    self.joinRoom(userInfo, options);
                                });
                            } else {
                                self.joinRoom(userInfo, options);
                            }
                        })
                }
            }
        })
    },
    onLoad: function (options) {
        this.options = options;
        console.log('draw onLoad');
        this.login(this.options);
    },
    onReady: function () {
        //Do some when page ready.
        this.context = wx.createCanvasContext('firstCanvas')
        this.setStyle();
    },
    onShow: function () {
        //Do some when page show.
        console.log('onshow');
        
    },
    onHide: function () {
        //Do some when page hide.
        console.log('draw onHide');
    },
    onUnload: function () {
        //Do some when page unload.

    },
    onPullDownRefresh: function () {
        //Do some when page pull down.

    },
    startX: 0,
    startY: 0,
    begin: false,
    drawArr: [],
    touchStart: function (e) {
        this.setStyle();

        this.startX = e.touches[0].x
        this.startY = e.touches[0].y
        this.begin = true;
        this.context.beginPath();
        this.conversation.send(new TextMessage(JSON.stringify({ status: 'start', x: this.startX, y: this.startY })))
        // this.tunnel.emit('drawstart', { x: this.startX, y: this.startY });
    },
    touchMove: function (e) {
        if (this.begin) {
            this.context.moveTo(this.startX, this.startY)
            this.startX = e.touches[0].x
            this.startY = e.touches[0].y
            this.context.lineTo(this.startX, this.startY)
            this.context.stroke()
            this.context.closePath()
            wx.drawCanvas({
                canvasId: 'firstCanvas',
                reserve: true,
                actions: this.context.getActions() // 获取绘图动作数组
            })
            this.context.clearActions();
            this.drawArr.push({
                x: this.startX,
                y: this.startY
            })
        }
    },
    touchEnd: function () {
        console.log('touchEnd');
        // this.tunnel.emit('drawend', { drawarr: this.drawArr });
        this.conversation.send(new TextMessage(JSON.stringify({ status: 'end', drawarr: this.drawArr })));
        this.drawArr = [];
        this.begin = false;
    },
    clear: function () {
        this.conversation.send(new TextMessage(JSON.stringify({ status: 'clear' })));
        this.context.clearRect(0, 0, 750, 750);
        this.context.draw();
    },
    clearCanvas: function () {
        this.context.clearRect(0, 0, 750, 750);
        this.context.draw();
    },

    changeInputContent(e) {
        this.setData({ inputContent: e.detail.value });
    },
    sendMessage: function () {
        this.conversation.send(new TextMessage(this.data.inputContent))
            .then(message => {
                console.log('发送成功！');
                this.setData({
                    inputContent: ''
                })
            })
    },
    onShareAppMessage: function () {
        return {
            title: '我的画板',
            desc: '我的画板',
            path: '/pages/drawguessnew/index?roomid=' + this.conversation.id
        }
    },
    updateUser: function (callback) {
        wx.getUserInfo({
            success: ({userInfo}) => {
                const user = AV.User.current();
                user.set(userInfo).save().then(user => {
                    callback(user.toJSON());
                })
            },
            fail: function () {
            }
        });
    },
    memberQuery: function () {
        var query = new AV.Query('_User');
        const conversation = this.conversation;
        const self = this;
        // 查询房间所有者
        query.get(conversation.creator).then(function (creator) {
            const createrInfo = creator.toJSON();
            console.log('查询所有者');
            console.log(createrInfo);
            self.setData({
                nickname: createrInfo.nickName
            });
            wx.hideToast();
        });
        for (let i = 0; i < conversation.members.length; i++) {
            var mid = conversation.members[i];

            query.get(mid).then(function (creator) {
                const info = creator.toJSON();
                const peoples = self.data.peoples;
                peoples.push(info);
                self.setData({
                    peoples: peoples
                });
            });
        }
    },
    setStyle: function () {
        this.context.setStrokeStyle("#000000")
        this.context.setLineWidth(5)
        this.context.setLineCap('round') // 让线条圆润
    },
    _changePeople: function (mid, status) {
        return;
        var self = this;
        var query = new AV.Query('_User');
        query.get(mid).then(function (user) {
            const info = user.toJSON();
            var peoples = self.data.peoples;

            const hasPeoples = peoples.filter(function (item) {
                if (item.objectId == mid) {
                    return true;
                } else {
                    return false;
                }
            });
            if (status === 'enter') {
                if (hasPeoples.length() === 0) {
                    peoples.push(info);
                }
            } else {
                peoples = peoples.some(function (item) {
                    if (item == mid) {
                        return true;
                    } else {
                        return false;
                    }
                });
            }
            self.setData({
                peoples: peoples
            });
        });
    },
    kick: function () {
        const peoples = this.conversation.members.filter(function (item) {
            const user = AV.User.current().toJSON();
            if (item == user.objectId) {
                return false;
            } else {
                return true;
            }
        });

        this.conversation.remove(peoples);
    },
    goback: function () {
    },
    joinRoom: function (userInfo, options) {
        var roomid = '';
        for (var key in options) {
            if (options[key] == '') {
                roomid = key;
            } else {
                roomid = options[key];
            }
        }
        const realtime = new Realtime({
            appId: 'I0j7ktVKS8It7VRU8iEfQF2f-gzGzoHsz',
            noBinary: true,
        });
        realtime.on('disconnect', function() {
        console.log('网络连接已断开');
        });
        realtime.on('schedule', function(attempt, delay) {
        console.log(delay + 'ms 后进行第' + (attempt + 1) + '次重连');
        });
        realtime.on('retry', function(attempt) {
        console.log('正在进行第' + attempt + '次重连');
        });
        realtime.on('reconnect', function() {
            if (this.drawArr.length() > 0) {
                this.conversation.send(new TextMessage(JSON.stringify({ status: 'end', drawarr: this.drawArr })));
            }
            console.log('网络连接已恢复');
        });
        const self = this;
        console.log('创建对话：' + userInfo.objectId);
        realtime.createIMClient(userInfo.objectId).then(function (mine) {
            console.log('创建IMClient');
            var app = getApp();
            self.mine = mine;
            mine.on('message', function (message, conversation) {
                console.log(message.text);
                const content = JSON.parse(message.text);
                if (userInfo.objectId == message.from) return;
                if (content.status == 'start') {
                    self.setStyle();
                    self.context.beginPath()
                    self.context.moveTo(content.x, content.y)
                } else if (content.status == 'end') {
                    const drawarr = content.drawarr;
                    var len = drawarr.length;
                    for (var i = 0; i < len; i++) {
                        var item = drawarr[i];
                        self.context.lineTo(item.x, item.y)
                        self.context.stroke()
                    }
                    self.context.closePath()
                    wx.drawCanvas({
                        canvasId: 'firstCanvas',
                        reserve: true,
                        actions: self.context.getActions() // 获取绘图动作数组
                    })
                    self.context.clearActions();
                } else if (content.status == 'clear') {
                    self.clearCanvas()
                }
            });
            // 有用户被添加至某个对话
            mine.on('membersjoined', function membersjoinedEventHandler(payload, conversation) {
                console.log('membersjoined', payload.members, payload.invitedBy, conversation.id);
                self._changePeople(payload.members, 'enter');
            });
            // 有成员被从某个对话中移除
            mine.on('membersleft', function membersleftEventHandler(payload, conversation) {
                console.log('membersleft', payload.members, payload.kickedBy, conversation.id);
                self._changePeople(payload.members, 'leave');
            });
            // 当前用户被添加至某个对话
            mine.on('invited', function invitedEventHandler(payload, conversation) {
                console.log('invited', payload.invitedBy, conversation.id);
                self._changePeople(payload.members, 'enter');
            });
            // 当前用户被从某个对话中移除
            mine.on('kicked', function kickedEventHandler(payload, conversation) {
                console.log('kicked', payload.kickedBy, conversation.id);
                self._changePeople(payload.members, 'leave');
            });
            if (roomid) {
                // 进入别人的房间
                mine.getConversation(roomid)
                    .then(function (conversation) {
                        return conversation.add([userInfo.objectId]);
                    })
                    .then(function (conversation) {
                        console.log('加入别人房间成功', conversation.members);
                        console.log('房间ID: ' + conversation.id);
                        self.conversation = conversation;
                        self.memberQuery();
                    }).catch(console.error.bind(console));
            } else {
                // 创建并进入自己的房间
                if (userInfo.roomid) {
                    mine.getConversation(userInfo.roomid)
                        .then(function (conversation) {
                            return conversation.add([userInfo.objectId]);
                        })
                        .then(function (conversation) {
                            console.log('加入自己房间成功', conversation.members);
                            console.log('房间ID: ' + conversation.id);
                            self.conversation = conversation;
                            self.memberQuery();
                        }).catch(console.error.bind(console));
                } else {
                    mine.createConversation({
                        members: [userInfo.objectId],
                        name: userInfo.username,
                        transient: false,
                        unique: true,
                    })
                        .then(function (conversation) {
                            console.log('加入自己房间成功', conversation.members);
                            console.log('房间ID: ' + conversation.id);
                            const id = conversation.id;
                            self.conversation = conversation;
                            self.memberQuery();

                            const user = AV.User.current();
                            user.set('roomid', id);
                            user.save().then(function () {
                                console.log('保存roomid成功');
                            }, function () {
                                console.log(arguments);
                            });
                        })
                }

            }
        }, function (error) {
            console.log('创建IMClient失败');
            wx.showToast({
                title: '加载失败',
                icon: 'loading',
                duration: 500
            })
        })
    }
})