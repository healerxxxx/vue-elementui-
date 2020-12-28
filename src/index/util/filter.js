/*
 * @Description: 过滤器
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2018-12-19 17:19:44
 * @LastEditors: lijida
 * @LastEditTime: 2020-04-03 17:59:50
 */
import {
  type2CH,
  isNumber,
  formatDate
} from './tool'
/**
 * @description 商品类型
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const goods2CH = ([val, key]) => {
  return type2CH('goodsType', val, '-', key)
}
/**
 * @description 支付平台类型
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const payTerminal2CH = ([val, key]) => {
  return type2CH('payTerminal', parseInt(val), '-', key)
}
/**
 * @description push、消息跳转类型
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const urlRedirect2CH = (val) => {
  return type2CH('urlRedirectType', val, '-')
}
/**
 * @description 方案状态
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const articleStatus2CH = (val) => {
  return type2CH('articleStatus', val, '-')
}
/**
 * @description 赛事状态
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const matchStatus2CH = (val) => {
  return type2CH('matchStatus', val, '-')
}
/**
 * @description TCM赛事状态
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const tcmMatchStatus2CH = (val) => {
  return type2CH('tcmMatchStatus', val, '-')
}
/**
 * @description TCM商品类型
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const tcmMall2CH = (val) => {
  return type2CH('tcmMallType', val, '-')
}
/**
 * @description TCM商品订单类型
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const tcmMallOrder2CH = (val) => {
  return type2CH('tcmMallOrderStatus', val, '-')
}
/**
 * @description TCM竞猜订单类型
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const tcmOrder2CH = (val) => {
  return type2CH('tcmOrderStatus', val, '-')
}
/**
 * @description 充值订单类型
 * @param {Number} val 过滤器转换的值
 * @return {String} 目标值
 */
export const rechargeOrder2CH = (val) => {
  return type2CH('rechargeOrderStatus', parseInt(val), '-')
}

// /**
//  * @description: app来源
//  * @param {Number | String} val 过滤器转换的值
//  * @return: {String} 目标值
//  */
// export const appSource2CH = (val) => {
//   return type2CH('appSource', parseInt(val), '-')
// }
/**
 * @description: 商品订单状态
 * @param {Number} val 过滤器转换的值
 * @return: {String} 返回值
 */
export const productOrderStatus2CH = (val) => {
  return type2CH('productOrderStatus', parseInt(val), '-')
}

/**
 * @description: 商品订支付方式
 * @param {Number} val 过滤器转换的值
 * @return: {String} 返回值
 */
export const productPayType2CH = ([val, type]) => {
  return type2CH('productPayType', parseInt(val), '-', type)
}

/**
 * @description: 文章类型
 * @param {Number} val 过滤器转换的值
 * @return: {String} 返回值
 */
export const threadType2CH = (val) => {
  return type2CH('threadType', val, '-')
}

/**
 * @description 小数转换为百分比
 * @date 2018-12-21
 * @param {Number} num 需要转换的数字
 * @param {String} tag 非法情况下默认输出
 */
export const toPercent = (num, tag) => {
  if (isNumber(num)) {
    return Math.round(num * 10000) / 100 + '%'
  }
  return tag || ''
}

/**
 * @description 时间过滤
 * @date 2018-12-25
 * @param {String} val 时间
 * @param {String} fmt 时间格式
 * @returns 新时间格式
 */
export const dateFormat = ([val, fmt, symbol]) => {
  return formatDate(val, fmt, symbol)
}

/**
 * @description 支付通道
 * @date 2019-03-06
 * @param {String} val 支付id
 * @returns {String} 返回值
 */
export const payChannel2CH = ([val]) => {
  return type2CH('payChannel', val, '-')
}

/**
 * @description 专家类型
 * @date 2019-03-12
 * @param {String} val 专家id
 * @returns {String} 返回值
 */
export const accountType2CH = ([val]) => {
  return type2CH('accountType', val, '-')
}

/**
 * @description 专家地区
 * @date 2019-03-12
 * @param {String} val 专家id
 * @returns {String} 返回值
 */
export const region2CH = ([val]) => {
  return type2CH('region', val, '-')
}

/**
 * @description 心愿卡状态
 * @date 2019-03-29
 * @param {String} val 状态id
 * @returns {String} 返回心愿卡状态
 */
export const questionStatus2CH = (val) => {
  return type2CH('questionStatus', val, '-')
}

/**
 * @description 优惠券类型
 * @date 2019-04-03
 * @param {String} val 状态id
 * @returns {String} 返回优惠券类型
 */
export const couponType2CH = (val) => {
  return type2CH('couponType', val, '-')
}

/**
 * @description VIP类型
 * @date 2019-07-02
 * @param {String} val 类型id
 * @returns {String} 返回VIP类型
 */
export const vipLevel2CH = (val) => {
  return type2CH('vipLevel', val, '-')
}
