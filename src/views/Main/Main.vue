<template>
    <el-row class="container">
        <el-col :span="24" class="header">
            <el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
                {{collapsed ? '' : sysName}}
            </el-col>
            <el-col :span="10" class="header-bar">
                <div class="tools" @click.prevent="collapse">
                    <i class="fa fa-align-justify"></i>
                </div>
                <div class="head-nav">
                    <div class="select-project">
                    </div>
                </div>
            </el-col>
            <el-col :span="4" class="userinfo">
                <el-dropdown trigger="hover">
                    <span class="el-dropdown-link userinfo-inner">
                        <img :src="avatar"/> {{username}}</span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="handleRedirect('个人资料')">
                            个人资料
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="handleRedirect('个人设置')">
                            个人设置
                        </el-dropdown-item>
                        <el-dropdown-item divided @click.native="logout">
                            注销
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-col>
        <el-col :span="24" class="main">
            <aside :class="collapsed?'menu-collapsed':'menu-expanded'">
                <!--导航菜单-->
                <el-menu :default-active="$route.path"
                         class="el-menu-vertical-aliyun" @open="handleopen"
                         @close="handleclose"
                         @select="handleselect"
                         :collapse="collapsed"
                         unique-opened router>
                    <template v-for="(item,index) in nav">
                        <!-- 二级菜单 -->
                        <el-submenu :index="index+''"
                                    v-if="item.children && item.children.length > 0">
                            <!-- 二级菜单顶级 -->
                            <template slot="title">
                                <i :class="['icon',item.iconCls]"></i>
                                <span slot="title">{{item.name}}</span>
                            </template>
                            <!-- 二级菜单下级 -->
                            <el-menu-item-group style="overflow: hidden">
                                <!--<span slot="title">{{item.name}}</span>-->
                                <!-- && child.url-->
                                <template v-for="child in item.children">
                                    <!--无三级菜单-->
                                    <el-menu-item
                                            :index="child.url"
                                            :key="child.url"
                                            v-if="!child.children">
                                        {{child.name}}
                                    </el-menu-item>
                                    <!--有三级菜单-->
                                    <el-submenu
                                            :index="child.url"
                                            :key="child.url"
                                            v-if="child.children">
                                        <span slot="title">{{child.name}}</span>
                                        <el-menu-item v-for="subChild in child.children"
                                                      :index="subChild.url"
                                                      :key="subChild.url">
                                            {{subChild.name}}
                                        </el-menu-item>
                                    </el-submenu>
                                </template>
                            </el-menu-item-group>
                        </el-submenu>
                        <!-- 一级菜单 -->
                        <el-menu-item v-if="!item.children"
                                      :index="item.url">
                            <i :class="['icon',item.iconCls]"></i>
                            <span slot="title">{{item.name}}</span>
                        </el-menu-item>

                    </template>
                </el-menu>
            </aside>
            <section class="content-container">
                <div class="grid-content bg-purple-light">
                    <el-col :span="24" class="breadcrumb-container">
                        <strong class="title">{{$route.name}}</strong>
                        <el-breadcrumb separator="/" class="breadcrumb-inner">
                            <el-breadcrumb-item v-for="item in $route.matched"
                                                :key="item.path" :to="item.path">
                                {{ item.name }}
                            </el-breadcrumb-item>
                        </el-breadcrumb>
                    </el-col>
                    <el-col :span="24" class="content-wrapper">
                        <transition name="fade" mode="out-in">
                            <router-view></router-view>
                        </transition>
                    </el-col>
                </div>
            </section>
        </el-col>
    </el-row>
</template>

<script>
  import configs from '@/configs'

  const {title} = configs;

  export default {
    data() {
      return {
        sysName: title,
        collapsed: false
      }
    },
    computed: {
      username() {
        return this.$store.state.user.name;
      },
      avatar() {
        const reg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
        return reg.test(this.$store.state.user.avatar) ? this.$store.state.user.avatar : require("@/assets/images/loggeduser.png")
      },
      // 导航菜单
      nav() {
        return this.$store.state.nav;
      }
    },
    methods: {
      changeProject() {
//              this.$store.dispatch('changeProject')
        this.$router.push({name: '项目列表'})
      },
      handleopen() {
        //console.log('handleopen');
      },
      handleclose() {
        //console.log('handleclose');
      },
      handleselect(a, b) {

      },
      // 菜单跳转
      handleRedirect(data) {
        this.$router.push({name: data})
      },
      //退出登录
      logout() {
        this.$confirm('确认退出吗?', '提示', {
          type: 'warning'
        }).then(() => {
          this.$http.post('logout');
          this.$store.dispatch('login_out');
          this.$router.push('/login');
        }).catch(() => {

        });
      },
      // 获取用户信息
      async getUserData() {
        const res = await this.$http.post('personData');
        if (res === null) return;
        this.$store.dispatch('setUserInfo', {
          user: res.param.realname,
          avatar: res.param.thumb
        })
      },
      //折叠导航栏
      collapse() {
        this.collapsed = !this.collapsed;
      }
    },
    mounted() {
      this.getUserData();
    }
  }

</script>

<style lang="scss">
    @import "Main";
</style>