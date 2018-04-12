<template>
    <section>
        <el-row>
            <el-col :span="4" style="padding-top: 10px;">

                <el-table :data="prolist"
                          highlight-current-row
                          v-loading="listLoading"
                          @current-change="handleProChange"
                          ref="projectTable"
                          style="width: 100%;">

                    <el-table-column prop="name" label="项目名称">
                    </el-table-column>
                </el-table>

            </el-col>
            <el-col :span="19" :offset="1">
                <el-col :span="24" style="color: #666"><i class="el-icon-information" style="padding-right:10px;"></i>当前选中项目为：
                    <el-tag>{{ selectRow.name }}</el-tag>
                </el-col>
                <!--工具条-->
                <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
                    <el-form :inline="true" :model="filters">
                        <el-form-item>
                            <el-select v-model="filters.park_id" placeholder="按停车场导出">
                                <el-option
                                        v-for="(item,index) in filters.options.park"
                                        :key="index"
                                        :label="item.name"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" icon="search" @click="getListData(false)">搜索</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="getListData(false)">刷新</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary"><a
                                    :href="`${baseUrl}/Cplace/batchqrcode?park_id=${filters.park_id}&pid=${selectRow.pid}`"
                                    download="二维码图片导出">二维码图片导出</a></el-button>
                        </el-form-item>
                    </el-form>
                </el-col>

                <!--列表-->
                <el-col>
                    <el-row :gutter="20" v-loading="listLoading">
                        <p style="text-align: center" v-if="list.length === 0">暂无二维码。</p>
                        <el-col :span="6" v-for="(item, index) in list" :key="index">
                            <el-card :body-style="{ padding: '0' }" style="margin-bottom: 10px; box-shadow: none;">
                                <img :src="item.img" class="image">
                                <div style="padding: 14px;">
                                    <span>{{item.address}}</span>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                    <el-row type="flex" justify="center">
                        <el-button type="primary" @click="handlePrint" :disabled="noData" v-if="list.length !== 0">打印
                        </el-button>
                        <el-button @click="loadMore" :disabled="noData" v-if="list.length !== 0">加载更多二维码</el-button>
                    </el-row>
                </el-col>

            </el-col>
        </el-row>

    </section>
</template>

<script>
  import util from '@/utils/js';
  import configs from '@/configs/api';

  const {baseUrl} = configs;

  const MODEL_NAME = 'Cplace';


  export default {
    data() {
      return {
        baseUrl: baseUrl,
        filters: {
          park_id: '',
          options: {
            park: []
          }
        },
        selectRow: {
          name: '',
          pid: '',
        },
        prolist: [],
        list: [],
        page: 1,
        listLoading: false,
        noData: false,
        sels: [], //列表选中列
      }
    },
    methods: {
      handlePrint() {
        window.print()
      },
      //获取列表
      async getListData(loadmore = false) {
        if(!loadmore) {
          this.page = 1;
          this.noData = false;
        }
        let params = {
          page: this.page,
          pid: this.selectRow.pid,
          park_id: this.filters.park_id
        };
        this.listLoading = true;
        const res = await this.$http.post(`${MODEL_NAME}/qlist`, params);
        this.listLoading = false;
        if (res === null) return;
        if (res.param.list.length === 0) {
          this.noData = true;
          this.$message({
            message: '没有更多数据了',
            type: 'warning'
          });
        }
        if (loadmore) {
          this.list = this.list.concat(res.param.list);
        } else {
          this.list = res.param.list;
        }
        this.filters.options.park = res.param.park;
        this.filters.options.park.push({id: '', name: '全部'})
      },
      loadMore() {
        this.page++;
        this.getListData(true);
      },
      //获取项目列表
      async getProlistData() {
        let params = {};
        this.listLoading = true;
        const res = await this.$http.post('projectSelect', params);
        this.listLoading = false;
        if (res === null) return;
        this.prolist = res.param;
        this.$refs.projectTable.setCurrentRow(this.prolist[0]);
      },
      handleProChange(currentRow, oldCurrentRow) {
        this.selectRow.name = currentRow.name;
        this.selectRow.pid = currentRow.id;
        this.page = 1;
        this.list.length = 0;
        this.noData = false;
        this.getListData();
      },
    },
    mounted() {
      this.getProlistData();
    }
  }
</script>

<style lang="scss" scoped>
    .time {
        font-size: 13px;
        color: #999;
    }

    .image {
        width: 100%;
        display: block;
    }
</style>