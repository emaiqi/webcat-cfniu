var loginService = require('../../../service/loginService.js');
var http = require('../../../service/httpService.js');
var modal = require('../../../util/modal.js');
var wxUtil = require('../../../util/wxUtil.js');
var constant = require('../../../util/constant.js');

Page({
  data: {
    foucs:null,
    loginForm: {
      username: null,
      password: null
    }
  },
  focusInput: function(e) {
    this.setData({
      foucs: e.target.id
    });
  },
  blurInput: function(e) {
    this.setData({
      foucs: null
    });
  },
  // 保存参数
  saveForm: function(e) {
    this.data.loginForm[e.target.id] = e.detail.value;
    this.setData({
      loginForm: this.data.loginForm
    });
  },
  // 登录ajax
  login: function() {
    var that = this;
    http.commonRequest(this.data.loginForm, '/user/login', 'POST', that, 'loginValid').then(function(data) {
      if (data.success) {
        // modal.showTipModal('登录成功');
        loginService.saveLoginInfo(data).then(function() {
          wxUtil.switchTab('../../index/index');
        }, function(err) {
          modal.showToastModal(err.resultMsg, 'loading');
        });

      } else {
        modal.showTipModal(constant.respText.LOGIN_FAIL);
      }
    }, function(err) {
      modal.showTipModal(err.resultMsg);
    });
  },
  onLoad: function() {}
});
