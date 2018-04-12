const Main = () => import ('@/views/Main/Main.vue');

/**
 *  路由与导航分离
 *  路由对象 meta 标签
 *  meta: {
 *  requiresAuth: true,
 *  alias: 'Pmsadmin/Oragnize/list' // 用于权限的校验
 *  }
 *
 */

let routes = [
  // 登录页
  {
    path: '/login',
    component: () =>
      import ('@/views/Login/Login.vue'),
    name: '用户登录'
  },
  // 欢迎页
  {
    path: '/',
    component: Main,
    name: '',
    redirect: '/main',
    children: [{
      path: '/main',
      component: () =>
        import ('@/views/Welcome/Welcome.vue'),
      name: '欢迎使用'
    }]
  },
  // 系统管理
  {
    path: '/system',
    component: Main,
    name: '系统管理',
    redirect: '/system/organization',
    children: [{
      path: '/system/organization',
      component: () =>
        import ('@/views/System/Organization.vue'),
      name: '组织结构',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Oragnize/list'}
    },
      {
        path: '/system/user',
        component: () =>
          import ('@/views/System/User.vue'),
        name: '人员管理',
        redirect: '/system/user/index',
        children: [{
          path: '/system/user/index',
          component: () =>
            import ('@/views/System/UserList.vue'),
          name: '职员列表',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Admin/list'}
        },
          {
            path: '/system/user/auth/:id',
            component: () =>
              import ('@/views/System/UserAuth.vue'),
            name: '权限管理',
            meta: {requiresAuth: true, alias: 'Pmsadmin/Admin/list'}
          },
          {
            path: '/system/user/org',
            component: () =>
              import ('@/views/System/UserOrg.vue'),
            name: '职员权限管理',
            meta: {requiresAuth: true, alias: 'Pmsadmin/Admin/list'}
          }
        ]
      },
      {
        path: '/system/auth',
        component: () =>
          import ('@/views/System/Auth.vue'),
        name: '角色管理',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Role/list'}
      },
      {
        path: '/system/logs',
        component: () =>
          import ('@/views/System/Logs.vue'),
        name: '日志管理',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Log/record'}
      }
    ]
  },
  // 项目管理
  {
    path: '/project',
    component: Main,
    name: '项目管理',
    redirect: '/project/list',
    children: [{
      path: '/project/list',
      component: () =>
        import ('@/views/Project/Project.vue'),
      name: '项目列表',
      redirect: '/project/list/index',
      children: [
        {
          path: '/project/list/index',
          component: () =>
            import ('@/views/Project/ProjectList.vue'),
          name: '项目列表',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Project/list'}
        },
        // {
        //   path: '/project/list/couple',
        //   component: () =>
        //     import ('@/views/Project/ProjectCouple.vue'),
        //   name: '优惠活动',
        //   meta: {requiresAuth: true, alias: 'Pmsadmin/Project/list'}
        // },
        {
          path: '/project/list/notice',
          component: () =>
            import ('@/views/Project/ProjectNotice.vue'),
          name: '公告列表',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Project/list'}
        },
        {
          path: '/project/list/ads',
          component: () =>
            import ('@/views/Project/ProjectAds.vue'),
          name: '广告列表',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Project/list'}
        },
        {
          path: '/project/list/qrcode',
          component: () =>
            import ('@/views/Project/ProjectQrcode.vue'),
          name: '二维码列表',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Project/list'}
        },
      ]
    },
      {
        path: '/project/house',
        component: () =>
          import ('@/views/Project/House.vue'),
        name: '楼盘列表',
        meta: {requiresAuth: true, alias: 'Pmsadmin/House/list'}
      },
      {
        path: '/project/pack',
        component: () =>
          import ('@/views/Project/Pack.vue'),
        name: '项目打包',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Pack/list'}
      }
    ]
  },
  // 广告位
  {
    path: '/adsplace',
    component: Main,
    name: '广告位',
    redirect: '/adsplace/list',
    children: [{
      path: '/adsplace/list',
      component: () =>
        import ('@/views/Adsplace/Adsplace.vue'),
      name: '广告位列表',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Place/list'}
    }]
  },
  // 会员管理
  {
    path: '/member',
    component: Main,
    name: '会员管理',
    redirect: '/member/list',
    children: [{
      path: '/member/list',
      component: () =>
        import ('@/views/Member/Member.vue'),
      name: '房间号列表',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Member/list'}
    }]
  },
  // 投诉建议
  {
    path: '/complain',
    component: Main,
    name: '投诉建议',
    redirect: '/complain/type',
    children: [{
      path: '/complain/type',
      component: () =>
        import ('@/views/Complain/ComplainType.vue'),
      name: '投诉分类',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Scategory/list'}
    },
      {
        path: '/complain/list',
        component: () =>
          import ('@/views/Complain/ComplainList.vue'),
        name: '投诉列表',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Complain/list'}
      },
      {
        path: '/complain/suggestion',
        component: () =>
          import ('@/views/Complain/Suggestion.vue'),
        name: '建议列表',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Suggest/list'}
      }
    ]
  },
  // 报事报修
  {
    path: '/rcategory',
    component: Main,
    name: '报事报修',
    redirect: '/rcategory/type',
    children: [{
      path: '/rcategory/type',
      component: () =>
        import ('@/views/Rcategory/RcategoryType.vue'),
      name: '报修分类',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Rcategory/list'}
    },
      {
        path: '/rcategory/list',
        component: () =>
          import ('@/views/Rcategory/RcategoryList.vue'),
        name: '报修列表',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Repair/list'}
      }
    ]
  },
  // 优惠活动
  {
    path: '/couple',
    component: Main,
    name: '优惠活动',
    redirect: '/couple/type',
    children: [{
      path: '/couple/type',
      component: () =>
        import ('@/views/Couple/CoupleType.vue'),
      name: '活动分类',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Acategory/list'}
    },
      {
        path: '/couple/list',
        component: () =>
          import ('@/views/Couple/CoupleList.vue'),
        name: '活动列表',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Couple/list'}
      }
    ]
  },
  // 便民服务
  {
    path: '/bcategory',
    component: Main,
    name: '便民服务',
    redirect: '/bcategory/type',
    children: [{
      path: '/bcategory/type',
      component: () =>
        import ('@/views/Bcategory/BcategoryType.vue'),
      name: '服务分类',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Bcategory/list'}
    },
      {
        path: '/bcategory/list',
        component: () =>
          import ('@/views/Bcategory/BcategoryList.vue'),
        name: '服务列表',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Service/list'}
      }
    ]
  },
  // 首座推荐
  {
    path: '/stcategory',
    component: Main,
    name: '首座推荐',
    redirect: '/stcategory/type',
    children: [{
      path: '/stcategory/type',
      component: () =>
        import ('@/views/Stcategory/StcategoryType.vue'),
      name: '商店分类',
      meta: {requiresAuth: true, alias: 'Pmsadmin/stcategory/list'}
    },
      {
        path: '/stcategory/list',
        component: () =>
          import ('@/views/Stcategory/StcategoryList.vue'),
        name: '商店列表',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Store/list'}
      }
    ]
  },
  // 招商租赁
  {
    path: '/bussiness',
    component: Main,
    name: '招商租赁',
    redirect: '/bussiness/type',
    children: [{
      path: '/bussiness/list',
      component: () =>
        import ('@/views/Bussiness/Bussiness.vue'),
      name: '招商列表',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Bussiness/list'}
    },
      {
        path: '/bussiness/company',
        component: () =>
          import ('@/views/Bussiness/Company.vue'),
        name: '物业信息',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Company/list'}
      },
      {
        path: '/bussiness/question',
        component: () =>
          import ('@/views/Bussiness/Question.vue'),
        name: '招商咨询',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Question/list'}
      }
    ]
  },
  // 停车找车
  {
    path: '/cplace',
    component: Main,
    name: '停车找车',
    redirect: '/cplace/manage',
    children: [{
      path: '/cplace/cmanage',
      component: () =>
        import ('@/views/Cplace/Cmanage.vue'),
      name: '停车找车',
      meta: {requiresAuth: true, alias: 'Pmsadmin/Cplace/list'},
      redirect: '/cplace/cmanage/park',
      children: [
        {
          path: '/cplace/cmanage/list',
          component: () =>
            import ('@/views/Cplace/CmanageList.vue'),
          name: '车位管理',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Cplace/list'}
        },
        {
          path: '/cplace/cmanage/park',
          component: () =>
            import ('@/views/Cplace/CmanagePark.vue'),
          name: '停车场管理',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Cplace/list'}
        },
        {
          path: '/cplace/cmanage/region',
          component: () =>
            import ('@/views/Cplace/CmanageRegion.vue'),
          name: '车区域管理',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Cplace/list'}
        },
        {
          path: '/cplace/cmanage/rent',
          component: () =>
            import ('@/views/Cplace/CmanageRent.vue'),
          name: '车位出租',
          meta: {requiresAuth: true, alias: 'Pmsadmin/Cplace/list'}
        }
      ]
    },
      {
        path: '/cplace/clist',
        component: () =>
          import ('@/views/Cplace/Clist.vue'),
        name: '车辆管理',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Clist/list'}
      },
      {
        path: '/cplace/cquestion',
        component: () =>
          import ('@/views/Cplace/Cquestion.vue'),
        name: '车位咨询',
        meta: {requiresAuth: true, alias: 'Pmsadmin/Cquestion/list'}
      }
    ]
  },
  // 个人中心
  {
    path: '/personal',
    component: Main,
    name: '个人中心',
    redirect: '/personal/data',
    children: [{
      path: 'data',
      component: () =>
        import ('@/views/Personal/Data.vue'),
      name: '个人资料',
    },
      {
        path: 'setting',
        component: () =>
          import ('@/views/Personal/Setting.vue'),
        name: '个人设置',
      }
    ]
  },
  // 404 页面跳转
  {
    path: '*',
    redirect: {path: '/'}
  }
];

export default routes;