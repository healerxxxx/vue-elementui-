/*
 * @Description: file content
 * @Company: Netease
 * @Author: wangjing
 * @Date: 2020-05-06 02:20:29
 * @LastEditors: lijida
 * @LastEditTime: 2020-07-07 16:37:21
 */

export const personalSettings = {
  upNickname: '/api/admin/css/admin/update/nickname', // 更新运营昵称
  upAvatar: '/api/admin/css/admin/update/avatar', // 客服更新头像
  upShortCut: '/api/admin/css/admin/update/shortcut', // 更新快捷键
  addCustomer: '/api/admin/css/admin/add' // 新增客服
}

export const quickReply = {
  list: '/api/admin/css/fastReply/list', // 列表 ?typeId=0&offset=0&limit=10 类型 0-公共库 1-私人库
  add: '/api/admin/css/fastReply/add', // 新增
  update: '/api/admin/css/fastReply/update', // 更新
  search: '/api/admin/css/fastReply/search/key', // 搜索
  del: '/api/admin/css/fastReply/del' // 删除
}
