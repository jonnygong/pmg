/**
 * 二次封装 Element UI Uploader组件
 *
 * 1. 引入 components, 设置组件别名 'i-uploader'
 * 2. 传入参数 v-model:<form.data> 用于上传图片的表单字段
 * Demo
 * <i-uploader v-model="editForm.cover"></i-uploader>
 *
 * import Uploader from '@/components/Uploader';
 *
 * components: {
 *  'i-uploader': Uploader
 * }
 *
 */

export { default as default } from './Uploader.vue';