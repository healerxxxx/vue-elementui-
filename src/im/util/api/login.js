/*
 * @Description: login
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2020-05-06 02:20:19
 * @LastEditors: lijida
 * @LastEditTime: 2020-05-06 02:22:33
 */

export const login =
  process.env.NODE_ENV === 'development'
    ? '/mock/login.json'
    : '/api/admin/login' // 用于校验判断是否登陆成功
export const logout = '/api/admin/logout' // 登出
export const userInfo =
  process.env.NODE_ENV === 'development'
    ? '/mock/getLoginInfo.im.json'
    : '/api/admin/css/admin/get/adminInfo' // 获取用户信息
