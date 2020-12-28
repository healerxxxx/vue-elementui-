/*
 * @Description: file content
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2020-05-06 02:20:29
 * @LastEditors: lijida
 * @LastEditTime: 2020-05-26 14:07:28
 */

export default {
  uploadImg: '/api/common/upload/{{serviceType}}' // 上传图片
}

export const upLogin = {
  upLoginStatus: '/api/admin/css/admin/update/loginStatus' // 更新客服状态
}

export const needNotice = '/api/admin/css/admin/update/needNotice' // 更新客服邮件提醒开关
export const adminKeepLive = '/api/admin/css/admin/keep/live' // 客服保活
export const wsAddress = '/api/admin/css/ws/client/access' // 获取ws链接地址
