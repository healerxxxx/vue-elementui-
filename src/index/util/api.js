/*
 * @Description: API请求接口，如果包含0、1对象，则0为对应的红彩主包，1为精准比分
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2018-12-19 15:32:41
 * @LastEditors: lijida
 * @LastEditTime: 2020-10-28 16:38:34
 */

/**
 * @Description: 登录相关接口
 */
export const loginApi = {
  login:
    process.env.NODE_ENV === 'development'
      ? '/mock/login.json'
      : '/api/admin/login', // 用于校验判断是否登陆成功
  logout: '/api/admin/logout', // 登出
  userInfo:
    process.env.NODE_ENV === 'development'
      ? '/mock/getLoginInfo.json'
      : '/api/admin/getLoginInfo' // 获取用户信息
}
/**
 * @Description: 一些公用的API
 */
export const CommonApi = {
  uploadImg: '/api/common/upload/{{serviceType}}', // 上传图片
  uploadImgUncheck: '/api/common/upload/adminInner', //  上传不审核图片
  lotteryCategory: '/api/admin/lotteryCategory/getAll', // 获取彩种分类
  leagueSearch: '/api/admin/matchInfo/leagueMatch/search', // 服务端搜索联赛
  token: '/api/admin/admin/getToken', // 从服务端获取token，主要为添加管理员时用
  couponSimpleInfoById: '/api/admin/coupon/getSimpleInfo/{{couponId}}', // 获取优惠券详情
  poindCardInfoById: '/api/admin/drawLottery/get/pointCard', // 获取点卡详情
  refundVipService: '/api/admin/thread/order/handle/refund', // 大会员退款
  switchAdd: '/api/admin/switch/addDict', // 开关新增 ?firstLevelType=zccba_cmsdoc_switch
  switchInfo: '/api/admin/switch/getSwitch', // 查询开关 ?firstLevelType=zccba_cmsdoc_switch
  switchUpdate: '/api/admin/switch/updateDict' // 开关更新 ?firstLevelType=zccba_cmsdoc_switch
}
/**
 * @Description: 竞彩文章 - 列表相关接口
 */
export const QuizListApi = {
  filterList: '/api/admin/thread/geThreadList/{{pageIndex}}/{{pageSize}}', // 根据查询条件获取方案列表
  searchList: '/api/admin/thread/searchThread/{{pageIndex}}/{{pageSize}}', // 根据搜索条件获取方案列表
  buyChannelList: '/api/admin/thread/getThreadBuyChannelTypeList', // 不同渠道的渠道列表
  modifyWeight: '/api/admin/thread/{{threadId}}/updateWeight/{{weight}}', // 修改方案权重
  voteSupport: '/api/admin/thread/updateVoteSupport/{{threadId}}' // 修改方案支持量
}
/**
 * @Description: 竞彩文章 - 方案详情
 */
export const QuizDetail = {
  query: '/api/admin/thread/query/{{threadId}}', // 竞猜方案 详情
  update: '/api/admin/thread/updateByOperation/{{threadId}}', // 更新方案
  offline: '/api/admin/thread/{{threadId}}/offline', // 方案下线
  reviewUpdate: '/api/admin/thread/updatePlanReview/{{threadId}}', // 更新方案复盘内容
  reviewDel: '/api/admin/thread/delPlanReview/{{threadId}}', // 删除方案复盘内容
  reasonDel: '/api/admin/thread/delBuyReason/{{threadId}}', // 删除文章购买理由
  numLotteryUpdate: '/api/admin/numThread/updateByOperation/{{threadId}}', // 数字彩更新方案内容
  delBuyReason: '/api/admin/numThread/delBuyReason/{{threadId}}' // 删除数字彩文章购买理由
}
/**
 * @description: 复盘文章 - 列表
 */
export const ReviewList = {
  list: '/api/admin/thread/getReplayThreadList/{{pageIndex}}/{{pageSize}}', // 列表
  search: '/api/admin/thread/searchThreadReplay/{{pageIndex}}/{{pageSize}}' // 搜索
}
/**
 * @description: 普通文章 - 列表
 */
export const ThreadList = {
  list: '/api/admin/cms/getCmsDocList/{{pageIndex}}/{{pageSize}}', // 列表
  weight: '/api/admin/cms/updateAppWeight/{{id}}', // 修改普通文章在APP内的权重
  inactivate: '/api/admin/cms/inactivateDoc/{{id}}', // 隐藏文章
  activate: '/api/admin/cms/activateDoc/{{id}}' // 显示文章
}
/**
 * @description: 数字彩文章 - 列表
 */
export const NumLotteryList = {
  filterList: '/api/admin/numThread/list', // 列表
  modifyWeight: '/api/admin/numThread/updateWeight/{{threadId}}' // 修改权重
}
/**
 * @Description: 权限管理-用户管理
 */
export const AuthUser = {
  adminList: '/api/admin/admin/getAdminList', // 获取管理员列表
  adminAdd: '/api/admin/admin/addAdmin', // 增加管理者
  adminUpdate: '/api/admin/admin/modifyAdmin', // 修改管理员
  adminDel: '/api/admin/admin/removeAdmin' // 删除管理员
}
/**
 * @Description: 权限管理-角色管理
 */
export const AuthRoles = {
  rolesList: '/api/admin/role/getRoleList', // 权限管理角色列表
  rolesAdd: '/api/admin/role/addRole', // 权限管理角色更新
  rolesUpdate: '/api/admin/role/modifyRole', // 权限管理角色更新
  rolesDel: '/api/admin/role/removeRole', // 权限管理角色删除
  resourceById: '/api/admin/role/getResourcesByRoleId', // 获取角色对应的权限分配
  resourceByIdUpdate: '/api/admin/role/roleAuth' // 角色权限分配更新
}
/**
 * @Description: 权限管理-API
 */
export const AuthApi = {
  apiList: '/api/admin/resource/getResourceList', // 权限管理API列表
  apiAdd: '/api/admin/resource/addResource', // 增加API
  apiUpdate: '/api/admin/resource/modifyResource', // 更新API
  apiDel: '/api/admin/resource/removeResource' // 删除API
}
/**
 * @Description: 版本维护-发布新版
 */
export const AppVersion = {
  0: {
    list: '/api/admin/version/list', // 列表
    add: '/api/admin/version/insert', // 新增版本信息
    update: '/api/admin/version/modify', // 更新版本信息
    del: '/api/admin/version/del', // 删除
    updateAll: '/api/admin/version/batch/update' // 一键更新全部信息
  },
  1: {
    list: '/api/admin/jzbf/version/list', // 列表
    add: '/api/admin/jzbf/version/insert', // 新增版本信息
    update: '/api/admin/jzbf/version/modify', // 更新版本信息
    del: '/api/admin/jzbf/version/del', // 删除
    updateAll: '/api/admin/jzbf/version/batch/update' // 一键更新全部信息
  }
}
/**
 * @Description: 版本维护-android热修复
 */
export const AppHotFix = {
  0: {
    hotFixList: '/api/admin/hotfix/list/{{offset}}/{{limit}}', // 热修复列表
    hotFixAdd: '/api/admin/hotfix/save', // 热修复新增
    hotFixUpdate: '/api/admin/hotfix/modify', // 热修复修改
    hotFixDel: '/api/admin/hotfix/delete/{{hotfixId}}' // 热修复删除
  },
  1: {
    hotFixList: '/api/admin/jzbf/hotfix/list/{{offset}}/{{limit}}', // 热修复列表
    hotFixAdd: '/api/admin/jzbf/hotfix/save', // 热修复新增
    hotFixUpdate: '/api/admin/jzbf/hotfix/modify', // 热修复修改
    hotFixDel: '/api/admin/jzbf/hotfix/delete/{{hotfixId}}' // 热修复删除
  }
}
/**
 * @Description: 版本维护-开关控制
 */
export const AppSwitch = {
  0: {
    switchList: '/api/admin/switch/list/{{pageIndex}}/{{pageSize}}', // 开关列表
    switchAdd: '/api/admin/switch/add', // 开关新增
    switchUpdate: '/api/admin/switch/update', // 开关更新
    switchDel: '/api/admin/switch/del/{{switchControlId}}', // 开关删除
    menuList: '/api/admin/switch/get/type/list', // 开关类型列表，由后端控制
    channelList: '/api/admin/switch/listAndroidChannelSwitch', // 获取Android审核的渠道列表
    channelUpdate: '/api/admin/switch/updateAndroidChannelSwitch' // android审核渠道更新开关
  },
  1: {
    switchList: '/api/admin/jzbf/switch/list/{{pageIndex}}/{{pageSize}}', // 开关列表
    switchAdd: '/api/admin/jzbf/switch/add', // 开关新增
    switchUpdate: '/api/admin/jzbf/switch/update', // 开关更新
    switchDel: '/api/admin/jzbf/switch/del/{{switchControlId}}', // 开关删除
    menuList: '/api/admin/jzbf/switch/get/type/list', // 开关类型列表，由后端控制
    channelList: '/api/admin/switch/listAndroidChannelSwitch', // 获取Android审核的渠道列表
    channelUpdate: '/api/admin/switch/updateAndroidChannelSwitch' // android审核渠道更新开关
  }
}
/**
 * @Description: 投放管理-Apk上传
 */
export const MarketApk = {
  0: {
    apkList: '/api/admin/appPackageFile/fileList/androidApk', // apk包上传列表
    apkAdd: '/api/admin/appPackageFile/fileUpload/androidApk' // apk包上传 file类型
  },
  1: {
    apkList: '/api/admin/jzbf/appPackageFile/fileList/androidApk', // apk包上传列表
    apkAdd: '/api/admin/jzbf/appPackageFile/fileUpload/androidApk' // apk包上传 file类型
  }
}
/**
 * @Description: 投放管理-渠道推广链接
 */
export const MarketChannelPromotion = {
  0: {
    list: '/api/admin/channelSpreadConfig/list/{{pageIndex}}/{{pageSize}}', // 渠道推广下载列表
    add: '/api/admin/channelSpreadConfig/add', // 渠道推广下载refer新增
    update: '/api/admin/channelSpreadConfig/update/{{channelSpreadConfigId}}', // 渠道推广下载refer修改
    checkApk: '/api/admin/channelSpreadConfig/returnUrlIfChannelApkExist' // 渠道推广下载refer查找对应apk链接
  },
  1: {
    list: '/api/admin/jzbf/channelSpreadConfig/list/{{pageIndex}}/{{pageSize}}', // 渠道推广下载列表
    add: '/api/admin/jzbf/channelSpreadConfig/add', // 渠道推广下载refer新增
    update:
      '/api/admin/jzbf/channelSpreadConfig/update/{{channelSpreadConfigId}}', // 渠道推广下载refer修改
    checkApk: '/api/admin/jzbf/channelSpreadConfig/returnUrlIfChannelApkExist' // 渠道推广下载refer查找对应apk链接
  }
}
/**
 * @Description: 投放管理-iOS渠道短链
 */
export const MarketShortUrl = {
  0: {
    list: '/api/admin/apple/channel/list', // iOS渠道短链列表
    add: '/api/admin/apple/channel/add', // iOS渠道短链新增
    update: '/api/admin/apple/channel/update/{{appleChannelId}}', // iOS渠道短链更新
    del: '/api/admin/apple/channel/delete/{{appleChannelId}}', // iOS渠道短链删除
    typeList: '/api/admin/apple/channelGroup/select/list' // iOS渠道短链类型列表
  },
  1: {
    list: '/api/admin/jzbf/apple/channel/list', // iOS渠道短链列表
    add: '/api/admin/jzbf/apple/channel/add', // iOS渠道短链新增
    update: '/api/admin/jzbf/apple/channel/update/{{appleChannelId}}', // iOS渠道短链更新
    del: '/api/admin/jzbf/apple/channel/delete/{{appleChannelId}}', // iOS渠道短链删除
    typeList: '/api/admin/jzbf/apple/channelGroup/select/list' // iOS渠道短链类型列表
  }
}
/**
 * @description: 投放管理 - 渠道组管理
 */
export const MarketChannelGroup = {
  0: {
    list: '/api/admin/apple/channelGroup/list/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/apple/channelGroup/add', // 新增
    update: '/api/admin/apple/channelGroup/update/{{appleChannelGroupId}}', // 更新
    del: '/api/admin/apple/channelGroup/delete/{{appleChannelGroupId}}' // 删除
  },
  1: {
    list: '/api/admin/jzbf/apple/channelGroup/list/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/jzbf/apple/channelGroup/add', // 新增
    update: '/api/admin/jzbf/apple/channelGroup/update/{{appleChannelGroupId}}', // 更新
    del: '/api/admin/jzbf/apple/channelGroup/delete/{{appleChannelGroupId}}' // 删除
  }
}
/**
 * @description: 投放管理 - WAP优惠券渠道管理
 */
export const MarketWapCoupon = {
  list: '/api/admin/dict/coupon/page',
  add: '/api/admin/dict/coupon/add',
  update: '/api/admin/dict/coupon/update'
}
/**
 * @description: 投放管理 - 合作公司配置
 */
export const MarketCooperationCompany = {
  list: '/api/admin/cooperation/list/vendor', // 公司列表
  del: '/api/admin/cooperation/del/vendor', // 删除公司
  add: '/api/admin/cooperation/add/vendor', // 新建合作公司
  update: '/api/admin/cooperation/update/vendor' // 更新合作公司
}
/**
 * @description: 投放管理 - 合作应用
 */
export const MarketCooperationApp = {
  list: '/api/admin/cooperation/list/app', // 应用列表
  add: '/api/admin/cooperation/add/app', // 新增应用
  update: '/api/admin/cooperation/update/app', // 修改应用
  del: '/api/admin/cooperation/del/app', // 删除应用
  status: '/api/admin/cooperation/update/status/app' // 更新应用状态
}
/**
 * @Description: 开发者-日志查询
 */
export const DeveloperLog = {
  logList: '/api/admin/clientLog/V2/getClientLog/{{pageIndex}}/{{pageSize}}'
}
/**
 * @description: 用户模块-用户列表
 */
export const UserList = {
  0: {
    list: '/api/metrics/user/consumer/info',
    addRemark: '/api/admin/operationLog/userWarning/add',
    freezeUser: '/api/admin/user/freezeUser',
    unfreezeUser: '/api/admin/user/unfreezeUser',
    flushBalance: '/api/admin/user/flushBalance',
    userWarningLog: '/api/metrics/user/earlyWarning/list',
    Remark: '/api/admin/operationLog/userWarning/list',
    exportWarning: '/api/metrics/user/consumer/export', // 预警用户导出
    exportVip: '/api/metrics/user/consumer/export/vip', // VIP用户导出
    erasingPhone: '/api/admin/user/erasingPhone' // 解绑手机号
  },
  1: {
    list: '/api/admin/jzbf/user/list',
    search: '/api/admin/jzbf/user/search'
  }
}
/**
 * @description: 用户模块-用户详情
 */
export const UserDetail = {
  0: {
    info: '/api/metrics/user/userInfo/{{userId}}',
    updateBirthday: '/api/admin/user/edit/birthday',
    rechargeOrderList: '/api/metrics/user/getRechargeOrderList',
    consumerThreadOrderList: '/api/metrics/user/getConsumerThreadOrderList',
    getConsumerThreadOrderPriceSum:
      '/api/metrics/user/getConsumerThreadOrderPriceSum',
    getPayExpertList: '/api/metrics/user/getPayExpertList',
    getThreadOrderList: '/api/metrics/user/getThreadOrderList',
    getThreadOrderStatsInfo: '/api/metrics/user/getThreadOrderStatsInfo',
    getMatchOrderList: '/api/metrics/user/getMatchOrderList',
    getMatchOrderStatsInfo: '/api/metrics/user/getMatchOrderStatsInfo'
  },
  1: {}
}
/**
 * @description: 用户模块-账号查询
 */

export const AccountList = {
  accountList: '/api/admin/account/list',
  accountBind: '/api/admin/account/unbind'
}
/**
 * @description: 充值订单 0 红彩tab 1 精准比分tab
 */
export const RechargeOrder = {
  0: {
    rechargeList: '/api/admin/recharge/order/getRechargeOrderList'
  },
  1: {
    rechargeList: '/api/admin/jzbf/recharge/order/getRechargeOrderList'
  }
}
/**
 * @description: 充值订单详情
 */
export const RechargeDetail = {
  0: {
    getRechargeOrderDetail: '/api/admin/recharge/order/getRechargeOrderDetail',
    getRechargeOrderChangeList:
      '/api/admin/recharge/order/getRechargeOrderChangeList',
    getChannelTradeDetailList:
      'api/admin/recharge/order/getChannelTradeDetailList'
  },
  1: {
    getRechargeOrderDetail:
      '/api/admin/jzbf/recharge/order/getRechargeOrderDetail',
    getRechargeOrderChangeList:
      '/api/admin/jzbf/recharge/order/getRechargeOrderChangeList',
    getChannelTradeDetailList:
      'api/admin/jzbf/recharge/order/getChannelTradeDetailList'
  }
}
/**
 * @description: 商品订单 1 红彩tab 21 精准比分tab
 */
export const ProductOrder = {
  0: {
    list: '/api/admin/thread/order/getThreadOrderList' // 商品订单列表
  },
  1: {
    list: '/api/admin/jzbf/thread/order/getThreadOrderList' // 商品订单列表 精准比分-服务用
  }
}
/**
 * @description: 商品订单详情
 */
export const OrderProductDetail = {
  0: {
    detail: '/api/admin/thread/order/getThreadOrderDetail', // 非点卡
    detailOfPointCard: '/api/admin/thread/order/getThreadOrderDetail/pointCard', // 点卡
    changeList: '/api/admin/thread/order/getThreadOrderChangeList'
  },
  1: {
    detail: '/api/admin/jzbf/thread/order/getThreadOrderDetail', // 非点卡
    detailOfPointCard:
      '/api/admin/jzbf/thread/order/getThreadOrderDetail/pointCard', // 点卡
    changeList: '/api/admin/jzbf/thread/order/getThreadOrderChangeList'
  }
}
/**
 * @description: 苹果掉单 1 红彩tab 2 精准比分tab
 */
export const iphoneLosing = {
  0: {
    rechargeList: '/api/admin/pay/apple/losingOrder/list',
    confirmLosingOrder:
      '/api/admin/pay/apple/losingOrder/confirm/{{appleOrderId}}',
    offlineConfirmOrder:
      '/api/admin/pay/apple/losingOrder/offline/{{appleOrderId}}'
  },
  1: {
    rechargeList: '/api/admin/jzbf/pay/apple/losingOrder/list',
    confirmLosingOrder:
      '/api/admin/jzbf/pay/apple/losingOrder/confirm/{{appleOrderId}}',
    offlineConfirmOrder:
      '/api/admin/jzbf/pay/apple/losingOrder/offline/{{appleOrderId}}'
  }
}
/**
 * @description: 支付订单 1 红彩tab 2 精准比分tab
 */
export const Payment = {
  0: {
    paymentList: '/api/admin/recharge/order/getChannelTradeList',
    freeze: '/api/admin/recharge/order/freezing'
  },
  1: {
    paymentList: '/api/admin/jzbf/recharge/order/getChannelTradeList',
    freeze: '/api/admin/jzbf/recharge/order/freezing'
  }
}

export const PaymentDetail = {
  0: {
    getChannelTradeDetail: '/api/admin/recharge/order/getChannelTradeDetail',
    getChannelTradeChangeList:
      '/api/admin/recharge/order/getChannelTradeChangeList'
  },
  1: {
    getChannelTradeDetail:
      '/api/admin/jzbf/recharge/order/getChannelTradeDetail',
    getChannelTradeChangeList:
      '/api/admin/jzbf/recharge/order/getChannelTradeChangeList'
  }
}
/**
 * @description: 竞猜订单 0 TCM tab 1 拉新tab
 */
export const GuessOrder = {
  0: {
    orderList: '/api/admin/tcm/order/list',
    orderStatusList: '/api/admin/tcm/order/status/list',
    matchList: '/api/admin/tcm/order/fuzzySearchCompetition',
    batchRepair:
      '/api/admin/tcm/order/tcm/order/status/batch/update{{tcmBaseOrderId}}'
  },
  1: {
    orderList: '/api/admin/quiz/order/list'
  }
}
/**
 * @description: TCM订单详情
 */
export const TcmOrderDetail = {
  orderDetail: '/api/admin/tcm/order/info',
  orderStatusList: '/api/admin/tcm/order/status/info'
}
/**
 * @description: 拉新竞猜订单详情
 */
export const QuizOrderDetail = {
  orderDetail: '/api/admin/quiz/order/info',
  orderStatusList: '/api/admin/quiz/order/info/status'
}
/**
 * @description: 专家管理-列表
 */
export const ExpertList = {
  list: '/api/admin/expert/list', // 专家列表
  search: '/api/admin/expert/search', // 专家搜索
  add: '/api/admin/expert/add', // 新增专家
  weight: '/api/admin/expert/{{userId}}/update/weight', // 修改专家权重
  afficheAdd: '/api/admin/affiche/add', // 公告新增
  afficheList: '/api/admin/affiche/page/{{offset}}/{{limit}}' // 公告列表
}
/**
 * @description: 专家管理-详情
 */
export const ExpertDetail = {
  info: '/api/admin/expert/{{userId}}/getBaseInfo', // 专家信息详情
  stat: '/api/admin/expert/{{userId}}/getTacticStat', // 专家相关方案数据
  update: '/api/admin/expert/{{userId}}/update', // 更新专家信息
  protocolList: '/api/admin/expert/protocol/list/{{userId}}', // 专家协议列表
  threadList:
    '/api/admin/thread/expertUser/{{userId}}/getThreadList/{{pageIndex}}/{{pageSize}}', // 专家方案列表
  numLotteryThreadList:
    '/api/metrics/numLottery/expertUser/getNumLotteryThreadList/{{pageIndex}}/{{pageSize}}', // 数字彩方案列表
  offline: '/api/admin/expert/{{userId}}/offline', // 下线专家
  online: '/api/admin/expert/{{userId}}/online', // 上线专家
  updateDivideRate: '/api/admin/expert/protocol/updateDivideRate/{{protocolId}}' // 修改分成比例
}
/**
 * @description: 价格管理-充值价格
 */
export const PriceRecharge = {
  0: {
    list: '/api/admin/goods/list/{{payTerminalId}}', // 列表
    add: '/api/admin/goods/add', // 新增
    update: '/api/admin/goods/update', // 更新
    weight: '/api/admin/goods/update/weight', // 调整权重
    status: '/api/admin/goods/update/status' // 启用/停用
  },
  1: {
    list: '/api/admin/jzbf/goods/list/{{payTerminalId}}', // 列表
    add: '/api/admin/jzbf/goods/add', // 新增
    update: '/api/admin/jzbf//goods/update', // 更新
    weight: '/api/admin/jzbf/goods/update/weight', // 调整权重
    status: '/api/admin/jzbf/goods/update/status' // 启用/停用
  }
}
/**
 * @description: 价格管理 - 商品价格 - 方案价格
 */
export const PriceProductArticle = {
  0: {
    list: '/api/admin/price/list', // 价格列表
    weight: '/api/admin/price/update/weight', // 修改权重
    add: '/api/admin/price/add', // 新增
    update: '/api/admin/price/update', // 更新
    status: '/api/admin/price/update/status' // 修改上下线
  },
  1: {
    list: '/api/admin/jzbf/price/list', // 价格列表
    weight: '/api/admin/jzbf/price/update/weight', // 修改权重
    add: '/api/admin/jzbf/price/add', // 新增
    update: '/api/admin/jzbf/price/update', // 更新
    status: '/api/admin/jzbf/price/update/status' // 修改上下线
  }
}
/**
 * @description: 价格管理 - 商品价格 - 付费服务
 * 2：交叉盘(老) 3：五星指数 4：盘赔变动 6：红彩指数 8：交叉盘马甲包1 9：交叉盘马甲包1 10：交叉盘马甲包1 11：交叉盘(新) 13: VIP
 */
export const PriceProductSp = {
  0: {
    list: '/api/admin/sp/list', // 价格列表
    add: '/api/admin/sp/add', // 新增
    update: '/api/admin/sp/update', // 更新
    weight: '/api/admin/sp/update/weight', // 修改权重
    status: '/api/admin/sp/update/status' // 修改上下线
  },
  1: {
    list: '/api/admin/jzbf/sp/list', // 价格列表
    add: '/api/admin/jzbf/sp/add', // 新增
    update: '/api/admin/jzbf/sp/update', // 更新
    weight: '/api/admin/jzbf/sp/update/weight', // 修改权重
    status: '/api/admin/jzbf/sp/update/status' // 修改上下线
  }
}
/**
 * @description: 价格管理 - 商品价格 - 点卡
 */
export const PriceProductPointCard = {
  0: {
    list: '/api/admin/pointCard/{{type}}/list/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/pointCard/{{type}}/add', // 新增
    update: '/api/admin/pointCard/{{type}}/update/{{pointCardId}}', // 更新
    status:
      '/api/admin/pointCard/{{type}}/updateUseStatus/{{pointCardId}}/{{status}}', // 修改上下线
    weight: '/api/admin/pointCard/updateWeight/{{pointCardId}}/{{weight}}', // 修改权重
    userList: '/api/admin/pointCard/userLevel/selectList' // 普通卡选择对应的用户群
  },
  1: {
    list: '/api/admin/jzbf/pointCard/{{type}}/list/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/jzbf/pointCard/{{type}}/add', // 新增
    update: '/api/admin/jzbf/pointCard/{{type}}/update/{{pointCardId}}', // 更新
    status:
      '/api/admin/jzbf/pointCard/{{type}}/updateUseStatus/{{pointCardId}}/{{status}}', // 修改上下线
    weight: '/api/admin/jzbf/pointCard/updateWeight/{{pointCardId}}/{{weight}}', // 修改权重
    userList: '/api/admin/jzbf/pointCard/userLevel/selectList' // 普通卡选择对应的用户群
  }
}
/**
 * @description: 价格管理 - 商品价格 - 点卡 - 用户组
 */
export const PriceProductPointCardUserLevel = {
  0: {
    list: '/api/admin/pointCard/userLevel/list/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/pointCard/userLevel/add', // 新增
    update: '/api/admin/pointCard/userLevel/update/{{userLevelId}}', // 更新
    status:
      '/api/admin/pointCard/userLevel/updateUseStatus/{{userLevelId}}/{{status}}', // 启用或停用
    del: '/api/admin/pointCard/userLevel/delete/{{userLevelId}}', // 删除
    addCardList: '/api/admin/pointCard/lottery/selectList', // 获取对应渠道的关联卡
    addCard: '/api/admin/pointCard/userLevel/relateLotteryCard/{{userLevelId}}', // 关联卡新增
    addCardUpdate:
      '/api/admin/pointCard/userLevel/relateLotteryCard/update/{{userLevelId}}' // 关联卡修改
  },
  1: {
    list: '/api/admin/jzbf/pointCard/userLevel/list/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/jzbf/pointCard/userLevel/add', // 新增
    update: '/api/admin/jzbf/pointCard/userLevel/update/{{userLevelId}}', // 更新
    status:
      '/api/admin/jzbf/pointCard/userLevel/updateUseStatus/{{userLevelId}}/{{status}}', // 启用或停用
    del: '/api/admin/jzbf/pointCard/userLevel/delete/{{userLevelId}}', // 删除
    addCardList: '/api/admin/jzbf/pointCard/lottery/selectList', // 获取对应渠道的关联卡
    addCard:
      '/api/admin/jzbf/pointCard/userLevel/relateLotteryCard/{{userLevelId}}', // 关联卡新增
    addCardUpdate:
      '/api/admin/jzbf/pointCard/userLevel/relateLotteryCard/update/{{userLevelId}}' // 关联卡修改
  }
}
/**
 * @description: 头图&红人榜-头图列表
 */
export const HeadSlideshow = {
  0: {
    list: '/api/admin/headImage/queryAll', // 头图列表
    update: '/api/admin/headImage/modify', // 更新头图
    del: '/api/admin/headImage/delete', // 删除头图
    add: '/api/admin/headImage/insert' // 头图新增
  },
  1: {
    list: '/api/admin/jzbf/headImage/queryAll', // 头图列表
    update: '/api/admin/jzbf/headImage/modify', // 更新头图
    del: '/api/admin/jzbf/headImage/delete', // 删除头图
    add: '/api/admin/jzbf/headImage/insert', // 头图新增
    sync: '/api/admin/jzbf/headImage/syncHeadImage' // 红彩主包头图同步到马甲包
  }
}
/**
 * @description: 赛事管理-比赛列表
 */
export const MatchList = {
  list: '/api/admin/matchInfo/getMatchInfoList/{{pageIndex}}/{{pageSize}}', // 获取赛事列表
  search: '/api/admin/matchInfo/searchMatch/{{pageIndex}}/{{pageSize}}', // 搜索比赛
  weight: '/api/admin/matchInfo/modifyWeight', // 更改权重
  sfcList: '/api/admin/winningColours/list', // 胜负彩列表
  sfcDegreeList: '/api/admin/winningColours/getAllDegree', // 获取胜负彩期数列表
  sfcListByDegree: '/api/admin/winningColours/get', // 根据期数获取胜负彩数据
  setRefund: '/api/admin/matchInfo/setRefund', // 设置比赛不中退款
  cancelRefund: '/api/admin/matchInfo/cancelRefund', // 取消设置不中退款
  repairSfcDegree: '/api/admin/winningColours/statsExpertThreadWCInfo', // 胜负彩修复某期专家数据
  sfcPrize: '/api/admin/winningColours/manualDrawPrize', // 胜负彩手动开奖
  sfcAddNew: '/api/admin/winningColours/createWCInfo', // 胜负彩手动添加数据
  sfcUpdateByDegree: '/api/admin/winningColours/updateWCDateInfo' // 胜负彩更新数据
}
/**
 * @description: 数字彩管理
 */
export const NumLottery = {
  list: '/api/admin/numbersGames/adminList', // 数字彩赛事列表
  add: '/api/admin/numbersGames/update', // 更新数字彩
  updateAwardInfo: 'api/admin/numbersGames/updateAwardInfo' // 更新开奖信息
}

/**
 * @description: 赛事管理-比赛详情
 */
export const MatchDetail = {
  info: '/api/admin/matchInfo/getMatchInfoById/{{matchInfoId}}', // 竞猜比赛详情
  threadList:
    '/api/admin/thread/match/{{matchInfoId}}/getThreadList/{{pageIndex}}/{{pageSize}}', // 比赛对应的方案列表
  weight: '/api/admin/thread/{{threadId}}/updateWeight/{{weight}}' // 比赛详情修改方案权重
}
/**
 * @description: 赛事管理-首页赛事推荐配置
 */
export const MatchRecommendIndex = {
  list: '/api/admin/recommend/match/list',
  add: '/api/admin/recommend/add/match',
  delete: '/api/admin/recommend/del/match'
}
/**
 * @description: push管理 - 列表
 */
export const Push = {
  add: '/api/admin/push/create', // push新增
  list: '/api/admin/push/list/{{offset}}/{{limit}}', // push列表
  previewThread: '/api/admin/thread/getPushThreadList' // 预览多方案
}
/**
 * @description: 财务管理 - 红豆新增明细
 */
export const financeRecharge = {
  0: {
    list:
      '/api/admin/recharge/getRechargeLogList/{{month}}/{{pageIndex}}/{{pageSize}}',
    export: '/api/admin/recharge/exportRechargeLogList/{{month}}',
    exportDay:
      '/api/admin/recharge/exportRechargeLogList?startDay={{startDay}}&endDay={{endDay}}'
  },
  1: {
    list:
      '/api/admin/jzbf/recharge/getRechargeLogList/{{month}}/{{pageIndex}}/{{pageSize}}',
    export: '/api/admin/jzbf/recharge/exportRechargeLogList/{{month}}',
    exportDay:
      '/api/admin/jzbf/recharge/exportRechargeLogList?startDay={{startDay}}&endDay={{endDay}}'
  },
  listTestAccount: '/api/admin/systemInfo/listTestAccount', // 测试账号汇总
  addTestAccount: '/api/admin/systemInfo/addTestAccount' // 新增测试账号
}
/**
 * @description: 筛选app的列表  红彩 精准比分  全部
 */
export const appSelectList = `/api/admin/cooperation/business/appSelect/list`

/**
 * @description: 财务管理 - 一次性消耗明细
 */
export const financeOncePurchase = {
  hongcai: {
    list:
      '/api/admin/costDetail/getCostDetailList/{{month}}/{{pageIndex}}/{{pageSize}}',
    export: '/api/admin/costDetail/exportCostDetailList/{{month}}',
    exportDay:
      '/api/admin/costDetail/exportCostDetailList?startDay={{startDay}}&endDay={{endDay}}'
  },
  cooperation: {
    list:
      '/api/admin/cooperation/costDetail/getCostDetailList/{{month}}/{{pageIndex}}/{{pageSize}}',
    export: '/api/admin/cooperation/costDetail/exportCostDetailList/{{month}}',
    exportDay:
      '/api/admin/costDetail/exportCostDetailList?startDay={{startDay}}&endDay={{endDay}}'
  }
}
/**
 * @description: 财务管理 - 专家净收入
 */
export const financeExpertIncome = {
  hongcai: {
    list: '/api/admin/expert/netIncome/list/{{pageIndex}}/{{pageSize}}',
    export: '/api/admin/expert/netIncome/list/exportExcel',
    setDespositRate: '/api/admin/expert/netIncome/despositRate/set'
  },
  cooperation: {
    list:
      'api/admin/cooperation/expert/netIncome/list/{{pageIndex}}/{{pageSize}}',
    export: '/api/admin/cooperation/expert/netIncome/list/exportExcel'
  }
}
/**
 * @description: 财务管理 - 专家协议详情
 */
export const financeExpertProtocol = {
  list: '/api/admin/expert/protocol/list/{{pageIndex}}/{{pageSize}}',
  confirm: '/api/admin/expert/protocol/confirm/{{protocolId}}',
  edit: '/api/admin/expert/protocol/update/{{protocolId}}',
  updateLog: '/api/admin/expert/protocol/{{protocolId}}/updateLog/list',
  export: '/api/admin/expert/protocol/exportExcel'
}
/**
 * @description: 财务管理 - 包月消耗明细
 */
export const financeMonthlyOfSp = {
  0: {
    list: '/api/metrics/sp/stats',
    export: '/api/metrics/sp/export'
  },
  1: {
    list: '/api/metrics/jzbf/sp/stats',
    export: '/api/metrics/jzbf/sp/export'
  }
}
/**
 * @description: 财务管理 - 包月可确认消耗明细
 */
export const financeMonthlyConfirmedOfSp = {
  0: {
    list: '/api/metrics/sp/confirmed/stats',
    export: '/api/metrics/sp/confirmed/export'
  },
  1: {
    list: '/api/metrics/jzbf/sp/confirmed/stats',
    export: '/api/metrics/jzbf/sp/confirmed/export'
  }
}
/**
 * @description: 财务管理 - 点卡新增明细
 */
export const financePointCardAdd = {
  list: '/api/metrics/pointCard/stats',
  discountList: '/api/metrics/pointCard/discount/list',
  sum: '/api/metrics/pointCard/stats/sum',
  export: '/api/metrics/pointCard/stats/export'
}
/**
 * @description: 财务管理 - 点卡消耗明细
 */
export const financePointCardConfirmed = {
  list: '/api/metrics/pointCard/card/stats',
  discountList: '/api/metrics/pointCard/discount/list',
  sum: '/api/metrics/pointCard/stats/sum',
  addTotal: '/api/metrics/pointCard/card/stats/sum',
  export: '/api/metrics/pointCard/card/stats/export'
}
/**
 * @description: 财务管理 - 点数消耗明细
 */
export const financePointConfirmed = {
  0: {
    list: '/api/metrics/pointCard/point/stats',
    sum: '/api/metrics/pointCard/point/stats/sum',
    export: '/api/metrics/pointCard/point/stats/export'
  },
  1: {
    list: '/api/metrics/pointCard/point/expire/stats',
    export: '/api/metrics/pointCard/point/expire/stats/export'
  }
}
/**
 * @description: 财务管理 - 竞猜消耗明细
 */
export const financeTcmConsum = {
  0: {
    list: '/api/metrics/tcm/order/list',
    sum: '/api/metrics/tcm/order/orderPrice/count/all',
    export: '/api/metrics/tcm/order/list/export'
  },
  1: {
    list: '/api/metrics/quiz/order/list',
    sum: '/api/metrics/quiz/order/orderPrice/count/all',
    export: '/api/metrics/quiz/order/list/export'
  }
}
/**
 * @description: 积分/N币明细 - 积分新增
 */
export const TcmDetailCreditAdd = {
  list: '/api/metrics/tcm/consumeDetail/creditAdd', // 列表
  export: '/api/metrics/tcm/consumeDetail/creditAdd/exportExcel' // 导出
}
/**
 * @description: 积分/N币明细 - 积分消耗
 */
export const TcmDetailCreditConsume = {
  list: '/api/metrics/tcm/consumeDetail/creditConsume', // 列表
  export: '/api/metrics/tcm/consumeDetail/creditConsume/exportExcel' // 导出
}
/**
 * @description: 积分/N币明细 - N币新增
 */
export const TcmDetailNadd = {
  list: '/api/metrics/tcm/consumeDetail/nCoinAdd', // 列表
  export: '/api/metrics/tcm/consumeDetail/nCoinAdd/exportExcel' // 导出
}
/**
 * @description: 积分/N币明细 - N币消耗
 */
export const TcmDetailNConsume = {
  list: '/api/metrics/tcm/consumeDetail/nCoinConsume', // 列表
  export: '/api/metrics/tcm/consumeDetail/nCoinConsume/exportExcel' // 导出
}
/**
 * @description: 消息管理 - 系统消息
 */
export const MessageSystem = {
  list: '/api/admin/messageTemplet/list/{{pageIndex}}/{{pageSize}}',
  add: '/api/admin/messageTemplet/add',
  status:
    '/api/admin/messageTemplet/updateUseStatus/{{templetId}}/{{useStatus}}',
  del: '/api/admin/messageTemplet/delete/{{templetId}}',
  update: '/api/admin/messageTemplet/updateSend/{{templetId}}',
  keyword: '/api/admin/messageTemplet/list/keyword'
}
/**
 * @description: 消息管理 - 运营消息
 */
export const MessageOperating = {
  list: '/api/admin/message/log/page/{{start}}/{{limit}}', // 列表
  msgType: '/api/admin/message/type/normal/list', // 获取消息类别
  userGroup: '/api/admin/message/userGroup/list', // 获取消息组类别
  add: '/api/admin/message/log/add', // 新增
  del: '/api/admin/message/log/updateDel' // 消息删除
}
/**
 * @description: 消息管理 - 消息类别
 */
export const MessageCategory = {
  list: '/api/admin/message/type/page/{{start}}/{{limit}}', // 列表
  add: '/api/admin/message/type/add', // 新增
  status: '/api/admin/message/type/updateDelStatus', // 停用/启用
  update: '/api/admin/message/type/update' // 更新
}
/**
 * @description: 消息管理 - 触发条件
 */
export const MessageCondition = {
  list: '/api/admin/triggerCondition/list/{{pageIndex}}/{{pageSize}}', // 列表
  templateList: '/api/admin/messageTemplet/canBeRelated/list', // 模板列表
  codeList: '/api/admin/triggerCondition/getCanUseConditionCode', // code列表
  add: '/api/admin/triggerCondition/add', // 新增
  update: '/api/admin/triggerCondition/update/{{conditionId}}', // 更新
  status:
    '/api/admin/triggerCondition/updateUseStatus/{{conditionId}}/{{useStatus}}', // 停用
  del: '/api/admin/triggerCondition/delete/{{conditionId}}' // 删除
}
/**
 * @description: 用户管理 - 黑名单
 */
export const UserBlacklist = {
  query: '/api/admin/black/search/user', // 搜索黑名单用户
  toWhite: '/api/admin/black/update/white' // 黑名单用户添加白名单并赠送500积分
}
/**
 * @description: TCM赛事 - 赛事列表
 */
export const TcmMatchList = {
  list: '/api/metrics/tcm/event/list', // 列表
  weight: '/api/admin/tcm/event/update/weight', // 调整权重
  choiceness: '/api/admin/tcm/event/update/choiceness', // 针对赛事ID设置或取消精选
  bet: '/api/admin/tcm/event/update/allowBetting', // 针对赛事ID进行开盘封盘
  betUpdate: '/api/admin/tcm/event/update/betting', // 移出/移入竞猜池
  extraOdd: '/api/admin/tcm/event/update/extra/odds', // 针对赛事ID进行加奖
  getSwitch: '/api/admin/tcm/event/get/closeAll/switch', // 获取一键封盘的状态
  setSwitch: '/api/admin/tcm/event/update/closeAll/switch' // 设置一键封盘与否
}
/**
 * @description: TCM赛事 - 赛事详情
 */
export const TcmMatchDetail = {
  info: '/api/metrics/tcm/event/info' // 根据赛事ID查询详情
}
/**
 * @description: 人工掉单流程
 */
export const AppleFlow = {
  0: {
    list: '/api/admin/appleOrderFlow/list', // 列表
    add: '/api/admin/appleOrderFlow/add', // 1. 运营提交掉单审核
    leaderCheck: '/api/admin/appleOrderFlow/leaderCheck', // 2. 运营主管通过
    devCheck: '/api/admin/appleOrderFlow/devCheck', // 3.1 技术验证绑定
    finalCheck: '/api/admin/appleOrderFlow/leaderFinalCheck', // 4.2 主管最终确认
    searchTradeId: '/api/admin/appleOrderFlow/devCheck/search', // 3.2 技术搜索订单信息
    finalTradeId: '/api/admin/appleOrderFlow/leaderFinalCheck/getAppleOrder', // 4.1 主管最终确认 查看掉单信息
    log: '/api/admin/appleOrderFlow/opLog' // 日志
  },
  1: {
    list: '/api/admin/jzbf/appleOrderFlow/list', // 列表
    add: '/api/admin/jzbf/appleOrderFlow/add', // 1. 运营提交掉单审核
    leaderCheck: '/api/admin/jzbf/appleOrderFlow/leaderCheck', // 2. 运营主管通过
    devCheck: '/api/admin/jzbf/appleOrderFlow/devCheck', // 3.1 技术验证绑定
    finalCheck: '/api/admin/jzbf/appleOrderFlow/leaderFinalCheck', // 4.2 主管最终确认
    searchTradeId: '/api/admin/jzbf/appleOrderFlow/devCheck/search', // 3.2 技术搜索订单信息
    finalTradeId:
      '/api/admin/jzbf/appleOrderFlow/leaderFinalCheck/getAppleOrder', // 4.1 主管最终确认 查看掉单信息
    log: '/api/admin/jzbf/appleOrderFlow/opLog' // 日志
  }
}
/**
 * @description: 活动管理 - 竞猜奖品管理
 */
export const ActivityTcmMallList = {
  list: '/api/admin/tcm/mall/getProductList/{{pageIndex}}/{{pageSize}}', // 奖品列表
  add: '/api/admin/tcm/mall/addProduct', // 新建奖品
  update: '/api/admin/tcm/mall/modifyProduct', // 编辑奖品
  outerProductList: '/api/admin/tcm/mall/getOuterProductList', // 外部虚拟商品列表
  allStatus: '/api/admin/tcm/mall/updateSwitch', // 一键更新奖品状态
  checkAllStatus: '/api/admin/tcm/mall/checkSwitch' // 查询兑换开关状态
}
/**
 * @description: 活动管理 - 竞猜兑奖订单
 */
export const ActivityTcmMallOrder = {
  summary: '/api/admin/tcm/mall/getOrderSummary', // 数据总览
  list: '/api/admin/tcm/mall/getOrderList/{{pageIndex}}/{{pageSize}}', // 订单列表
  info: '/api/admin/tcm/mall/getOrder/{{exchangeOrderId}}', // 根据ID查询订单详情
  processOrder:
    '/api/admin/tcm/mall/processOrder/{{exchangeOrderId}}/{{processType}}', // 审批订单
  tcmMallShipOrder:
    '/api/admin/tcm/mall/shipOrder/{{exchangeOrderId}}/{{shippingType}}', // 订单发货
  tcmMallConfirmOrder: '/api/admin/tcm/mall/confirmReceipt/{{exchangeOrderId}}', // 订单确认收货
  cheatUser: '/api/admin/antispam/user/{{account}}/query', // 检测作弊用户
  commentUpdate: '/api/admin/tcm/mall/updateOrderComment', // 更新订单备注
  exportOrderList: '/api/admin/tcm/mall/exportOrderList' // 导出订单列表
}
/**
 * @description: 活动管理 - 拉新竞猜活动
 */
export const ActivityQuizForNew = {
  list: '/api/admin/quiz/list', // 拉新竞猜活动列表
  count: '/api/admin/quiz/get/top/count', // 竞猜拉新活动头部统计
  del: '/api/admin/quiz/update/del', // 竞猜拉新活动删除
  add: '/api/admin/quiz/add', // 竞猜拉新活动新增
  update: '/api/admin/quiz/update', // 竞猜拉新活动更新
  status: '/api/admin/quiz/update/showStatus', // 竞猜拉新活动状态更新
  weight: '/api/admin/quiz/update/weight', // 竞猜拉新活动权重更新
  settlement: '/api/admin/quiz/update/settlement', // 竞猜拉新活动结算
  robot: '/api/admin/quiz/add/robot', // 竞猜拉新活动根据投注项增加机器人数
  countById: '/api/admin/quiz/get/quiz/count', // 竞猜拉新活动投注项统计详情
  refund: '/api/admin/quiz/update/refund' // 竞猜拉新活动退豆
}
/**
 * @description: 活动管理 - 客户端活动广场
 */
export const ActivityApp = {
  list: '/api/admin/activity/plaza/page/list', // 客户端活动广场列表
  add: '/api/admin/activity/plaza/add', // 客户端活动广场 新增/更新
  status: '/api/admin/activity/plaza/update/status', // 客户端活动广场 更新状态
  weight: '/api/admin/activity/plaza/update/weight', // 客户端活动广场 更新权重
  del: '/api/admin/activity/plaza/del', // 客户端活动广场 删除
  major: '/api/admin/activity/plaza/update/major' // 客户端活动广场 设置主推
}
/**
 * @description: 活动管理 - WAP活动
 */
export const ActivityWap = {
  list: '/api/admin/activity/list', // 列表
  add: '/api/admin/activity/insert', // 新增
  update: '/api/admin/activity/modify', // 更新
  online: '/api/admin/activity/online', // 上线
  offline: '/api/admin/activity/offline' // 下线
}
/**
 * @description: 活动管理 - 免费方案活动
 */
export const ActivityFreeThread = {
  list: '/api/admin/activity/project/page/h5/{{offset}}/{{limit}}', // 新增
  add: '/api/admin/activity/project/add/h5' // 新增
}
/**
 * @description: 数据统计 - 消费统计
 */
export const StatisticsConsumer = {
  0: {
    consumerByDay: {
      list: '/api/metrics/consumer/count/info', // 每日消费统计列表
      tcmList: '/api/metrics/consumer/tcm/count/info', // 竞猜统计
      quizList: '/api/metrics/consumer/quiz/count/info', // 拉新竞猜统计
      exportList: '/api/metrics/consumer/count/info/excel', // 导出每日消费统计
      exportTcmList: '/api/metrics/consumer/tcm/count/info/excel', // 导出竞猜统计
      exportQuizList: '/api/metrics/consumer/quiz/count/info/excel' // 导出拉新竞猜统计
    },
    consumerByPrice: {
      list: '/api/metrics/consumer/count/price/info', // 价格获取消费列表
      tcmList: '/api/metrics/tcm/order/orderPrice/stats' // 竞猜价格获取消费列表
    },
    newUserByDay: {
      list: '/api/metrics/flow/day/totalCount', // 获取新增每日用户列表
      createExcel: '/api/metrics/flow/day/createExcel', // 生成报表
      checkExcel: '/api/metrics/flow/day/existExcel', // 检测excel是否生成
      exportExcel: '/api/metrics/flow/day/downloadExcel' // 导出excel表格
    },
    userBuyThread: {
      list: '/api/metrics/consumer/buyThread/stats/list', // 用户购买文章统计列表
      export: '/api/metrics/consumer/buyThread/stats' // 用户购买文章统计导出
    },
    cpsOrder: {
      export: '/api/metrics/consumer/cps/order/excel' // CPS订单导出
    },
    lotterPush: {
      list: '/api/metrics/pushHands/settle/stats', // 彩票地推财务明细列表
      export: '/api/metrics/pushHands/settle/export' // 彩票地推财务明细导出
    }
  },
  1: {
    consumerByDay: {
      list: '/api/metrics/jzbf/consumer/count/info', // 获取每日消费统计列表
      exportList: '/api/metrics/jzbf/consumer/count/info/excel' // 导出每日消费统计
    },
    consumerByPrice: {
      list: '/api/metrics/jzbf/consumer/count/price/info' // 价格获取消费列表
    },
    newUserByDay: {
      list: '/api/metrics/jzbf/flow/day/totalCount', // 获取新增每日用户列表
      createExcel: '/api/metrics/jzbf/flow/day/createExcel', // 生成报表
      checkExcel: '/api/metrics/jzbf/flow/day/existExcel', // 检测excel是否生成
      exportExcel: '/api/metrics/jzbf/flow/day/downloadExcel' // 导出excel表格
    }
  }
}
/**
 * @description: 数据统计 - 充值统计
 */
export const StatisticsRecharge = {
  0: {
    listByTime: '/api/metrics/recharge/overview', // 根据时间
    listByPlatform: '/api/metrics/recharge/price/{{platform}}' // 根据平台
  },
  1: {
    listByTime: '/api/metrics/jzbf/recharge/overview', // 根据时间
    listByPlatform: '/api/metrics/jzbf/recharge/price/{{platform}}' // 根据平台
  }
}
/**
 * @description: 数据统计 - 专家统计
 */
export const StatisticsExpert = {
  baseList: '/api/metrics/expert/basicStats', // 专家基础统计
  leagueList: '/api/metrics/expert/league/stats', // 专家擅长联赛统计
  leagueExport: '/api/metrics/expert/league/export', // 导出专家擅长联赛
  earningRank:
    '/api/admin/expert/rank/getEarningRateRankList/{{pageIndex}}/{{pageSize}}', // 专家盈利率榜统计 - 周
  earningByMonth: '/api/metrics/expert/monthEarningRate/stats', // 专家盈利率榜根据月份统计
  earningTop: '/api/metrics/expert/earningRate/stats', // 专家盈利率榜总数据
  popularityRank:
    '/api/admin/expert/rank/getPopularityRankList/{{categoryId}}/{{pageIndex}}/{{pageSize}}' // 人气榜
}
/**
 * @description: 数据统计 - 付费服务统计
 */
export const StatisticsProduct = {
  spList: '/api/metrics/sp/data/crosstrade/list/{{offset}}/{{limit}}', // 交叉盘列表
  starList: '/api/metrics/sp/data/macau/list/{{offset}}/{{limit}}', // 五星指数列表
  starCount: '/api/metrics/sp/data/macau/top/count', // 五星指数总计统计
  starById: '/api/metrics/sp/data/macau/info/{{matchInfoId}}', // 五星指数赛事详情
  eloList: '/api/metrics/sp/data/elo/list/{{offset}}/{{limit}}', // 红彩指数列表
  eloCount: '/api/metrics/sp/data/elo/stats', // 红彩指数统计
  eloById: '/api/metrics/sp/data/elo/detail/{{matchInfoId}}', // 红彩指数赛事详情
  eloDel: '/api/admin/sp/data/elo/delEloMatch', // 删除红彩指数赛事
  eloShow: '/api/admin/sp/data/elo/showEloMatch', // 红彩指数根据赛事ID隐藏或显示'
  eloAdd: '/api/admin/sp/data/elo/addFakeEloMatch', // 红彩指数根据赛事ID造假数据
  eloPreview: '/api/admin/sp/data/elo/previewFakeEloMatch' // 红彩指数根据赛事ID假数据预览
}
/**
 * @description: 数据统计 - 月流水报表
 */
export const StatisticsJournal = {
  0: {
    create: '/api/metrics/flow/createExcel', // 生成报表
    check: '/api/metrics/flow/existExcel', // 检测报表是否生成
    export: '/api/metrics/flow/downloadExcel' // 下载报表
  },
  1: {
    create: '/api/metrics/jzbf/flow/createExcel', // 生成报表
    check: '/api/metrics/jzbf/flow/existExcel', // 检测报表是否生成
    export: '/api/metrics/jzbf/flow/downloadExcel' // 下载报表
  }
}
/**
 * @description: 专家管理 - 心愿卡管理
 */
export const ExpertQuestion = {
  list: '/api/admin/questionAnswering/getTopicList', // 列表
  reject: '/api/admin/questionAnswering/reject', // 驳回
  updateTitle: '/api/admin/questionAnswering/modify/title', // 修改用户提问
  updateContent: '/api/admin/questionAnswering/modify/content', // 修改专家回答的内容
  info: '/api/admin/questionAnswering/get' // 获取问答详情
}
/**
 * @description: 头图&弹框 - 红人榜
 */
export const HeadRedRank = {
  list: '/api/admin/celebrity/list', // 红人榜列表
  add: '/api/admin/celebrity/add', // 红人榜新增
  update: '/api/admin/celebrity/update', // 红人榜更新
  updateStatus: '/api/admin/celebrity/updateStatus', // 红人榜上下线
  preview: '/api/admin/celebrity/preShow', // 红人榜详情
  statistics: '/api/metrics/celebrity/getRec' // 后端生成统计
}
/**
 * @description: 优惠券管理 - 优惠券组合
 */
export const CouponPackage = {
  0: {
    list: '/api/admin/coupon/wrap/list', // 组合列表,
    listByCouponWrapId: '/api/admin/coupon/{{couponWrapId}}/list', // 根据组合ID获取组合优惠券列表
    status: '/api/admin/coupon/wrap/updateValidStatus', // 组合状态修改
    codeList: '/api/admin/coupon/warp/code/list', // 活动码
    add: '/api/admin/coupon/wrap/add', // 新增优惠券组合
    update: '/api/admin/coupon/wrap/update', // 更新优惠券组合
    sendConfirmation: '/api/admin/coupon/secondary/confirmation', // 优惠券发放确认弹窗
    send: '/api/admin/coupon/wrap/send/by/excel', // 优惠券批量发放
    ResendNewCoupon: '/api/admin/coupon/wrap/send/new/coupon/account' // 补发新手大礼包
  },
  1: {
    list: '/api/admin/jzbf/coupon/wrap/list', // 组合列表,
    listByCouponWrapId: '/api/admin/jzbf/coupon/{{couponWrapId}}/list', // 根据组合ID获取组合优惠券列表
    status: '/api/admin/jzbf/coupon/wrap/updateValidStatus', // 组合状态修改
    codeList: '/api/admin/jzbf/coupon/warp/code/list', // 活动码
    add: '/api/admin/jzbf/coupon/wrap/add', // 新增优惠券组合
    update: '/api/admin/jzbf/coupon/wrap/update', // 更新优惠券组合
    sendConfirmation: '/api/admin/jzbf/coupon/secondary/confirmation', // 优惠券发放确认弹窗
    send: '/api/admin/jzbf/coupon/wrap/send/by/excel' // 优惠券批量发放
  }
}
/**
 * @description: 优惠券管理 - 优惠券类别
 */
export const CouponCategory = {
  0: {
    list: '/api/admin/coupon/list/{{type}}/{{pageIndex}}/{{pageSize}}', // 列表
    status: '/api/admin/coupon/update/validStatus', // 更新状态
    checkCouponStr: '/api/admin/coupon/check/user/code/{{str}}', // 验券
    add: '/api/admin/coupon/{{couponWrapId}}/add', // 新增对应组合的券
    detail: '/api/admin/coupon/update/{{couponId}}/info', // 获取优惠券类别详情
    update: '/api/admin/coupon/update' // 更新
  },
  1: {
    list: '/api/admin/jzbf/coupon/list/{{type}}/{{pageIndex}}/{{pageSize}}', // 列表
    status: '/api/admin/jzbf/coupon/update/validStatus', // 更新状态
    checkCouponStr: '/api/admin/jzbf/coupon/check/user/code/{{str}}', // 验券
    add: '/api/admin/jzbf/coupon/{{couponWrapId}}/add', // 新增对应组合的券
    detail: '/api/admin/jzbf/coupon/update/{{couponId}}/info', // 获取优惠券类别详情
    update: '/api/admin/jzbf/coupon/update' // 更新
  }
}
/**
 * @description: 优惠券管理 - 优惠券渠道
 */
export const CouponChannel = {
  list: '/api/admin/channel/list', // 列表
  add: '/api/admin/channel/add', // 新增
  update: '/api/admin/channel/update' // 更新
}
/**
 * @description: 优惠券管理 - 优惠券详情
 */
export const CouponDetail = {
  0: {
    list:
      '/api/metrics/coupon/{{couponId}}/couponDetail/{{type}}/{{pageIndex}}/{{pageSize}}', // 优惠券详情 不同情况列表
    log:
      '/api/admin/couponLog/getCouponLogList/{{couponId}}/{{pageIndex}}/{{pageSize}}', // 操作日志
    add: '/api/admin/coupon/add/total/count', // 手动增加券数
    addExport: '/api/admin/coupon/add/total/count/and/export' // 手动增加并导出
  },
  1: {
    list:
      '/api/admin/jzbf/coupon/{{couponId}}/couponDetail/{{type}}/{{pageIndex}}/{{pageSize}}', // 优惠券详情 不同情况列表
    log:
      '/api/admin/jzbf/couponLog/getCouponLogList/{{couponId}}/{{pageIndex}}/{{pageSize}}', // 操作日志
    add: '/api/admin/jzbf/coupon/add/total/count', // 手动增加券数
    addExport: '/api/admin/jzbf/coupon/add/total/count/and/export' // 手动增加并导出
  }
}
/**
 * @description: 活动管理 - 邀请码拉新
 */
export const ActivityInvitation = {
  status: '/api/admin/sharePullNew/getSwitch', // 获取活动状态
  statusUpdate: '/api/admin/sharePullNew/upSwitch', // 更改活动状态
  list: '/api/admin/sharePullNew/list/{{pageIndex}}/{{pageSize}}', // 点卡发放列表,
  warningList:
    '/api/admin/sharePullNew/warningUser/list/{{pageIndex}}/{{pageSize}}' // 预警用户列表
}
/**
 * @description: 头图&弹框 - 专家一键关注
 */
export const HeadExpertRecommend = {
  list: '/api/admin/recommendExpert/getPage/{{pageIndex}}/{{pageSize}}', // 列表,
  add: '/api/admin/recommendExpert/add', // 新增
  del: '/api/admin/recommendExpert/del', // 删除
  update: '/api/admin/recommendExpert/update' // 更新
}
/**
 * @description: 活动管理 - 买X赠N活动
 */
export const ActivityPresentation = {
  list: '/api/admin/buyXGetN/list/{{pageIndex}}/{{pageSize}}', // 列表
  add: '/api/admin/buyXGetN/add', // 新增
  update: '/api/admin/buyXGetN/update/{{buyXGetNActivityId}}', // 更新
  status: '/api/admin/buyXGetN/updateStatus/{{buyXGetNActivityId}}', // 更新状态
  infoById: '/api/admin/buyXGetN/get/{{buyXGetNActivityId}}', // 根据ID查询详情
  del: '/api/admin/buyXGetN/del/{{buyXGetNActivityId}}' // 删除
}
/**
 * @description: 活动管理 - 推手 - 页面二维码推广
 */
export const ActivityPushHands = {
  list: '/api/admin/pushHands/list/{{pageIndex}}/{{pageSize}}', // 列表
  add: '/api/admin/pushHands/add', // 新增
  update: '/api/admin/pushHands/update/{{pushHandsId}}', // 更新
  del: '/api/admin/pushHands/del/{{pushHandsId}}', // 删除
  status: '/api/admin/pushHands/getSwitch', // 获取活动状态
  statusUpdate: '/api/admin/pushHands/upSwitch' // 更改活动状态
}
/**
 * @description: 活动管理 - 彩票店地推
 */
export const ActivityLotteryPush = {
  list: '/api/admin/pushHandsUser/list', // 列表
  add: '/api/admin/pushHandsUser/add', // 用户新增
  update: '/api/admin/pushHandsUser/{{pushHandsUserId}}/update', // 更新
  statusUpdate: '/api/admin/pushHandsUser/{{pushHandsUserId}}/onlineOffline' // 更改用户状态
}
/**
 * @description: 聊天室
 */
export const Chat = {
  0: {
    status: 'api/admin/pushChat/getSwitch', // 聊天室开关状态
    updateStatus: 'api/admin/pushChat/upSwitch' // 聊天室开关状态更新
  },
  1: {
    status: 'api/admin/jzbf/pushChat/getSwitch', // 聊天室开关状态
    updateStatus: 'api/admin/jzbf/pushChat/upSwitch' // 聊天室开关状态更新
  }
}
/**
 * @description: socket推送状态
 */
export const SocketStatus = {
  0: {
    get: '/api/admin/push/access/getSwitch', // 获取状态
    update: '/api/admin/push/access/upSwitch' // 更新socket状态
  },
  1: {
    get: '/api/admin/jzbf/push/access/getSwitch', // 获取状态
    update: '/api/admin/jzbf/push/access/upSwitch' // 更新socket状态
  }
}
/**
 * @description: WS监控
 */
export const DeveloperWSMonitoring = {
  0: {
    accessList: '/api/admin/websocket/instance/list', // 实例列表
    statusByAccessId: '/api/admin/rocket/{{accessId}}/status', // 全局信息
    channelListByAccessId: '/api/admin/rocket/{{accessId}}/mq/channelList', // mq下的频道列表
    channelDelByAccessId: '/api/admin/rocket/{{accessId}}/mq/channel/remove', // 删除频道
    clientQueryById: '/api/admin/rocket/{{accessId}}/client/query', // sid查询
    clientDelById: '/api/admin/rocket/{{accessId}}/client/remove', // 删除SID
    msgDispatch: 'api/admin/rocket/{{accessId}}/dispatcher/msg/info', // 消息下发统计
    msgPub: 'api/admin/rocket/{{accessId}}/pub/msg/info' // 消息新增统计
  },
  1: {
    accessList: '/api/admin/jzbf/websocket/instance/list', // 实例列表
    statusByAccessId: '/api/admin/jzbf/rocket/{{accessId}}/status', // 全局信息
    channelListByAccessId: '/api/admin/jzbf/rocket/{{accessId}}/mq/channelList', // mq下的频道列表
    channelDelByAccessId:
      '/api/admin/jzbf/rocket/{{accessId}}/mq/channel/remove', // 删除频道
    clientQueryById: '/api/admin/jzbf/rocket/{{accessId}}/client/query', // sid查询
    clientDelById: '/api/admin/jzbf/rocket/{{accessId}}/client/remove', // 删除SID
    msgDispatch: 'api/admin/jzbf/rocket/{{accessId}}/dispatcher/msg/info', // 消息下发统计
    msgPub: 'api/admin/jzbf/rocket/{{accessId}}/pub/msg/info' // 消息新增统计
  }
}
/**
 * @description: 新旧数据商赛事匹配
 */
export const MatchBinding = {
  oldList: '/api/admin/nano/map/old/matchList', // 旧数据商赛事列表
  newList: '/api/admin/nano/map/nano/matchList', // 新数据商赛事列表
  oldLeagueList: '/api/admin/nano/map/old/leagueMatchList', // 旧数据商联赛列表,
  newLeagueList: '/api/admin/nano/map/nano/leagueMatchList', // 新数据商联赛列表
  bindById: '/api/admin/nano/map/forceMatch', // 绑定
  unbindById: '/api/admin/nano/map/delMatch' // 解绑
}
/**
 * @description: 聊天室管理--聊天室数据统计
 */
export const ChatroomStatistics = {
  0: {
    user: {
      get: '/api/metrics/chat/stats/info', // 获取聊天室人数统计
      export: '/api/metrics/chat/stats/info/export' // 导出聊天室人数统计
    },
    vote: {
      get: '/api/metrics/vote/stats/count' // 投票用户统计
    }
  },
  1: {
    user: {
      get: '/api/metrics/jzbf/chat/stats/info', // 获取聊天室人数统计
      export: '/api/metrics/jzbf/chat/stats/info/export' // 导出聊天室人数统计
    },
    vote: {
      get: '/api/metrics/jzbf/vote/stats/count' // 投票用户统计
    }
  }
}
/**
 * @description: 聊天室管理--驻场专家
 */
export const ChatroomExpert = {
  list: '/api/admin/residentExpert/list/{{pageIndex}}/{{pageSize}}', // 获取驻场专家列表
  add: '/api/admin/residentExpert/add', // 新建驻场专家
  edit: '/api/admin/residentExpert/update', // 更新驻场专家
  delete: '/api/admin/residentExpert/del/{{statusExtendId}}' // 删除驻场专家
}
/**
 * @description: 聊天室管理--聊天室通知
 */
export const ChatroomNotice = {
  // 单场通知
  single: {
    list: '/api/admin/chatSystem/special/list/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/chatSystem/special/add', // 新建通知
    editnickname: '/api/admin/admin/updateNickname' // 修改管理员昵称
  },
  // 全局通知
  global: {
    list: '/api/admin/chatSystem/global/list/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/chatSystem/global/add', // 新建通知
    delete: '/api/admin/chatSystem/global/del/{{chatSystemAnnounceId}}' // 删除通知
  }
}
/**
 * @description: 活动--聊天室抽奖
 */
export const ActivityDrawLottery = {
  list: '/api/admin/drawLottery/activity/list', // 活动列表
  add: '/api/admin/drawLottery/activity/add', // 新增活动
  updateRecHomePage: '/api/admin/drawLottery/activity/updateRecHomePage', // 更新是否首页
  updateStatus: '/api/admin/drawLottery/activity/updateStatus', // 活动状态开关
  delete: '/api/admin/drawLottery/activity/delete', // 删除活动
  listById: '/api/admin/drawLottery/lottery/list', // 获取活动的抽奖条目列表
  addById: '/api/admin/drawLottery/lottery/add', // 新增抽奖条目
  updateById: '/api/admin/drawLottery/lottery/update', // 更新抽奖条目
  deleteById: '/api/admin/drawLottery/lottery/delete' // 删除抽奖条目
}
/**
 * @description: 活动--首页信息流广告
 */
export const Advertise = {
  list: '/api/admin/advertising/list',
  add: '/api/admin/advertising/add', // 新增广告
  update: '/api/admin/advertising/update',
  advertiseTypeList: '/api/admin/advertising/type/list' // 广告类型列表
}
/**
 * @description: 财务管理--推手订单明细
 */
export const FinanceCpsOrderDetail = {
  list: '/api/metrics/pushHands/orderDetail/stats', // 列表
  export: '/api/metrics/pushHands/orderDetail/export', // 导出
  setDespositRate: '/api/admin/expert/netIncome/pushHandsDepositRate/set', // 设置滚动折扣率
  delDespositRate: '/api/admin/expert/netIncome/pushHandsDepositRate/clear' // 清除滚动折扣率
}
/**
 * @Description: 开发者-修复管理
 */
export const DeveloperFix = {
  matchLive: '/api/admin/fix/nano/clear/live/text', // 新数据商文章直播修复
  matchThread:
    '/api/admin/fix/thread/allThread/fixDataErrorResetThreadOver/{{matchInfoId}}', // 赛事方案结算修复
  matchStatusScore:
    '/api/admin/fix/match/updateStatusScore/{{matchInfoId}}/{{matchStatus}}/{{homeScore}}/{{guestScore}}', // 赛事状态和比分修复
  matchCache: '/api/admin/fix/match/cleanDataCache', // 赛事数据缓存清理
  matchTeam: '/api/admin/fix/match/matchTeam/updateMatchTeam/{{teamId}}', // 修改球队竞彩名称
  matchLeague:
    '/api/admin/fix/match/matchLeague/updateMatchLeague/{{leagueMatchId}}', // 修改联赛竞彩名称
  matchNano: '/api/admin/fix/nano/score/fixdata', // 雷速实时比分修复接口
  commonCache: '/api/admin/fix/del/cache', // 通过KEY清除缓存
  expertCacheById:
    '/api/admin/fix/expert/deleteExpertCanBetCountKey/{{expertId}}', // 专家可投注方案数清除缓存
  expertAutoFixAll: '/api/admin/fix/expert/expertCanBetCount/autoFixAllExpert', // 自动修复所有专家可投注方案数
  expertWinFixAll: '/api/admin/fix/expert/win/autoFixAllExpert', // 自动修复所有专家连红数
  expertWinById: '/api/admin/fix/expert/expert/win/autoFix', // 修复指定专家连红数
  expertWinGetValueById: '/api/admin/fix/expert/expert/win/autoFix/getValue', // 获取自动修复专家连红计算结果
  expertWinManualFix: '/api/admin/fix/expert/win/manualFix', // 手动修复专家连红
  expertPopularityRank:
    '/api/admin/fix/expert/rank/flushPopularityRankListCache/{{categoryId}}', // 清除周人气榜缓存
  userCacheById: '/api/admin/fix/user/delUserCache/{{userId}}', // 清除用户缓存
  serviceDishRoadInit: '/api/admin/fix/init/dishRoad', // 初始化盘路榜
  eloPredictOneMatch: '/api/admin/fix/elo/predictOneMatch/{{matchInfoId}}', // 预测单个赛事红彩指数
  eloDelMatch: '/api/admin/fix/elo/deleteElo/{{matchInfoId}}', // 红彩指数删除赛事预测
  eloSettlement: '/api/admin/fix/elo/settlement/{{matchInfoId}}', // 红彩指数修复结算
  eloListCache: '/api/admin/fix/elo/cache/list/delete', // 红彩指数清除列表缓存
  eloCacheById: '/api/admin/fix/elo/cache/detail/delete/{{matchInfoId}}', // 红彩指数清除赛事缓存
  serviceDelLeagueRating:
    '/api/admin/fix/elo/delCompetitionRatingScoreList/{{leagueMatchId}}', // 清空联赛等级分排行
  serviceDelTeamScore:
    '/api/admin/fix/elo/delTeamRatingScore/{{leagueMatchId}}/{{teamId}}', // 清空球队等级分历史
  serviceAllTeamCache: '/api/admin/fix/elo/delAllTeamRatingScoreCache', // 清除所有联赛球队等级分缓存
  eloFetchSchedule: '/api/admin/fix/elo/fetchSchedule', // 红彩指数更新赛程等级分
  eloSendDrawMessage:
    '/api/admin/fix/elo/sendDrawOddsMessage/{{competitionCode}}/{{season}}/{{round}}', // 发送更新系数的mq消息
  eloDelStatistic: '/api/admin/fix/elo/league/statistic', // 红彩指数清空联赛统计和头部信息
  voteInit: '/api/admin/fix/matchVote/initMatchVote', // 赛事投票-初始化投票 ?matchId=1234
  voteReSettlement: '/api/admin/fix/matchVote/settleMatchVoteFinallyManual', // 赛事投票-重新结算赛事投票 ?matchId=123&appearTime=1&optionId=A
  voteCancel: '/api/admin/fix/matchVote/setMatchAllVote2Cancel', // 赛事投票-取消本赛事所有投票 ?matchId=1234
  voteClearCache: '/api/admin/fix/matchVote/clearVoteCache', // 赛事投票-清理投票信息缓存 ?voteId=1234
  voteSetHalf: '/api/admin/fix/matchVote/setMatchVote2Start', // 赛事投票-开启赛事指定时机的投票 ?matchId=1234&appearTime=1
  voteRollback: '/api/admin/fix/matchVote/rollbackMatchVoteManual', // 赛事投票-回滚赛事投票结算 ?matchId=123&appearTime=1
  getNanoData: '/api/admin/fix/nano/nano/data', // 获取数据商接口情况
  userVipStop: '/api/admin/fix/user/stopUserVIPNService', // 关闭用户VIP
  offlineList: 'api/admin/offline/list', // 离线配置列表
  offlineAdd: '/api/admin/offline/add', // h5离线配置新增
  offlineOn: '/api/admin/offline/update/on', // 离线配置上线
  offlineOff: '/api/admin/offline/update/off', // 离线配置下线
  offlineHistory: '/api/admin/offline/history' // 离线配置查询
}
/**
 * @Description: 聊天室-快速封禁
 * type: blockSomebody 拉黑 ADUserLabel 用户标签
 */
export const ChatroomBanned = {
  0: {
    list: '/api/admin/chat/userManage/list/{{type}}/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/chat/userManage/add/{{type}}', // 新增封禁 userId Or Account
    del: '/api/admin/chat/userManage/del/{{type}}' // 解除封禁
  },
  1: {
    list:
      '/api/admin/jzbf/chat/userManage/list/{{type}}/{{pageIndex}}/{{pageSize}}', // 列表
    add: '/api/admin/jzbf/chat/userManage/add/{{type}}', // 新增封禁 userId Or Account
    del: '/api/admin/jzbf/chat/userManage/del/{{type}}' // 解除封禁
  }
}
/**
 * @Description: 数据统计-VIP统计
 */
export const StatisticsVip = {
  vip: '/api/metrics/sp/vip/stats'
}
/**
 * @Description: 开发者-日常管理
 */
export const DeveloperManage = {}
