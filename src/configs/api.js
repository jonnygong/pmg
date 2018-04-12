import systems from '@/configs';
const baseUrl = systems.debug ? '/api/' : 'http://api.wx.zjnwy.com.cn/pmsadmin/';
export default {
  // 接口请求baseUrl
  // baseUrl: 'https://wx.zjnwy.com.cn/pmsadmin/',
  baseUrl: baseUrl,
  // 接口文档地址
  // document: http://git.kfw001.com:9090/root/pmg-kfw001/tree/master/doc
  api: {
    // 公共接口与非通用接口
    imageUpload: 'Upload/picture', // 文件上传
    sysinfoProvince: 'Sysinfo/province', // 省市级三级联动
    sysinfoCity: 'Sysinfo/city', // 省市级三级联动
    sysinfoZone: 'Sysinfo/zone', // 省市级三级联动
    adminMenu: 'admin/menu', // 用户权限
    login: 'Login/login', // 登录接口
    logout: 'Login/logout', // 退出接口
    code: 'Login/code', // 二维码生成接口
    personData: 'Personal/data', // 个人资料接口
    logRecord: 'Log/record', // 日志管理接口
    projectSelect: ' Project/select', // 项目列表接口
  }
};
