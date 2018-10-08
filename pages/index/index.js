//index.js
//获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext() 
const fileSystemManager = wx.getFileSystemManager()
var tempFilePath;

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  start_record: function () {
    const options = {
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50,
    }
    this.setData({
      text_record: ''
    })
    recorderManager.start(options);
    this.setData({
      text_record:'Start recording...'
    })
    recorderManager.onStart(() => {
      console.log('Recording...')
    });
    recorderManager.onError((result) => {
      console.log(result)
    });
  },
  stop: function () {
    recorderManager.stop();
    this.setData({
      text_record: ' '
    })
    recorderManager.onStop((result) => {
      this.tempFilePath = result.tempFilePath;
      this.setData({
        temp_file_path: this.tempFilePath
      })
      console.log('Stopping...', result.tempFilePath)
    });
    wx.uploadFile({
      url: 'https://example.weixin.qq.com/upload',
      filePath: this.tempFilePath,
      name: 'recordFile',
      success(res) {
        const data = res.data
        console.log(data)
      }
    })
  },
  replay: function () {
    this.setData({
      text_replay: 'replay...'
    })
    innerAudioContext.autoplay = true,
    innerAudioContext.src = this.tempFilePath,
    innerAudioContext.onPlay(() => {
      console.log('Playing...')
    })
    innerAudioContext.onEnded(() => {
      this.setData({
        text_replay: ''
      })
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
  recognize: function() {
    wx.downloadFile({
      url: 'https://example.com/audio/123', //仅为示例，并非真实的资源
      success(res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          // 提取文件中的文字
          const filePath = res.tempFilePath
          let text_recog = fileSystemManager.readFile({
            filePath: filePath
          })
          this.setData({
            text_record: text_recog
          })
        }
        else {
          console.log('File not created.')
        }
      }
    })
  },
  openSetting: function () {
    var that = this
    if (wx.openSetting) {
      wx.openSetting({
        success: function (res) {
          //尝试再次登录
          that.login()
        }
      })
    }
  }
})
