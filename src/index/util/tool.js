/*
 * @Description: 工具类JS
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2018-12-19 15:09:58
 * @LastEditors: lijida
 * @LastEditTime: 2020-09-09 18:21:32
 */
import baseType from './base'
import { routerMap } from '../router'
import QRcode from './qrcode_lib/QRcode'
import QRErrorCorrectLevel from './qrcode_lib/QRErrorCorrectLevel'

/**
 * @description 获取keep-alive路由组件的name数组
 * @return {Array} 路由name的数组集合
 */
export const getAliveRoute = () => {
  const findRouteAlive = array => {
    if (!array || array.length === 0) return []
    let list = []
    array.map(item => {
      if (item.meta && item.meta.keepAlive) {
        list.push(item.name)
      }
      if (item.children) {
        list = [...list, ...findRouteAlive(item.children)]
      }
    })
    return list
  }
  return findRouteAlive(routerMap)
}

/**
 * @description 判断两个数组是否有相同值
 * @param {Array} arr1
 * @param {Array} arr2
 * @return {Boolean}
 */
export const arraySome = (arr1, arr2) => {
  return !arr1 || !arr2 ? false : !!arr1.filter(v => arr2.includes(v)).length
}

/**
 * @description base类型转换
 * @date 2018-12-19
 * @param {String} type base类型里包含的key，对应具体的类型
 * @param {Number} value 类型对应的id
 * @param {String} symbol 默认返回值
 * @returns {String} 返回值
 */
export const type2CH = (type, value, symbol, key) => {
  if (!type || !baseType[type] || typeof value === 'undefined') return ''
  let _arr = baseType[type]
  if ((key === 0 || key) && _arr[key]) {
    _arr = _arr[key]
  }
  let _val = null
  _arr.forEach(item => {
    if (parseInt(item.id) === parseInt(value)) {
      _val = item.name
    } else if (item.type && item.type === value) {
      _val = item.name
    }
  })
  return _val || symbol || ''
}

/**
 * @description 判断是否为Number类型
 * @date 2018-12-21
 * @param {Number} num 需要判断的值
 * @returns {boolean}
 */
export const isNumber = num => {
  return typeof num === 'number' && !isNaN(num)
}

/**
 * @description 数组根据对象某个key进行排序
 * @date 2018-12-21
 * @param {String} prop 对象key的值
 * @returns 函数比较
 */
export const objSort = (prop, desc) => {
  return function (objA, objB) {
    let valA = objA[prop]
    let valB = objB[prop]
    if (!isNumber(Number(valA)) && !isNumber(Number(valB))) {
      valA = Number(valA)
      valB = Number(valB)
    }
    if (desc) {
      return valA - valB < 0 ? 1 : valA - valB > 0 ? -1 : 0
    } else {
      return valA - valB < 0 ? -1 : valA - valB > 0 ? 1 : 0
    }
  }
}

/**
 * @description 格式化时间
 * @date 2018-12-24
 * @param {String} dt 时间
 * @param {*} fmt 格式
 * @returns {String} 格式化后的时间
 */
export const formatDate = (dt, fmt, symbol) => {
  if (!dt) return symbol || ''
  let date = new Date(dt)
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

/**
 * @description 去除字符串里是script & event事件，避免xss攻击
 * @date 2019-01-11
 * @param {String} str 要过滤的字符串
 * @returns 返回替换过的字符串
 */
export const removeScriptAndEvent = str => {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/<script.*?>.*?<\/script>/gim, '')
    .replace(/<[^>]+/g, function (match) {
      return match.replace(/ (on\w+=)/g, ' _$1')
    })
}

/**
 * @description: 正则表达式对象
 */
/* eslint-disable */
export const validate = {
  url: /^((http|https|ftp):\/\/)(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,=]|:|@)|\/|\?)*)?$/i
}
/* eslint-disable */

/**
 * @description: 删除对象中值为空的属性
 * @param {object}
 * @return: 返回删除空属性的对象
 */
export const deleteObjEmpty = obj => {
  if (!(typeof obj === 'object')) {
    return
  }
  for (var key in obj) {
    if (
      obj.hasOwnProperty(key) &&
      (obj[key] === null || obj[key] === undefined || obj[key] === '')
    ) {
      delete obj[key]
    }
  }
  return obj
}

/**
 * @description 获取富文本的字数
 * @param {String} 对应富文本的内容
 * @return {Number} 字数
 */
export const getWordCount = content => {
  let wordCount = 0
  let div = document.createElement('div')
  div.innerHTML = content
  div.style.display = 'none'
  let text = div.textContent || div.innerText
  wordCount = text.trim().replace(/\s+/g, ' ').length
  return wordCount
}

/**
 * @description: 获取图像Element对象，canvas用
 * @param {String} src 图像链接
 * @param {Number} width 图像宽度
 * @param {Number} height 图像高度
 * @return {Object} 图像Element对象
 */
export const getImageObject = (src, width, height) => {
  width = width || 100
  height = height || width
  // 兼容XMLHttpRequest
  function createXHR() {
    let xhr = null
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest()
    } else if (window.XMLHttpRequest) {
      try {
        xhr = new ActiveXObject('Msxml2.XMLHTTP')
      } catch (e) {
        try {
          xhr = new ActiveXObject('Microsoft.XMLHTTP')
        } catch (e) {}
      }
    }
    return xhr
  }
  // 返回Promise对象
  return new Promise((resolve, reject) => {
    if (!src) reject(new Error('no image src'))
    let img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = `${src}?imageView&thumbnail=${width}y${height}&quality=85`
    img.onload = () => {
      resolve(img)
    }
    img.onerror = e => {
      const xhr = createXHR()
      if (!xhr) reject(new Error('XMLHttpRequest error'))
      xhr.open('GET', src, true)
      xhr.responseType = 'blob'
      xhr.onload = function() {
        const _img = new Image()
        const url = URL.createObjectURL(this.response)
        _img.onload = function() {
          resolve(_img)
          URL.revokeObjectURL(url)
        }
        _img.src = url
      }
      xhr.onerror = function(err) {
        reject(err)
      }
      xhr.send()
    }
  })
}

/**
 * @description: 根据链接生成二维码
 * @param {Object} options 配置对象，可以为string
 * @return {Object} 返回canvas的Element对象
 */
export const qrcode = options => {
  const defaultOptions = {
    width: 256,
    height: 256,
    typeNumber: -1,
    correctLevel: QRErrorCorrectLevel.H,
    background: '#ffffff',
    foreground: '#000000'
  }
  options = Object.assign(
    defaultOptions,
    typeof options === 'string' ? { text: options } : options
  )
  let _QRcode = new QRcode(options.typeNumber, options.correctLevel)
  _QRcode.addData(options.text)
  _QRcode.make()
  let canvas = document.createElement('canvas')
  canvas.style.display = 'none'
  canvas.width = options.width
  canvas.height = options.height
  let ctx = canvas.getContext('2d')
  let tileW = options.width / _QRcode.getModuleCount()
  let tileH = options.height / _QRcode.getModuleCount()
  for (let row = 0; row < _QRcode.getModuleCount(); row++) {
    for (let col = 0; col < _QRcode.getModuleCount(); col++) {
      ctx.fillStyle = _QRcode.isDark(row, col)
        ? options.foreground
        : options.background
      let w = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW)
      let h = Math.ceil((row + 1) * tileH) - Math.floor(row * tileH)
      ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h)
    }
  }
  return canvas
}

/**
 * @description: 下载图片
 * @param {String} src 图片下载链接
 * @param {String} name 保存图片名称
 * @param {String} type 保存图片的类型
 */
export const imageDownLoad = (src, name, type) => {
  if (!src) return
  name = name || '未命名'
  type = type || 'jpg'
  const link = document.createElement('a')
  link.href = src
  link.download = `${name}.${type}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * @description: 绘制圆角矩形
 * @param {Object} ctx canvas的上下文环境
 * @param {Number} width 矩形的宽度
 * @param {Number} height 矩形的高度
 * @param {Number} radius 圆的半径
 */
export const drawRoundRectPath = (ctx, width, height, radius) => {
  ctx.beginPath(0)
  ctx.arc(width - radius, height - radius, radius, 0, Math.PI / 2)
  ctx.lineTo(radius, height)
  ctx.arc(radius, height - radius, radius, Math.PI / 2, Math.PI)
  ctx.lineTo(0, radius)
  ctx.arc(radius, radius, radius, Math.PI, (Math.PI * 3) / 2)
  ctx.lineTo(width - radius, 0)
  ctx.arc(width - radius, radius, radius, (Math.PI * 3) / 2, Math.PI * 2)
  ctx.lineTo(width, height - radius)
  ctx.closePath()
}

/**
 * @description: 该方法用来绘制圆角矩形
 * @param {Object} ctx canvas的上下文环境
 * @param {Number} x 左上角x轴坐标
 * @param {Number} y 左上角y轴坐标
 * @param {Number} width 矩形的宽度
 * @param {Number} height 矩形的高度
 * @param {Number} radius 圆的半径
 * @param {Number} lineWidth border宽度
 * @param {String} strokeColor 填充颜色
 */
export const strokeRoundRect = (
  ctx,
  x,
  y,
  width,
  height,
  radius,
  lineWidth,
  strokeColor
) => {
  if (2 * radius > width || 2 * radius > height) return
  ctx.save()
  ctx.translate(x, y)
  drawRoundRectPath(ctx, width, height, radius)
  ctx.lineWidth = lineWidth || 1
  ctx.strokeStyle = strokeColor || '#000'
  ctx.stroke()
  ctx.restore()
}

/**
 * @description: 该方法用来绘制一个有填充色的圆角矩形
 * @param {Object} ctx canvas的上下文环境
 * @param {Number} x 左上角x轴坐标
 * @param {Number} y 左上角y轴坐标
 * @param {Number} width 矩形的宽度
 * @param {Number} height 矩形的高度
 * @param {Number} radius 圆的半径
 * @param {String} fillColor 填充颜色
 */
export const fillRoundRect = (ctx, x, y, width, height, radius, fillColor) => {
  if (2 * radius > width || 2 * radius > height) return
  ctx.save()
  ctx.translate(x, y)
  drawRoundRectPath(ctx, width, height, radius)
  ctx.fillStyle = fillColor || '#000'
  ctx.fill()
  ctx.restore()
}

/**
 * @description: canvas绘制文字换行
 * @param {Object} context canvas的上下文环境
 * @param {String} text 绘制的文字
 * @param {Number} x 左上角x轴坐标
 * @param {Number} y 左上角y轴坐标
 * @param {Number} maxWidth 最大宽度
 * @param {Number} lineHeight 行高
 */
export const canvasDrawText = (context, text, x, y, maxWidth, lineHeight) => {
  if (
    !context ||
    typeof text !== 'string' ||
    typeof x !== 'number' ||
    typeof y !== 'number'
  )
    return
  const canvas = context.canvas
  if (typeof maxWidth === 'undefined') {
    maxWidth = (canvas && canvas.width) || 300
  }
  if (typeof lineHeight === 'undefined') {
    lineHeight =
      (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) ||
      parseInt(window.getComputedStyle(document.body).lineHeight)
  }
  const arrText = text.split('')
  let line = ''
  arrText.forEach((item, index) => {
    let testLine = line + item
    let metrics = context.measureText(testLine)
    let testWidth = metrics.width
    if (testWidth > maxWidth && index > 0) {
      context.fillText(line, x, y)
      line = item
      y += lineHeight
    } else {
      line = testLine
    }
  })
  context.fillText(line, x, y)
}

/**
 * @description: 双击进行复制
 * @param {Object} target 目标element对象
 */
export const dblClickCopy = target => {
  if (!target.innerText) return Promise.reject(new Error('缺少目标对象'))
  if (window.clipboardData && window.clipboardData.setData) {
    clipboardData.setData('Text', target.innerText)
    return Promise.resolve()
  } else if (
    document.queryCommandSupported &&
    document.queryCommandSupported('copy')
  ) {
    var textarea = document.createElement('textarea')
    textarea.textContent = target.innerText
    textarea.style.position = 'fixed'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      return Promise.resolve()
    } catch (ex) {
      return Promise.reject(new Error('复制失败，请手动复制'))
    } finally {
      document.body.removeChild(textarea)
    }
  }
}
