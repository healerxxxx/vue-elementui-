/*
 * @Description: 过滤器
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2020-05-19 12:18:44
 * @LastEditors: lijida
 * @LastEditTime: 2020-05-19 12:19:14
 */
import { formatDate } from './tool'

/**
 * @description 时间过滤
 * @date 2020-05-19
 * @param {String} val 时间
 * @param {String} fmt 时间格式
 * @returns 新时间格式
 */
export const dateFormat = ([val, fmt, symbol]) => {
  return formatDate(val, fmt, symbol)
}
