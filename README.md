# 中节能后台管理系统

## 目录结构
```
.
├── LICENSE                          # 版权说明
├── README.md                        # 说明文档
├── build                            # webpack 配置文件
│   ├── build.js                     
│   ├── check-versions.js
│   ├── dev-client.js
│   ├── dev-server.js
│   ├── utils.js
│   ├── vue-loader.conf.js
│   ├── webpack.base.conf.js
│   ├── webpack.dev.conf.js
│   └── webpack.prod.conf.js
├── config                           # 项目主配置文件
│   ├── dev.env.js
│   ├── index.js                     # 用于调试端口修改及发布路径修改
│   └── prod.env.js
├── index.html                       # 页面入口
├── package.json                     # 构建项目所需的命令及依赖
├── src
│   ├── App.vue                      # app 主组件
│   ├── assets                       # 模块静态资源（可被 webpack 打包）
│   │   ├── images                   # 图片资源 
│   │   │   ├── loggeduser.png
│   │   │   └── logo.png
│   │   └── theme                    # 后台模板主题文件
│   │       ├── theme-darkblue
│   │       └── theme-green
│   ├── components                   # UI 通用组件
│   │   ├── BaiduMap                 # 百度地图
│   │   │   ├── BaiduMap.vue
│   │   │   └── index.js
│   │   ├── UEditor                  # UEditor 富文本编辑器
│   │   │   ├── UEditor.vue
│   │   │   └── index.js
│   │   └── Uploader                 # 单个图片上传
│   │       ├── Uploader.vue
│   │       └── index.js
│   ├── configs                      # 项目配置文件 
│   │   ├── api.js                   # 接口
│   │   └── index.js
│   ├── main.js                      # app 入口文件
│   ├── plugins                      # 项目插件
│   │   ├── axios                    # Ajax 请求 
│   │   │   ├── fn
│   │   │   │   ├── config.js        # axios 相关配置
│   │   │   │   └── index.js
│   │   │   └── index.js
│   │   ├── fastclick                # 移动端防止点击穿透 
│   │   │   └── index.js
│   │   ├── index.js
│   │   ├── router                   # Vue Router
│   │   │   ├── index.js
│   │   │   └── routes
│   │   │       └── index.js
│   │   ├── store                    # Vuex
│   │   │   ├── actions
│   │   │   │   ├── data.js
│   │   │   │   └── index.js
│   │   │   ├── getters
│   │   │   │   └── index.js
│   │   │   ├── index.js
│   │   │   ├── mutations
│   │   │   │   └── index.js
│   │   │   └── state
│   │   │       └── index.js
│   │   ├── tree-grid                # 树形表格 
│   │   │   └── index.js
│   │   └── vue-baidu-map            # 百度地图 
│   │       └── index.js
│   ├── styles                       # 通用样式
│   │   └── vars.scss
│   ├── utils                        # 通用工具函数
│   │   └── js
│   │       └── index.js
│   └── views                        # 后台页面文件
│       ├── Adsplace                 # 广告位管理            
│       │   └── Adsplace.vue
│       ├── Bcategory               
│       │   ├── BcategoryList.vue    # 服务列表
│       │   └── BcategoryType.vue    # 服务分类
│       ├── Bussiness                
│       │   ├── Bussiness.vue        # 招商列表
│       │   ├── Company.vue          # 物业信息
│       │   └── Question.vue         # 招商咨询
│       ├── Complain                 
│       │   ├── ComplainList.vue     # 投诉列表
│       │   ├── ComplainType.vue     # 投诉分类
│       │   └── Suggestion.vue       # 建议列表
│       ├── Couple                 
│       │   ├── CoupleList.vue       # 优惠活动列表
│       │   └── CoupleType.vue       # 优惠活动分类
│       ├── Cplace                 
│       │   ├── Clist.vue            # 车辆管理
│       │   ├── Cmanage.vue          # 车位管理
│       │   ├── CmanageList.vue      # 车位管理
│       │   ├── CmanagePark.vue      # 停车场管理
│       │   ├── CmanageRegion.vue    # 车区域管理
│       │   ├── CmanageRent.vue      # 车位出租
│       │   └── Cquestion.vue        # 车位咨询
│       ├── Login                    # 登录页
│       │   ├── Login.css
│       │   ├── Login.scss
│       │   └── Login.vue
│       ├── Main                     # 主页面框架
│       │   ├── Main.scss
│       │   └── Main.vue
│       ├── Member                   # 会员管理
│       │   └── Member.vue           # 房间号列表
│       ├── Personal                 # 个人中心
│       │   ├── Data.vue
│       │   └── Setting.vue
│       ├── Project                 
│       │   ├── House.vue            # 楼盘列表
│       │   ├── Pack.vue             # 项目打包
│       │   ├── Project.vue          # 项目管理主页面 
│       │   ├── ProjectAds.vue       # 广告列表
│       │   ├── ProjectList.vue      # 项目列表
│       │   ├── ProjectNotice.vue    # 公告列表
│       │   └── ProjectQrcode.vue    # 二维码列表
│       ├── Rcategory                 
│       │   ├── RcategoryList.vue    # 报修列表
│       │   └── RcategoryType.vue    # 报修分类
│       ├── Stcategory                
│       │   ├── StcategoryList.vue   # 商店列表
│       │   └── StcategoryType.vue   # 商店分类
│       ├── System                   # 系统管理
│       │   ├── Auth.vue             # 权限管理
│       │   ├── Logs.vue             # 日志管理
│       │   ├── Organization.vue     # 组织结构
│       │   ├── User.vue             # 人员管理主页面
│       │   ├── UserAuth.vue         # 权限管理
│       │   ├── UserList.vue         # 人员管理
│       │   └── UserOrg.vue          # 职员组织结构分配（未使用）
│       └── Welcome                  # 欢迎界面
│           ├── Welcome.scss
│           └── Welcome.vue
├── static                           # 静态资源（不被 webpack 处理）
│   └── ueditor                      # UEditor 库
│       ├── ...
├── .babelrc                         # babel 配置
├── .gitignore                       # git 忽略文件或文件夹配置
├── .postcssrc.js                    # postcss 配置
└── yarn.lock                        # yarn 安装依赖后存在的文件

```


## 测试、部署说明

### 开发调试
``` bash
# 安装依赖
npm install 或 yarn

# 本地调试 localhost:8181
npm run dev
```

### 上线部署

```
# 构建部署
npm run build
```

> 发布目录 `/admin`
