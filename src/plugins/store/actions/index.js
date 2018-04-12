// 异步操作，发 commit 给 mutation
import http from '@/plugins/axios';
// 登录成功
const login = ({commit}) => {
  commit('LOGIN_SUCCESS');
};
// 设置已登录用户信息
const setUserInfo = ({commit}, data) => {
  commit('SET_USER_INFO', data);
};
// 注销
const login_out = ({commit}) => {
  // 登出
  commit('LOGIN_OUT');
};
// 获取用户权限
const getUserAuth = async ({commit}) => {
  const res = await http.post('adminMenu', {});
  if (res === null) return;
  commit('SET_USER_AUTH', res.param.auth);
  commit('SET_SIDE_NAV', res.param.nav);
};

export default {
  login,
  setUserInfo,
  login_out,
  getUserAuth
};
