import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'
import { loginApi } from '../util/api'
import { Loading } from 'element-ui'
import { arraySome } from '../util/tool'
/**
 * 组件import命名规则，其实是为了避免命名纠结
 * 大驼峰规则，根据文件夹深度进行串联命名
 */
import View from '../view' // 控制子路由跳转
import Error from '../view/Error'
import Forbidden from '../view/Forbidden'
import ArticleQuizList from '../view/Article/QuizList'
import ArticleQuizDetail from '../view/Article/QuizDetail'
import ArticleNumLotteryList from '../view/Article/NumLotteryList'
import AuthApi from '../view/Auth/Api'
import AuthRoles from '../view/Auth/roles'
import AuthUsers from '../view/Auth/Users'
import AppVersion from '../view/App/Version'
import AppHotFix from '../view/App/HotFix'
import AppSwitch from '../view/App/Switch'
import DeveloperLog from '../view/Developer/Log'
import MarketApk from '../view/Market/Apk'
import MarketChannelPromotion from '../view/Market/ChannlePromotion'
import MarketShortUrl from '../view/Market/ShortUrl'
import UserList from '../view/User/List'
import UserDetail from '../view/User/Detail'
import UserAccount from '../view/User/Account'
import OrderIphone from '../view/Order/Iphone'
import OrderPaymentList from '../view/Order/Payment/List'
import OrderPaymentDetail from '../view/Order/Payment/Detail'
import OrderProductList from '../view/Order/Product/List'
import OrderProductDetail from '../view/Order/Product/Detail'
import OrderRechargeList from '../view/Order/Recharge/List'
import OrderRechargeDetail from '../view/Order/Recharge/Detail'
import OrderTcmOrderList from '../view/Order/TcmOrder/List'
import OrderTcmOrderDetail from '../view/Order/TcmOrder/TcmDetail'
import OrderQuizOrderDetail from '../view/Order/TcmOrder/QuizDetail'
import ExpertList from '../view/Expert/List'
import ExpertDetail from '../view/Expert/Detail'
import ExpertQuestion from '../view/Expert/Question'
import HeadSlideShow from '../view/Head/Slideshow'
import HeadRedRank from '../view/Head/RedRank'
import MatchList from '../view/Match/List'
import MatchDetail from '../view/Match/Detail'
import MatchBinding from '../view/Match/Binding'
import NumLottery from '../view/NumLottery'
import ArticleReviewList from '../view/Article/ReviewList'
import ArticleThreadList from '../view/Article/ThreadList'
import Push from '../view/Push'
import PriceRecharge from '../view/Price/Recharge'
import PriceProduct from '../view/Price/Product'
import FinanceRecharge from '../view/Finance/Recharge'
import FinanceOncePurchase from '../view/Finance/OncePurchase'
import FinanceExpertIncome from '../view/Finance/ExpertIncome'
import FinanceExpertProtocol from '../view/Finance/ExpertProtocol'
import FinanceMonthlyOfSp from '../view/Finance/MonthlyOfSp'
import FinanceMonthlyConfirmedOfSp from '../view/Finance/MonthlyConfirmedOfSp'
import FinancePointCardAdd from '../view/Finance/PointCardAdd'
import FinancePointCardConfirmed from '../view/Finance/PointCardConfirmed'
import FinancePointConfirmed from '../view/Finance/PointConfirmed'
import FinanceTcmConsum from '../view/Finance/TcmConsum'
import TcmDetailCreditAdd from '../view/TcmDetail/CreditAdd'
import TcmDetailCreditConsume from '../view/TcmDetail/CreditConsume'
import TcmDetailNadd from '../view/TcmDetail/NAdd'
import TcmDetailNConsume from '../view/TcmDetail/NConsume'
import MessageSystem from '../view/Message/System'
import MessageOperating from '../view/Message/Operating'
import MessageCategory from '../view/Message/Category'
import MessageCondition from '../view/Message/Condition'
import UserBlacnklist from '../view/User/Blacklist'
import TcmMatchList from '../view/TcmMatch/List'
import TcmMatchDetail from '../view/TcmMatch/Detail'
import AppleFlow from '../view/AppleFlow'
import MarketChannelGroup from '../view/Market/ChannelGroup'
import MarketWapCoupon from '../view/Market/WapCoupon'
import MarketCooperationCompany from '../view/Market/CooperationCompany'
import MarketCooperationApp from '../view/Market/CooperationApp'
import ActivityTcmMallList from '../view/Activity/TcmMallList'
import ActivityTcmMallOrder from '../view/Activity/TcmMallOrder'
import ActivityQuizForNew from '../view/Activity/QuizForNew'
import ActivityApp from '../view/Activity/App'
import ActivityWap from '../view/Activity/Wap'
import ActivityFreeThread from '../view/Activity/FreeThread'
import StatisticsConsumer from '../view/Statistics/Consumer'
import StatisticsExpert from '../view/Statistics/Expert'
import StatisticsJournal from '../view/Statistics/Journal'
import StatisticsProduct from '../view/Statistics/Product'
import StatisticsRecharge from '../view/Statistics/Recharge'
import CouponPackage from '../view/Coupon/Package'
import CouponCategory from '../view/Coupon/Category'
import CouponChannel from '../view/Coupon/Channel'
import CouponDetail from '../view/Coupon/Detail'
import ActivityInvitation from '../view/Activity/Invitation'
import HeadExpertRecommend from '../view/Head/ExpertRecommend'
import ActivityPresentation from '../view/Activity/Presentation'
import ActivityPushHands from '../view/Activity/PushHands'
import ActivityLotteryPush from '../view/Activity/LotteryPush'
import HeadRedRankStatistics from '../view/Head/RedRankStatistics'
import DeveloperWSMonitoring from '../view/Developer/WSMonitoring'
import ChatroomStatistics from '../view/Chatroom/Statistics'
import ChatroomNotice from '../view/Chatroom/Notice'
import ChatroomExpert from '../view/Chatroom/ResidentExpert'
import MatchRecommend from '../view/Match/Recommend'
import ActivityDrawLottery from '../view/Activity/DrawLottery'
import Advertise from '../view/Activity/Advertise'
import FinanceCpsOrderDetail from '../view/Finance/CpsOrderDetail'
import DeveloperFix from '../view/Developer/Fix'
import ChatroomBanned from '../view/Chatroom/Banned'
import DeveloperWSMonitoringJZBF from '../view/Developer/WSMonitoring-jzbf'
import StatisticsVip from '../view/Statistics/Vip'
import DeveloperManage from '../view/Developer/Manage'
import OffLine from '../view/Developer/OffLine'

Vue.use(Router)
/**
 * @description 公共路由表，整个权限管理以及导航均在这里设置
 * @param {String} path 路径
 * @param {String} name 组件名称
 * @param {Function} component 组件
 * @param {Object} meta 辅助信息
 * @param {Array} children 子路由
 * @param {String} title 用于导航名字
 * @param {Boolean} navShow 是否在导航中显示
 * @param {Array} roles 权限数组
 */
export const routerMap = [
  {
    path: '*',
    name: 'Error',
    component: Error,
    meta: {
      title: '404',
      navShow: false
    }
  },
  {
    path: '/401',
    name: 'Forbidden',
    component: Forbidden,
    meta: {
      title: '401',
      navShow: false
    }
  },
  {
    path: '/',
    name: 'home',
    redirect: '/article/quizlist',
    meta: {
      title: '首页',
      navShow: false
    }
  },
  {
    path: '/article',
    name: 'Article',
    component: View,
    redirect: '/article/quizlist',
    meta: {
      title: '文章管理',
      roles: [33, 34, 35, 36, 38, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'quizlist',
        name: 'ArticleQuizList',
        component: ArticleQuizList,
        meta: {
          title: '竞彩文章',
          roles: [33, 34, 35, 36, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'numlotterylist',
        name: 'ArticleNumLotteryList',
        component: ArticleNumLotteryList,
        meta: {
          title: '数字彩文章',
          roles: [33, 34, 35, 36, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'reviewlist',
        name: 'ArticleReviewList',
        component: ArticleReviewList,
        meta: {
          title: '复盘文章',
          roles: [33, 34, 35, 36, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'threadlist',
        name: 'ArticleThreadList',
        component: ArticleThreadList,
        meta: {
          title: '普通文章',
          roles: [33, 34, 35, 36, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'quizdetail/:id',
        name: 'ArticleQuizDetail',
        component: ArticleQuizDetail,
        meta: {
          title: '文章详情',
          roles: [33, 34, 35, 36, 38, 40]
        }
      }
    ]
  },
  {
    path: '/heade',
    name: 'Head',
    component: View,
    meta: {
      title: '头图&弹框',
      roles: [33, 34, 35, 36, 38, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'slideshow',
        name: 'HeadSlideShow',
        component: HeadSlideShow,
        meta: {
          title: '头图列表',
          roles: [33, 34, 35, 36, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'redrank',
        name: 'HeadRedRank',
        component: View,
        meta: {
          title: '红人榜管理',
          roles: [33, 34, 35, 36, 38, 40],
          keepAlive: true,
          navShow: true
        },
        children: [
          {
            path: 'list',
            name: 'HeadRedRankList',
            component: HeadRedRank,
            meta: {
              title: '红人榜列表',
              roles: [33, 34, 35, 36, 38, 40],
              keepAlive: true,
              navShow: true
            }
          },
          {
            path: 'stat',
            name: 'HeadRedRankStatistics',
            component: HeadRedRankStatistics,
            meta: {
              title: '红人榜统计',
              roles: [33, 34, 35, 36, 38, 40],
              keepAlive: true,
              navShow: true
            }
          }
        ]
      },
      {
        path: 'expertrecommend',
        name: 'HeadExpertRecommend',
        component: HeadExpertRecommend,
        meta: {
          title: '专家弹框',
          roles: [33, 34, 35, 36, 38, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/expert',
    name: 'Expert',
    component: View,
    redirect: '/expert/list',
    meta: {
      title: '专家管理',
      roles: [33, 34, 35, 36, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'list',
        name: 'ExpertList',
        component: ExpertList,
        meta: {
          title: '专家列表',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'question',
        name: 'ExpertQuestion',
        component: ExpertQuestion,
        meta: {
          title: '心愿卡管理',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'detail/:id',
        name: 'ExpertDetail',
        component: ExpertDetail,
        meta: {
          title: '专家详情',
          roles: [33, 34, 35, 36, 40]
        }
      }
    ]
  },
  {
    path: '/match',
    name: 'Match',
    component: View,
    redirect: '/match/list',
    meta: {
      title: '赛事管理',
      roles: [33, 34, 35, 36, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'list',
        name: 'MatchList',
        component: MatchList,
        meta: {
          title: '赛事列表',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'binding',
        name: 'MatchBinding',
        component: MatchBinding,
        meta: {
          title: '新旧赛事匹配',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: ':id',
        name: 'MatchDetail',
        component: MatchDetail,
        meta: {
          title: '赛事详情',
          roles: [33, 34, 35, 36, 40]
        }
      },
      {
        path: '/recommend',
        name: 'MatchRecommend',
        component: MatchRecommend,
        meta: {
          title: '首页赛事推荐配置',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/numlottery',
    name: 'NumLottery',
    component: NumLottery,
    meta: {
      title: '数字彩管理',
      roles: [33, 34, 35, 36, 40],
      keepAlive: true,
      navShow: true
    }
  },
  {
    path: '/chatroom',
    name: 'Chatroom',
    component: View,
    meta: {
      title: '聊天室管理',
      roles: [33, 34, 35, 36, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'statistics',
        name: 'ChatroomStatistics',
        component: ChatroomStatistics,
        meta: {
          title: '数据统计',
          roles: [33, 34, 35, 36, 40],
          navShow: true
        }
      },
      {
        path: 'notice',
        name: 'ChatroomNotice',
        component: ChatroomNotice,
        meta: {
          title: '聊天室通知',
          roles: [33, 34, 35, 36, 40],
          navShow: true
        }
      },
      {
        path: 'expert',
        name: 'ChatroomExpert',
        component: ChatroomExpert,
        meta: {
          title: '驻场专家',
          roles: [33, 34, 35, 36, 40],
          navShow: true
        }
      },
      {
        path: 'banned',
        name: 'ChatroomBanned',
        component: ChatroomBanned,
        meta: {
          title: '广告快速封禁',
          roles: [33, 34, 35, 36, 40],
          navShow: true
        }
      }
    ]
  },
  {
    path: '/tcmmatch',
    name: 'TcmMatch',
    component: TcmMatchList,
    meta: {
      title: '竞猜赛事管理',
      roles: [33, 34, 35, 36, 40],
      keepAlive: true,
      navShow: true
    }
  },
  {
    path: '/tcmmatch/:id',
    name: 'TcmMatchDetail',
    component: TcmMatchDetail,
    meta: {
      title: '竞猜赛事详情',
      roles: [33, 34, 35, 36, 40]
    }
  },
  {
    path: '/push',
    name: 'Push',
    component: Push,
    meta: {
      title: 'Push管理',
      roles: [33, 34, 35, 36, 40],
      keepAlive: true,
      navShow: true
    }
  },
  {
    path: '/finance',
    name: 'Finance',
    component: View,
    meta: {
      title: '财务管理',
      roles: [33, 34, 35, 36, 37, 39],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'recharge',
        name: 'FinanceRecharge',
        component: FinanceRecharge,
        meta: {
          title: '红豆新增',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'oncePurchase',
        name: 'FinanceOncePurchase',
        component: FinanceOncePurchase,
        meta: {
          title: '一次性消耗',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'expertIncome',
        name: 'FinanceExpertIncome',
        component: FinanceExpertIncome,
        meta: {
          title: '专家净收入',
          roles: [33, 34, 35, 36, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'expertProtocol',
        name: 'FinanceExpertProtocol',
        component: FinanceExpertProtocol,
        meta: {
          title: '专家协议详情',
          roles: [33, 34, 35, 36, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'monthlyOfSp',
        name: 'FinanceMonthlyOfSp',
        component: FinanceMonthlyOfSp,
        meta: {
          title: '包月消耗',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'monthlyConfirmedOfSp',
        name: 'FinanceMonthlyConfirmedOfSp',
        component: FinanceMonthlyConfirmedOfSp,
        meta: {
          title: '包月可确认消耗',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'pointCardAdd',
        name: 'FinancePointCardAdd',
        component: FinancePointCardAdd,
        meta: {
          title: '点卡新增',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'pointCardConfirmed',
        name: 'FinancePointCardConfirmed',
        component: FinancePointCardConfirmed,
        meta: {
          title: '点卡消耗',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'pointConfirmed',
        name: 'FinancePointConfirmed',
        component: FinancePointConfirmed,
        meta: {
          title: '点数消耗',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'tcmConsum',
        name: 'FinanceTcmConsum',
        component: FinanceTcmConsum,
        meta: {
          title: '竞猜消耗',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'cpsorderdetail',
        name: 'FinanceCpsOrderDetail',
        component: FinanceCpsOrderDetail,
        meta: {
          title: '红彩推手订单明细',
          roles: [33, 34, 35, 36, 37, 39],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/order',
    name: 'Order',
    component: View,
    meta: {
      title: '订单管理',
      roles: [33, 34, 35, 36, 37, 39, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'rechargelist',
        name: 'OrderRechargeList',
        component: OrderRechargeList,
        meta: {
          title: '充值订单管理',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'recharge/:id/:source',
        name: 'OrderRechargeDetail',
        component: OrderRechargeDetail,
        props: true,
        meta: {
          title: '充值订单详情',
          roles: [33, 34, 35, 36, 37, 40],
          navShow: false
        }
      },
      {
        path: 'iphone',
        name: 'OrderIphone',
        component: OrderIphone,
        meta: {
          title: '苹果调单管理',
          roles: [33, 34, 35, 36, 37, 39, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'productlist',
        name: 'OrderProductList',
        component: OrderProductList,
        meta: {
          title: '商品订单管理',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'product/:jzbf/:id/:appId/:type',
        name: 'OrderProductDetail',
        component: OrderProductDetail,
        props: true,
        meta: {
          title: '商品订单详情',
          roles: [33, 34, 35, 36, 37, 40]
        }
      },
      {
        path: 'paymentlist',
        name: 'OrderPaymentList',
        component: OrderPaymentList,
        meta: {
          title: '支付订单管理',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'payment/:id/:source',
        name: 'OrderPaymentDetail',
        component: OrderPaymentDetail,
        props: true,
        meta: {
          title: '支付订单详情',
          roles: [33, 34, 35, 36, 37, 40]
        }
      },
      {
        path: 'tcmlist',
        name: 'OrderTcmOrderList',
        component: OrderTcmOrderList,
        meta: {
          title: '竞猜订单管理',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'tcm/:id',
        name: 'OrderTcmOrderDetail',
        component: OrderTcmOrderDetail,
        props: true,
        meta: {
          title: 'TCM订单详情',
          roles: [33, 34, 35, 36, 37, 40],
          navShow: false
        }
      },
      {
        path: 'quiz/:id',
        name: 'OrderQuizOrderDetail',
        component: OrderQuizOrderDetail,
        props: true,
        meta: {
          title: '拉新活动订单详情',
          roles: [33, 34, 35, 36, 37, 40],
          navShow: false
        }
      }
    ]
  },
  {
    path: '/tcmdetai',
    name: 'TcmDetail',
    component: View,
    meta: {
      title: '积分/N币明细',
      roles: [33, 34, 35, 36, 39, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'creditadd',
        name: 'TcmDetailCreditAdd',
        component: TcmDetailCreditAdd,
        meta: {
          title: '积分新增',
          roles: [33, 34, 35, 36, 39, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'creditconsume',
        name: 'TcmDetailCreditConsume',
        component: TcmDetailCreditConsume,
        meta: {
          title: '积分消耗',
          roles: [33, 34, 35, 36, 39, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'nadd',
        name: 'TcmDetailNadd',
        component: TcmDetailNadd,
        meta: {
          title: 'N币新增',
          roles: [33, 34, 35, 36, 39, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'nconsume',
        name: 'TcmDetailNConsume',
        component: TcmDetailNConsume,
        meta: {
          title: 'N币消耗',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/appleflow',
    name: 'AppleFlow',
    component: AppleFlow,
    meta: {
      title: '人工掉单流程',
      roles: [33, 34, 35, 36, 40],
      keepAlive: true,
      navShow: true
    }
  },
  {
    path: '/price',
    name: 'Price',
    component: View,
    meta: {
      title: '价格管理',
      roles: [33, 34, 35, 36, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'recharge',
        name: 'PriceRecharge',
        component: PriceRecharge,
        meta: {
          title: '充值价格',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'product',
        name: 'PriceProduct',
        component: PriceProduct,
        meta: {
          title: '商品价格',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/coupon',
    name: 'Coupon',
    component: View,
    meta: {
      title: '优惠券管理',
      roles: [33, 34, 35, 36, 37, 38, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'package',
        name: 'CouponPackage',
        component: CouponPackage,
        meta: {
          title: '优惠券组合',
          roles: [33, 34, 35, 36, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'category',
        name: 'CouponCategory',
        component: CouponCategory,
        meta: {
          title: '优惠券类别',
          roles: [33, 34, 35, 36, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'channel',
        name: 'CouponChannel',
        component: CouponChannel,
        meta: {
          title: '优惠券渠道',
          roles: [33, 34, 35, 36, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'detail/:id/:source',
        name: 'CouponDetail',
        component: CouponDetail,
        meta: {
          title: '优惠券详情',
          roles: [33, 34, 35, 36, 37, 38, 40]
        }
      }
    ]
  },
  {
    path: '/message',
    name: 'Message',
    component: View,
    meta: {
      title: '消息管理',
      roles: [33, 34, 35, 36, 37, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'system',
        name: 'MessageSystem',
        component: MessageSystem,
        meta: {
          title: '系统消息',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'operating',
        name: 'MessageOperating',
        component: MessageOperating,
        meta: {
          title: '运营消息',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'category',
        name: 'MessageCategory',
        component: MessageCategory,
        meta: {
          title: '消息类别',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'condition',
        name: 'MessageCondition',
        component: MessageCondition,
        meta: {
          title: '触发条件',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/user',
    name: 'User',
    component: View,
    meta: {
      title: '用户模块',
      roles: [33, 34, 35, 36, 37, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: UserList,
        meta: {
          title: '用户列表',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'detail/:id/:source',
        name: 'UserDetail',
        component: UserDetail,
        meta: {
          title: '用户详情',
          roles: [33, 34, 35, 36, 37, 40],
          navShow: false
        },
        props: true
      },
      {
        path: 'account',
        name: 'UserAccount',
        component: UserAccount,
        meta: {
          title: '手机绑定-解绑',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'blacklist',
        name: 'UserBlacnklist',
        component: UserBlacnklist,
        meta: {
          title: '黑名单列表',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/activity',
    name: 'Activity',
    component: View,
    meta: {
      title: '活动管理',
      roles: [33, 34, 35, 36, 37, 39, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'tcmmalllist',
        name: 'ActivityTcmMallList',
        component: ActivityTcmMallList,
        meta: {
          title: '竞猜奖品管理',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'tcmmallorder',
        name: 'ActivityTcmMallOrder',
        component: ActivityTcmMallOrder,
        meta: {
          title: '竞猜兑奖订单',
          roles: [33, 34, 35, 36, 37, 39, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'quizfornew',
        name: 'ActivityQuizForNew',
        component: ActivityQuizForNew,
        meta: {
          title: '拉新竞猜活动',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'app',
        name: 'ActivityApp',
        component: ActivityApp,
        meta: {
          title: '客户端活动广场',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'wap',
        name: 'ActivityWap',
        component: ActivityWap,
        meta: {
          title: 'WAP活动',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'freethread',
        name: 'ActivityFreeThread',
        component: ActivityFreeThread,
        meta: {
          title: '免费方案',
          roles: [33, 34, 35, 36, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'invitation',
        name: 'ActivityInvitation',
        component: ActivityInvitation,
        meta: {
          title: '邀请码拉新',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'presentation',
        name: 'ActivityPresentation',
        component: ActivityPresentation,
        meta: {
          title: '买X增N活动',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'pushhands',
        name: 'ActivityPushHands',
        component: ActivityPushHands,
        meta: {
          title: '推手计划',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'lotterypush',
        name: 'ActivityLotteryPush',
        component: ActivityLotteryPush,
        meta: {
          title: '彩票店地推',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'darwlottery',
        name: 'ActivityDrawLottery',
        component: ActivityDrawLottery,
        meta: {
          title: '聊天室转盘抽奖',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'advertise',
        name: 'Advertise',
        component: Advertise,
        meta: {
          title: '首页信息流广告',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: View,
    meta: {
      title: '数据统计',
      roles: [33, 34, 35, 36, 37, 38],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'consumer',
        name: 'StatisticsConsumer',
        component: StatisticsConsumer,
        meta: {
          title: '消费统计',
          roles: [33, 34, 35, 38],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'recharge',
        name: 'StatisticsRecharge',
        component: StatisticsRecharge,
        meta: {
          title: '充值统计',
          roles: [33, 34, 35, 36],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'expert',
        name: 'StatisticsExpert',
        component: StatisticsExpert,
        meta: {
          title: '专家统计',
          roles: [33, 34, 35, 36],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'product',
        name: 'StatisticsProduct',
        component: StatisticsProduct,
        meta: {
          title: '付费服务统计',
          roles: [33, 34, 35, 36, 37],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'journal',
        name: 'StatisticsJournal',
        component: StatisticsJournal,
        meta: {
          title: '月流水报表',
          roles: [33, 34, 35, 36, 37, 38],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'vip',
        name: 'StatisticsVip',
        component: StatisticsVip,
        meta: {
          title: 'VIP统计',
          roles: [33, 34, 35, 36, 37, 38],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/auth',
    name: 'Auth',
    component: View,
    meta: {
      title: '权限管理',
      roles: [33, 34, 37],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'users',
        name: 'AuthUsers',
        component: AuthUsers,
        meta: {
          title: '用户管理',
          roles: [33],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'roles',
        name: 'AuthRoles',
        component: AuthRoles,
        meta: {
          title: '角色管理',
          roles: [33, 34, 37],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'api',
        name: 'AuthApi',
        component: AuthApi,
        meta: {
          title: '资源管理',
          roles: [33, 34, 37],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/app',
    name: 'App',
    component: View,
    meta: {
      title: '版本维护',
      roles: [33, 34, 37, 38],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'version',
        name: 'AppVersion',
        component: AppVersion,
        meta: {
          title: '发布新版',
          roles: [33, 34, 37, 38],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'hotfix',
        name: 'AppHotFix',
        component: AppHotFix,
        meta: {
          title: '热修复',
          roles: [33, 34, 37, 38],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'switch',
        name: 'AppSwitch',
        component: AppSwitch,
        meta: {
          title: '开关控制',
          roles: [33, 34, 37],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/market',
    name: 'Market',
    component: View,
    meta: {
      title: '投放管理',
      roles: [33, 34, 37, 38, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'apk',
        name: 'MarketApk',
        component: MarketApk,
        meta: {
          title: 'APK上传',
          roles: [33, 34, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'channelpromotion',
        name: 'MarketChannelPromotion',
        component: MarketChannelPromotion,
        meta: {
          title: '渠道推广管理',
          roles: [33, 34, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'shorturl',
        name: 'MarketShortUrl',
        component: MarketShortUrl,
        meta: {
          title: 'iOS短链',
          roles: [33, 34, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'channelgroup',
        name: 'MarketChannelGroup',
        component: MarketChannelGroup,
        meta: {
          title: '渠道组管理',
          roles: [33, 34, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'wapcoupon',
        name: 'MarketWapCoupon',
        component: MarketWapCoupon,
        meta: {
          title: 'WAP优惠券',
          roles: [33, 34, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'cooperationcompany',
        name: 'MarketCooperationCompany',
        component: MarketCooperationCompany,
        meta: {
          title: '合作公司配置',
          roles: [33, 34, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'cooperationapp',
        name: 'MarketCooperationApp',
        component: MarketCooperationApp,
        meta: {
          title: '合作应用配置',
          roles: [33, 34, 37, 38, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  },
  {
    path: '/developer',
    name: 'Developer',
    component: View,
    meta: {
      title: '开发者',
      roles: [24, 33, 34, 35, 36, 37, 40],
      keepAlive: true,
      navShow: true
    },
    children: [
      {
        path: 'log',
        name: 'DeveloperLog',
        component: DeveloperLog,
        meta: {
          title: '日志查询',
          roles: [24],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'ws',
        name: 'DeveloperWSMonitoring',
        component: DeveloperWSMonitoring,
        meta: {
          title: 'WS监控',
          roles: [33, 34],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'ws-jzbf',
        name: 'DeveloperWSMonitoringJZBF',
        component: DeveloperWSMonitoringJZBF,
        meta: {
          title: 'WS监控-精准比分',
          roles: [33, 34],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'fix',
        name: 'DeveloperFix',
        component: DeveloperFix,
        meta: {
          title: '修复管理',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'manage',
        name: 'DeveloperManage',
        component: DeveloperManage,
        meta: {
          title: '日常管理',
          roles: [33, 34],
          keepAlive: true,
          navShow: true
        }
      },
      {
        path: 'offline',
        name: 'OffLine',
        component: OffLine,
        meta: {
          title: '离线配置',
          roles: [33, 34, 35, 36, 37, 40],
          keepAlive: true,
          navShow: true
        }
      }
    ]
  }
]

const router = new Router({
  routes: routerMap
})

router.beforeEach((to, from, next) => {
  if (store.state.userInfo) {
    if (!to.meta.roles) {
      next()
    } else {
      if (arraySome(to.meta.roles, store.state.userInfo.roleList)) {
        next()
      } else {
        next({
          path: '/401'
        })
      }
    }
  } else {
    const userInfoLoading = Loading.service() // 整个页面的Loading
    store.dispatch('getUserInfo').then(
      () => {
        if (arraySome(to.meta.roles, store.state.userInfo.roleList)) {
          next()
        } else {
          next({
            path: '/401'
          })
        }
        userInfoLoading.close()
      },
      () => {
        userInfoLoading.close()
        window.location.href = window.location.origin + loginApi.login
      }
    )
  }
})

// 导出实例化
export default router
