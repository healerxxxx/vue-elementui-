/*
 * @Description: 工具类JS
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2018-12-19 15:09:58
 * @LastEditors: lijida
 * @LastEditTime: 2020-05-22 16:10:56
 */
import { routerMap } from '../router'

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
 * @description: 双击进行复制
 * @param {Object} target 目标element对象
 */
export const dblClickCopy = target => {
  if (!target.innerText) return Promise.reject(new Error('缺少目标对象'))
  if (window.clipboardData && window.clipboardData.setData) {
    window.clipboardData.setData('Text', target.innerText)
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

/**
 * @description 函数节流，多少ms内只执行一次
 * @param {Function} fun 节流函数
 * @param {Number} delay 节流时间 ms
 */
export const throttle = (fun, delay) => {
  let last, deferTimer
  return function (args) {
    const that = this
    const _args = arguments
    const now = +new Date()
    if (last && now < last + delay) {
      clearTimeout(deferTimer)
      deferTimer = setTimeout(function () {
        last = now
        fun.apply(that, _args)
      }, delay)
    } else {
      last = now
      fun.apply(that, _args)
    }
  }
}

/**
 * @description 函数防抖，多少ms之后不重复触发函数再进执行
 * @param {Function} fun 防抖函数
 * @param {delay} 防抖时间 ms
 */
export function debounce (fun, delay) {
  return function (args) {
    const that = this
    const _args = args
    clearTimeout(fun.id)
    fun.id = setTimeout(function () {
      fun.call(that, _args)
    }, delay)
  }
}

export function random (min, max) {
  return Math.floor(min + Math.random() * (max - min))
}
