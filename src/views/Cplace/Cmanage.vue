<template>
    <section style="padding-top: 20px">
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
  import UE from '@/components/UEditor/UEditor.vue';

export default {
  data() {
    return {
      activeName: this.$route.fullPath,
      subMenu: [
        {
          label: '停车场管理',
          name: '/cplace/cmanage/park'
        },
        {
          label: '车区域管理',
          name: '/cplace/cmanage/region'
        },
        {
          label: '车位管理',
          name: '/cplace/cmanage/list'
        },
        {
          label: '车位出租',
          name: '/cplace/cmanage/rent'
        }
      ]
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