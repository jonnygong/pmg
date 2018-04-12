/**
 * 百度地图组件
 *
 * 1. 引入 components, 设置组件别名 'i-baidu-map'
 * 2. 传入参数 :lng="" :lat="" 经度，纬度 type="" 针对哪个表单
 * 3. 触发事件，@success="locationSuccess"
 * Demo
 *

   <i-baidu-map type="addForm" :lng="" :lat="" @success="locationSuccess"></i-baidu-map>

   import BaiduMap from '@/components/BaiduMap';

   components: {
    'i-baidu-map': BaiduMap
   }

   locationSuccess(data) {
     this[data.type].longitude = data.lng;
     this[data.type].latitude = data.lat;
   },


 */

export { default as default } from './BaiduMap.vue';