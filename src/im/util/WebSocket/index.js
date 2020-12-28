import UUID from './UUID'

const sendObj = {}

class websocket {
  constructor (options) {
    this.config = {
      headers: {
        ack: true
      },
      body: '',
      heartTimer: 29 * 1000,
      statusCallback () {
      },
      noPongTimes: 3
    }

    this.config = Object.assign(this.config, options)
    if (!/^ws(s)?:\/\//.test(this.config.url)) {
      this.config.url = 'ws://' + this.config.url
    }

    /**
     * 订阅类型对象
     * 对象以channel和mq结合作为key值储存
     * 对应的value则为订阅的发送的参数
     * 新的订阅建立新的值，如果存在就不再重新订阅
     * 如果取消之前的订阅，则从对象中删除，并执行取消订阅操作
     */
    this.subObject = {}
    this.subId = {}
    this.pingIds = [] // ping id 存储，如果超过3个值，则进行重连，收到pong则清空
    this.sidObj = {}

    this.socket = null // socket对象
    this.status = null // websocket状态
    this.lockReconnect = false // 重连锁定

    this.connect() // 初始化websocket连接
  }

  connect () {
    const _WebSocket = window.WebSocket || window.MozWebSocket
    // 检测浏览器支持
    if (!_WebSocket) {
      this.status = 'NOT_SUPPORT'
      this.config.statusCallback(this.status)
      return false
    }

    this.socket = new _WebSocket(this.config.url) // 创建连接并注册响应函数
    this.status = 'CONNECTING'
    this.config.statusCallback(this.status)
    // 建立连接响应
    this.socket.onopen = e => {
      this.status = 'OPEN'
      this.config.statusCallback(this.status)
      this.keepHeart() // 执行心跳

      // 循环订阅对象，进行重新订阅(为重连继续能够自动订阅到内容)
      for (const key in this.subObject) {
        const _value = this.subObject[key] // 将存在的订阅频道值取出来
        _value.success = false
        this.sub({ headers: _value.headers, body: _value.body }, true) // 发起订阅
      }
    }

    // 消息响应
    this.socket.onmessage = e => {
      const res = JSON.parse(e.data)

      if (res.headers) {
        const _id = res.headers.sourceId || res.headers.id
        if (sendObj[_id]) {
          const sendData = sendObj[_id]
          if (sendData.timer) {
            clearTimeout(sendData.timer)
          }
          if (res.status === 200) {
            if (sendData.resolveFn) {
              sendData.resolveFn(res)
            }
          } else {
            if (sendData.rejectFn) {
              sendData.rejectFn(res)
            }
          }
          delete sendObj[_id]
        }
        // 处理 pong
        if (res.headers.cmd === 'pong') {
          if (this.pingIds.indexOf(_id) > -1) {
            this.pingIds = []
          }
          return false
        }

        // 处理sid
        if (_id === this.sidObj.id) {
          this.sidObj.resolveFn && this.sidObj.resolveFn(res)
          return
        }

        // 处理订阅与取消订阅
        const _key = this.subId[_id]
        if (_key) {
          const _obj = this.subObject[_key]
          if (_obj.cmd === 'sub') {
            if (res.status === 200) {
              _obj.success = true
              _obj.resolveFn && _obj.resolveFn(res)
              clearTimeout(_obj.timer)
            } else {
              this.reSub(_key, res)
            }
          } else if (_obj.cmd === 'unSub') {
            if (res.status === 200) {
              clearTimeout(_obj.timer)
              _obj.resolveFn && _obj.resolveFn(res)
              delete this.subObject[_key]
            } else {
              this.reUnSub(_key, res)
            }
          }
        }

        delete this.subId[_id]
      }

      this.message(res)
    }

    // 关闭响应
    this.socket.onclose = e => {
      this.status = 'CLOSE'
      this.config.statusCallback(this.status)
    }

    // 错误响应
    this.socket.onerror = e => {
      this.status = 'ERROR'
      this.config.statusCallback(this.status)
    }
  }

  // 处理消息
  message (message) {
    // console.log(message)
  }

  // 保持心跳
  keepHeart () {
    if (!this.socket || this.socket.readyState !== 1) return // 链接不处于open状态直接返回
    // 多次收不到pong则进行重连
    if (this.pingIds.length >= this.config.noPongTimes) {
      this.socket.close()
      return
    }

    const _id = UUID()
    this.pingIds.push(_id)
    clearTimeout(this.keepHeartTimer)

    this.send({
      headers: {
        cmd: 'ping',
        id: _id
      }
    })

    this.keepHeartTimer = setTimeout(() => {
      this.keepHeart()
    }, this.config.heartTimer)
  }

  // 获取SID
  getId () {
    return new Promise((resolve) => {
      const _id = UUID()
      this.sidObj = {
        id: _id,
        resolveFn: function (res) {
          resolve(res)
        }
      }
      this.send({
        headers: {
          ack: true,
          cmd: 'sid',
          id: _id
        }
      })
    })
  }

  // 自动重新订阅 7次之后不再进行重新订阅
  reSub (key, err) {
    const _obj = this.subObject[key]
    _obj.number++
    if (_obj.number > 7) {
      clearTimeout(_obj.timer)
      _obj.rejectFn && _obj.rejectFn(err)
      delete this.subObject[key]
    } else {
      clearTimeout(_obj.timer)
      _obj.timer = setTimeout(() => {
        this.sub({ headers: _obj.headers, body: _obj.body }, true)
      }, Math.pow(2, _obj.number) * 1000)
    }
  }

  // 自动取消订阅
  reUnSub (key, err) {
    const _obj = this.subObject[key]
    _obj.number++
    if (_obj.number > 7) {
      clearTimeout(_obj.timer)
      _obj.rejectFn && _obj.rejectFn(err)
      delete this.subObject[key]
    } else {
      clearTimeout(_obj.timer)
      _obj.timer = setTimeout(() => {
        this.unSub({ headers: _obj.headers, body: _obj.body }, true)
      }, Math.pow(2, _obj.number) * 1000)
    }
  }

  /**
   * @description: 手动订阅
   * @param {Object} params {headers: {}, body: {}}
   */
  sub (params, isRe) {
    let _key = ''
    if (params && params.headers && params.headers.mq) {
      _key += params.headers.mq
    }
    if (params && params.headers && params.headers.channel) {
      _key += params.headers.channel
    }
    // 设置发送数据
    const _id = UUID()
    this.subId[_id] = _key
    const _obj = {
      headers: Object.assign(this.config.headers, { cmd: 'sub', id: _id }, params && params.headers ? params.headers : {}),
      body: Object.assign(this.config.body, params && params.body ? params.body : {})
    }
    if (isRe) {
      if (typeof this.subObject[_key].success === 'undefined' || this.subObject[_key].success) return
      if (this.subObject[_key].cmd === 'unSub') {
        this.subObject[_key].cmd = 'sub'
        this.subObject[_key].number = 0
      }
      this.send(_obj)
    } else {
      return new Promise((resolve, reject) => {
        this.send(_obj)
        this.subObject[_key] = Object.assign({
          success: false,
          number: 0,
          timer: null,
          cmd: 'sub',
          resolveFn: function (res) {
            resolve(res)
          },
          rejectFn: function (err) {
            reject(err)
          }
        }, params)
      })
    }
  }

  /**
   * @description: 取消订阅
   * @param {Object} params {headers: {}, body: {}}
   */
  unSub (params, isRe) {
    // 取channel & mq为key值
    let _key = ''
    if (params && params.headers && params.headers.mq) {
      _key += params.headers.mq
    }
    if (params && params.headers && params.headers.channel) {
      _key += params.headers.channel
    }
    if (!this.subObject[_key]) return // 如果没有对应的key则返回
    const _id = UUID()
    this.subId[_id] = _key
    const _obj = {
      headers: Object.assign(this.config.headers, { cmd: 'unSub', id: _id }, params && params.headers ? params.headers : {}),
      body: Object.assign(this.config.body, params && params.body ? params.body : {})
    }
    if (this.subObject[_key].cmd === 'sub') {
      this.subObject[_key].cmd = 'unSub'
      this.subObject[_key].number = 0
    }
    if (isRe) {
      this.send(_obj)
    } else {
      return new Promise((resolve, reject) => {
        this.send(_obj)
        this.subObject[_key].resolveFn = res => resolve(res)
        this.subObject[_key].rejectFn = err => reject(err)
      })
    }
  }

  // 发送数据，传入Object，发送前转换为JSON
  send (data) {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === 1) {
        let _data = null
        let id = UUID()
        if (typeof data === 'object') {
          if (data && data.headers && !data.headers.id) {
            data.headers.id = id
          } else {
            id = data.headers.id
          }
          _data = JSON.stringify(data)
        } else {
          _data = JSON.stringify(data)
        }
        sendObj[id] = data
        sendObj[id].resolveFn = res => resolve(res)
        sendObj[id].rejectFn = err => reject(err)
        sendObj[id].timer = setTimeout(() => {
          reject(new Error('socket send 15s timeout'))
        }, 15000)
        this.socket.send(_data)
      } else {
        return reject(new Error('the scoket is not open '))
      }
    })
  }
}

export default websocket
