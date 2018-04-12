<template>
    <section style="padding-top: 20px;">

        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
            <el-tab-pane v-for="(item, index) in subMenu"
                         :label="item.label"
                         :name="item.name"
                         :key="index"></el-tab-pane>
        </el-tabs>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>

    </section>
</template>

<script>
  export default {
    data() {
      return {
        subMenu: [
          {
            label: '项目列表',
            name: '/project/list/index'
          },
          // {
          //   label: '优惠活动',
          //   name: '/project/list/couple'
          // },
          {
            label: '公告列表',
            name: '/project/list/notice'
          },
          {
            label: '广告列表',
            name: '/project/list/ads'
          },
          {
            label: '二维码列表',
            name: '/project/list/qrcode'
          }
        ]
      }
    },
    computed: {
      activeName: {
        get(){
          return this.$route.fullPath
        },
        set(){
          // do nothing
        }
      }
    },
    methods: {
      handleClick(tab, event) {
        // 切换路由
        this.$router.push(tab.name)
      }
    }
  }

</script>

<style lang="scss">
</style>