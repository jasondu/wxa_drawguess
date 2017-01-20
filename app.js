/**
 * @fileOverview 微信小程序的入口文件
 */

var qcloud = require('./vendor/qcloud-weapp-client-sdk/index');
var config = require('./config');

var AV = require('./libs/av-weapp-min.js');

App({
    /**
     * 小程序初始化时执行，我们初始化客户端的登录地址，以支持所有的会话操作
     */
    onLaunch() {
        qcloud.setLoginUrl(config.service.loginUrl);
        AV.init({ 
            appId: 'I0j7ktVKS8It7VRU8iEfQF2f-gzGzoHsz', 
            appKey: 'HQnWJgW74MBMDCB7Es43nzQy', 
        });
    }
});