/*
 * @Description: base.js存储一些常用的状态类型，如赛事、方案等，还包括一些基本的类型配置，如push跳转类型等
 * @Company: Netease
 * @Author: lijida@corp.netease.com
 * @Date: 2018-12-19 16:53:19
 * @LastEditors: lijida
 * @LastEditTime: 2020-10-12 11:39:56
 */
export default {
  goodsType: {
    0: [
      {
        id: 1,
        name: '专家方案'
      },
      {
        id: 2,
        name: '交叉盘(老)'
      },
      {
        id: 3,
        name: '澳彩五星'
      },
      {
        id: 4,
        name: '盘赔变动'
      },
      {
        id: 5,
        name: '点卡'
      },
      {
        id: 6,
        name: '红彩指数'
      },
      {
        id: 8,
        name: '交叉盘(MAJIA1)'
      },
      {
        id: 9,
        name: '交叉盘(MAJIA2)'
      },
      {
        id: 10,
        name: '交叉盘(MAJIA3)'
      },
      {
        id: 11,
        name: '交叉盘(新)'
      },
      {
        id: 13,
        name: 'VIP大会员'
      },
      {
        id: 14,
        name: '数字彩方案'
      },
      {
        id: 15,
        name: '旋转矩阵付费'
      }
    ],
    1: [
      {
        id: 1,
        name: '专家方案'
      },
      {
        id: 3,
        name: '澳彩五星'
      },
      {
        id: 4,
        name: '盘赔变动'
      },
      {
        id: 5,
        name: '点卡'
      },
      {
        id: 6,
        name: '红彩指数'
      },
      {
        id: 13,
        name: 'VIP大会员'
      }
    ]
  },
  payTerminal: {
    0: [
      {
        id: 0,
        name: '其他'
      },
      {
        id: 2,
        name: 'iOS'
      },
      {
        id: 1,
        name: 'Android'
      },
      {
        id: 3,
        name: 'PC'
      },
      {
        id: 4,
        name: 'WAP'
      },
      {
        id: 5,
        name: 'PRVIP'
      },
      {
        id: 6,
        name: 'MAJIA1'
      },
      {
        id: 7,
        name: 'MAJIA2'
      },
      {
        id: 8,
        name: 'MAJIA2'
      },
      {
        id: 9,
        name: 'iOSWAP'
      },
      {
        id: 10,
        name: 'AndroidWAP'
      },
      {
        id: 11,
        name: 'AndroidHousedWAP'
      },
      {
        id: 12,
        name: 'iOSHousedWAP'
      },
      {
        id: 13,
        name: 'HousedWAP'
      }
    ],
    1: [
      {
        id: 0,
        name: '其他'
      },
      {
        id: 2,
        name: 'iOS'
      },
      {
        id: 1,
        name: 'Android'
      },
      {
        id: 3,
        name: 'PC'
      },
      {
        id: 4,
        name: 'WAP'
      },
      {
        id: 5,
        name: 'iOSWAP'
      },
      {
        id: 6,
        name: 'WX_MINIPRO'
      }
    ]
  },
  urlRedirectType: [
    {
      id: 2,
      type: 'EXPERT',
      name: '专家'
    },
    {
      id: 3,
      type: 'MATCH',
      name: '赛事'
    },
    {
      id: 4,
      type: 'THREAD',
      name: '方案'
    },
    {
      id: 1,
      type: 'URL',
      name: 'URL'
    },
    {
      id: 5,
      type: 'FAVORITE_EXPERT',
      name: '关注专家方案列表'
    },
    {
      id: 6,
      type: 'FREE_THREAD',
      name: '免费专区列表'
    },
    {
      id: 7,
      type: 'SOCCER_REAL',
      name: '足球即时列表(今)'
    },
    {
      id: 8,
      type: 'BASKETBALL_REAL',
      name: '篮球即时列表(今)'
    },
    {
      id: 9,
      type: 'SOCCER_RESULTS',
      name: '足球赛果列表(昨)'
    },
    {
      id: 10,
      type: 'BASKETBALL_RESULTS',
      name: '篮球赛果列表(昨)'
    },
    {
      id: 11,
      type: 'SOCCER_COURSE',
      name: '足球赛程列表(明)'
    },
    {
      id: 12,
      type: 'BASKETBALL_COURSE',
      name: '篮球赛程列表(明)'
    },
    {
      id: 13,
      type: 'SFC',
      name: '胜负彩列表'
    },
    {
      id: 14,
      type: 'COUPON',
      name: '优惠券列表'
    },
    {
      id: 15,
      type: 'FAVORITE_MATCH',
      name: '关注赛事列表'
    },
    {
      id: 16,
      type: 'RECHARGE',
      name: '充值页'
    },
    {
      id: 17,
      type: 'BALANCE',
      name: '余额页'
    },
    {
      id: 18,
      type: 'ORDER_GOODS',
      name: '我的订单'
    },
    {
      id: 19,
      type: 'CROSS_TRADE',
      name: '交叉盘列表'
    },
    {
      id: 20,
      type: 'PANELLIST',
      name: '盘路榜列表'
    },
    {
      id: 21,
      type: 'LEAGUE_MATCH',
      name: '联赛列表'
    },
    {
      id: 22,
      type: 'MACAUS_MATCHLIST',
      name: '澳彩五星列表'
    },
    {
      id: 23,
      type: 'MACAUS_MATCHPAGE',
      name: '澳彩五星详情页'
    },
    {
      id: 24,
      type: 'ODDS_CHANGE',
      name: '盘赔变动详情页'
    },
    {
      id: 25,
      type: 'POINT_CARDLIST',
      name: '点卡列表'
    },
    {
      id: 26,
      type: 'POINT_CARDPAGE',
      name: '点卡详情页'
    },
    {
      id: 27,
      type: 'ELO_MATCHLIST',
      name: '红彩指数列表'
    },
    {
      id: 28,
      type: 'ELO_MATCHPAGE',
      name: '红彩指数详情页'
    },
    {
      id: 30,
      type: 'NEW_CROSS_TRADE_PAY',
      name: '交叉盘购买页'
    },
    {
      id: 31,
      type: 'QUIZ_INDEX',
      name: '竞猜首页'
    },
    {
      id: 32,
      type: 'QUIZ_HISTORY_BET',
      name: '拉新竞猜历史记录'
    },
    {
      id: 33,
      type: 'SUBJECT_QUIZ_INDEX',
      name: '拉新竞猜首页'
    },
    {
      id: 34,
      type: 'H5_URL_REDIRECT_MODEL',
      name: '竞猜类型链接'
    }
  ],
  articleStatus: [
    {
      id: 1,
      name: '未开始'
    },
    {
      id: 2,
      name: '进行中'
    },
    {
      id: 3,
      name: '已结束'
    },
    {
      id: 4,
      name: '比赛取消'
    },
    {
      id: 5,
      name: '审核未过'
    },
    {
      id: 6,
      name: '已下线'
    }
  ],
  matchStatus: [
    {
      id: 1,
      name: '未开始'
    },
    {
      id: 2,
      name: '进行中'
    },
    {
      id: 3,
      name: '已结束'
    },
    {
      id: 4,
      name: '已延期'
    },
    {
      id: 5,
      name: '已取消'
    }
  ],
  tcmMatchStatus: [
    {
      id: 1,
      name: '未开始'
    },
    {
      id: 2,
      name: '进行中'
    },
    {
      id: 3,
      name: '已结束'
    },
    {
      id: 4,
      name: '已封盘'
    },
    {
      id: 5,
      name: '已延期'
    },
    {
      id: 6,
      name: '已取消'
    }
  ],
  tcmMallType: [
    {
      id: 1,
      name: '实物'
    },
    {
      id: 2,
      name: '内部虚拟物品'
    },
    {
      id: 3,
      name: '外部虚拟物品'
    }
  ],
  tcmMallOrderStatus: [
    {
      id: 1,
      name: '创建'
    },
    {
      id: 2,
      name: '待确认'
    },
    {
      id: 3,
      name: '确认兑换'
    },
    {
      id: 4,
      name: '驳回兑换'
    },
    {
      id: 5,
      name: '已发货'
    },
    {
      id: 6,
      name: '重新发货'
    },
    {
      id: 7,
      name: '确认收货'
    }
  ],
  tcmOrderStatus: [
    {
      id: 0,
      name: '订单处理中'
    },
    {
      id: 1,
      name: '下单成功'
    },
    {
      id: 2,
      name: '已结算'
    },
    {
      id: 3,
      name: '已退单'
    },
    {
      id: 4,
      name: '提前结算处理中'
    },
    {
      id: 5,
      name: '提前结算'
    },
    {
      id: 6,
      name: '下单失败'
    },
    {
      id: 7,
      name: '订单无效'
    },
    {
      id: 8,
      name: '下单被拒'
    },
    {
      id: 9,
      name: '二次结算'
    }
  ],
  // 充值订单状态
  rechargeOrderStatus: [
    {
      id: 1,
      name: '待支付'
    },
    {
      id: 2,
      name: '成功'
    },
    {
      id: 3,
      name: '失败'
    },
    {
      id: 4,
      name: '退款中'
    },
    {
      id: 5,
      name: '已退款'
    },
    {
      id: 6,
      name: '关闭'
    },
    {
      id: 7,
      name: '卖家资料审核中'
    },
    {
      id: 8,
      name: '退款失败'
    },
    {
      id: 9,
      name: '冻结'
    }
  ],
  // 来源
  // appSource: [
  //   {
  //     id: 0,
  //     name: '红彩'
  //   },
  //   {
  //     id: 1,
  //     name: '精准比分'
  //   }
  // ],
  // 支付渠道
  payChannel: [
    {
      id: 1,
      name: 'IPA'
    },
    {
      id: 2,
      name: '支付宝'
    },
    {
      id: 3,
      name: '微信'
    },
    {
      id: 4,
      name: '网易宝'
    },
    {
      id: 5,
      name: '京东支付'
    },
    {
      id: 6,
      name: '银联云闪付'
    }
  ],
  // 订单类型
  orderType: [
    {
      id: 1,
      name: '红豆充值'
    },
    {
      id: 2,
      name: '现金订阅'
    },
    {
      id: 3,
      name: '点卡购买'
    }
  ],
  // 商品订单状态
  productOrderStatus: [
    {
      id: 1,
      name: '冻结'
    },
    {
      id: 2,
      name: '取消'
    },
    {
      id: 3,
      name: '结算'
    },
    {
      id: 4,
      name: '退豆'
    },
    {
      id: 5,
      name: '不中退'
    },
    {
      id: 6,
      name: '首单不中退'
    },
    {
      id: 7,
      name: '清除账号红豆'
    },
    {
      id: 8,
      name: '五连黑不中退'
    },
    {
      id: 9,
      name: '不中退券退款'
    }
  ],
  // 商品支付方式
  productPayType: {
    0: [
      {
        id: 1,
        name: '红豆'
      }, {
        id: 2,
        name: '现金'
      }, {
        id: 3,
        name: '点卡'
      }
    ],
    1: [
      {
        id: 1,
        name: '金币'
      }, {
        id: 2,
        name: '现金'
      }, {
        id: 3,
        name: '点卡'
      }
    ]
  },
  // 文章类型
  threadType: [
    {
      id: 1,
      name: '足球'
    },
    {
      id: 2,
      name: '篮球'
    },
    {
      id: 3,
      name: '胜负彩'
    },
    {
      id: 4,
      name: '任九'
    },
    {
      id: 5,
      name: '胜负彩&任九'
    },
    {
      id: 6,
      name: '北单足球'
    },
    {
      id: 7,
      name: '北单篮球'
    }
  ],
  accountType: [
    {
      id: 1,
      name: '个人'
    },
    {
      id: 2,
      name: '机构'
    }
  ],
  region: [
    {
      id: 0,
      name: '国内'
    },
    {
      id: 1,
      name: '国外'
    }, {
      id: 2,
      name: '外国人中国卡'
    }, {
      id: 3,
      name: '机构'
    }
  ],
  questionStatus: [
    {
      id: 0,
      name: '待回复'
    },
    {
      id: 1,
      name: '已驳回'
    },
    {
      id: 2,
      name: '已超时'
    },
    {
      id: 3,
      name: '已拒绝'
    },
    {
      id: 4,
      name: '已回复'
    }
  ],
  couponType: [
    {
      id: 1,
      name: '折扣券'
    },
    {
      id: 2,
      name: '减满券'
    },
    {
      id: 3,
      name: '直减券'
    },
    // {
    //   id: 4,
    //   name: '免单券'
    // },
    {
      id: 5,
      name: '不中退'
    },
    {
      id: 6,
      name: '体验券'
    },
    {
      id: 7,
      name: '充值券'
    }
  ],
  vipLevel: [
    {
      id: 0,
      name: '基础用户'
    },
    {
      id: 1,
      name: '银卡用户'
    },
    {
      id: 2,
      name: '金卡用户'
    },
    {
      id: 3,
      name: '钻石卡用户'
    },
    {
      id: 4,
      name: '至尊VIP用户'
    }
  ]
}
