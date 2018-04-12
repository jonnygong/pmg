// 同步操作

// 注销
const LOGIN_OUT = (state, payload) => {
  window.localStorage.removeItem("IS_LOGIN");
};
// 登录成功
const LOGIN_SUCCESS = (state) => {
  window.localStorage.setItem("IS_LOGIN", true);
};
// 设置用户信息
const SET_USER_INFO = (state, {user, avatar}) => {
  state.user.name = user;
  state.user.avatar = avatar;
};
// 设置用户权限
const SET_USER_AUTH = (state, auth) => {
  state.user.auth = auth.concat('欢迎使用');
  state.user.hasAuth = true;
};
// 设置导航菜单
const SET_SIDE_NAV = (state, nav) => {
  // 导航菜单
  let _nav = [{
    name: '欢迎使用',
    url: "/main",
    iconCls: 'fa fa-bookmark'
  }];
  // 权限菜单对应的路由地址
  const route = {
    "系统管理": {iconCls: 'fa fa-archive', url: ''},
    "Pmsadmin/Oragnize/list": {iconCls: '', url: '/system/organization'},
    "Pmsadmin/Admin/list": {iconCls: '', url: '/system/user/index'},
    "Pmsadmin/Role/list": {iconCls: '', url: '/system/auth'},
    "Pmsadmin/Log/record": {iconCls: '', url: '/system/logs'},
    "项目管理": {iconCls: 'fa fa-unlock-alt', url: ''},
    "Pmsadmin/Project/list": {iconCls: '', url: '/project/list/index'},
    "Pmsadmin/House/list": {iconCls: '', url: '/project/house'},
    "Pmsadmin/Pack/list": {iconCls: '', url: '/project/pack'},
    "广告位": {iconCls: 'fa fa-edit', url: ''},
    "Pmsadmin/Place/list": {iconCls: '', url: '/adsplace/list'},
    "会员管理": {iconCls: 'fa fa-user', url: ''},
    "Pmsadmin/Member/list": {iconCls: '', url: '/member/list'},
    "投诉建议": {iconCls: 'fa fa-tasks', url: ''},
    "Pmsadmin/Scategory/list": {iconCls: '', url: '/complain/type'},
    "Pmsadmin/Complain/list": {iconCls: '', url: '/complain/list'},
    "Pmsadmin/Suggest/list": {iconCls: '', url: '/complain/suggestion'},
    "报事报修": {iconCls: 'fa fa-user', url: ''},
    "Pmsadmin/Rcategory/list": {iconCls: '', url: '/rcategory/type'},
    "Pmsadmin/Repair/list": {iconCls: '', url: '/rcategory/list'},
    "便民服务": {iconCls: 'fa fa-external-link', url: ''},
    "Pmsadmin/Bcategory/list": {iconCls: '', url: '/bcategory/type'},
    "Pmsadmin/Service/list": {iconCls: '', url: '/bcategory/list'},
    "首座推荐": {iconCls: 'fa fa-file-text', url: ''},
    "Pmsadmin/stcategory/list": {iconCls: '', url: '/stcategory/type'},
    "Pmsadmin/Store/list": {iconCls: '', url: '/stcategory/list'},
    "招商租赁": {iconCls: 'fa fa-leaf', url: ''},
    "Pmsadmin/Bussiness/list": {iconCls: '', url: '/bussiness/list'},
    "Pmsadmin/Company/list": {iconCls: '', url: '/bussiness/company'},
    "Pmsadmin/Question/list": {iconCls: '', url: '/bussiness/question'},
    "优惠活动": {iconCls: 'fa fa-leaf', url: ''},
    "Pmsadmin/Acategory/list": {iconCls: '', url: '/couple/type'},
    "Pmsadmin/Couple/list": {iconCls: '', url: '/couple/list'},
    "停车找车": {iconCls: 'fa fa-ra', url: ''},
    "Pmsadmin/Cplace/list": {iconCls: '', url: '/cplace/cmanage'},
    "Pmsadmin/Clist/list": {iconCls: '', url: '/cplace/clist'},
    "Pmsadmin/Cquestion/list": {iconCls: '', url: '/cplace/cquestion'},
  };
  for (let key in nav) {
    let item = nav[key];
    let _temp = {};
    let subItems = []; // 二级菜单临时数组
    if (item.children && item.children.length > 0) {
      // 二级菜单
      item.children.forEach(subItem => {
        try {
          subItems.push(Object.assign({}, {
            name: subItem.name || '',
            url: route[subItem.url].url || '',
            iconCls: route[subItem.url].iconCls || '',
          }))
        } catch(e) {}
      });
      // 一级菜单
      _temp = Object.assign({}, {
        name: item.name || '',
        url: item.url || '',
        iconCls: route[item.name].iconCls || '',
        children: subItems.slice(0)
      });
      _nav.push(_temp);
    }
  }
  state.nav = _nav;
};

export default {
  LOGIN_OUT,
  LOGIN_SUCCESS,
  SET_USER_INFO,
  SET_USER_AUTH,
  SET_SIDE_NAV
};
