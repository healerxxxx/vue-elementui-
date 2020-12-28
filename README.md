# 网易红彩运营后台项目

## 应用框架

1. 主框架采用Vue响应式框架，搭配Vue-router进行路由管理，Vue-store进行共享数据管理
2. UI库引用element-ui库
3. http请求引用axios，返回原生的promise更方便处理数据
4. Vue及element-ui均采用cdn引用的方式，减小vendor打包体积（仅element-ui生成的js就有500多k，打包到一块儿的话有点太大了）。

## 构建步骤

``` bash
安装依赖
npm install

开发环境
npm run dev

构建线上版本
npm run build

构建完的dist文件上传到cdn
npm run upload

构建后立马上传cdn
npm run build && npm run upload
```

> 构建并上传cdn后，去ndp平台部署代码

## 权限配置

1. 已有角色：33 超级管理员、34 管理员、35 高级运营、36 运营、37 产品、38 市场、39 财务、40 测试、41 客户端、24 开发者
2. router里面的权限慎动
3. 下面为对应的权限分配规则——2018-11-29

> 1、超管权限——可修改权限、分配人员
>
> 2、管理员权限——不可修改权限
>
> 3、财务权限——“财务管理”所有、“订单管理”——苹果掉单管理
>
> 4、运营权限——“文章管理”所有、“头图管理”、“专家管理”、“赛事管理”、“push管理”、“财务管理”所有、“订单管理”所有、“价格管理”所有、“优惠券管理”——优惠券组合、优惠券类别、“消息管理”所有、“用户模块”所有、“活动管理”所有、“数据统计”——专家统计、付费服务统计、月流水报表
>
> 5、高级运营权限——所有运营权限之上，增加“数据统计”——消费统计、充值统计
>
> 6、产品权限——“财务管理”——除去专家净收入、专家协议详情、“订单管理”所有、“价格管理”所有、“优惠券管理”所有、“消息管理”——除去运营消息管理、“用户模块”所有、“活动管理”——除去免费方案活动、“数据统计”——付费服务统计、月流水报表、“权限管理”、“投放管理”——渠道组管理、WAP优惠券管理、“版本维护”
>
> 7、市场权限——“文章管理”——普通文章、“头图管理”、“优惠券管理”所有、“数据统计”——月流水报表、“投放管理”——所有
>
> 8、测试权限——除“数据统计”、“财务管理”外所有

## 文件夹结构

``` bash
│  .babelrc
│  .eslintignore
│  .eslintrc.js
│  .gitignore
│  .postcssrc.js
│  index.html
│  package-lock.json
│  package.json
│  README.md
├─build // 构建相关
│      build.js
│      check-versions.js
│      config.js // 这里配置自己的账号密码，上传CDN用，git忽略文件已忽略这个js，请clone后自己新建js, 内容：module.exports = {username: 'XXX',password: 'XXX'}
│      upload.js // npm run upload 使用
│      utils.js
│      vue-loader.conf.js
│      webpack.base.conf.js
│      webpack.dev.conf.js
│      webpack.prod.conf.js
├─config // 基本配置
│      dev.env.js
│      index.js
│      prod.env.js
├─src // 开发目录
│  │  App.vue
│  │  main.js
│  ├─assets // 一些常用资源如css/img等
│  │  └─styles
│  │          commen.scss
│  │          reset.css
│  ├─component // 放全局公用的组件，如果仅子路由里面公用一些组件，请放在view文件夹下对目录新建component文件夹
│  │      Header.vue
│  ├─router // 路由
│  │      index.js
│  ├─store // 公共数据仓库
│  │      index.js
│  ├─util // 工具类文件夹
|  |      api.js // 放整个项目的api, 区分公共API，按照页面对象形式加载API
│  │      tool.js // 一些常用的工具
│  └─view // 视图页面，相当于每个文件夹为一个路由项，如果有子路由，则在上级路由视图文件夹内，建立新的子路由文件夹
│      ├─Error // 404错误页面
│      │      index.vue
│      ├─Forbidden // 没有权限页面
│      │      index.vue
│      └─Article // 文章管理
│           |  index.vue
|           └─QuizList // 竞猜方案列表
|                 index.vue
├─static
│      .gitkeep
└─theme // Element-ui 主题文件
        index.css
```

## 关于路由权限

* 整体路由配置在router中，右侧导航也是根据路由的相关配置生成的。在路由进入前，执行beforeEach的钩子，判断用户是否登录，如果未登录则跳转到登录页面，如果登录，则进行权限校验，验证通过则跳转到对应的路由，否则跳转到401页面。

## 关于构建配置一些基本项

* CDN路径：https://static.ws.126.net/163/relottery/frontend-manager/
* 高版本的webpack限制了自定义的host，故/config/index.js中dev环境增加了disableHostCheck项
* 关于css中img路径CDN引用的层级问题，由于构建完后在static文件夹下区分了css&js文件夹，所以需要修改/build/utils.js，在提取css配置中增加{publicPath: '../../'}
* 配置关闭了map选项以及去除了manifest

## 关于element-ui主题

* 参照官方提供的主题策略，本地生成对应的主题颜色的theme css然后引入
* element-ui生成主题后，有两份font字体，一份略大于10k，故放宽了url-loader对于字体大小的限制，直接以base64方式构建，减少http请求。

## mock数据配置

* 关于开发环境——host：106.2.126.22  admin.relottery.163.com，测试环境域名：qa.admin.relottery.163.com
* mock数据方法并没有依赖于webpack express转发，而是灵活得采用一种文件copy的形式，mock文件夹下的内容，会拷贝到/dist/mock，只是用于开发环境，构建并不会产生mock文件夹
* mock文件内直接放置json文件，当然这种方法只适合get请求，不过，本身思路也没有打算搞得太复杂，只是用于本地权限获取信息的调用，其他内容请求则用webpack server的代理即可。
> 注：开发过程中避免权限认证，需后端暂时去除接口权限功能
