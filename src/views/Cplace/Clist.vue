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

                    <!--<el-table-column prop="id" label="项目ID" min-width="100">-->
                    <!--</el-table-column>-->
                    <el-table-column prop="name" label="项目名称" min-width="100">
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
                            <el-input v-model="filters.value" placeholder="关键词"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="filters.key" placeholder="请选择搜索字段">
                                <el-option
                                        v-for="(item,index) in filters.options"
                                        :key="index"
                                        :label="item.label"
                                        :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" icon="search" @click="getListData">搜索</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="getListData">刷新</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>

                <!--列表-->
                <el-table :data="list" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                          style="width: 100%;">
                    <el-table-column type="selection" width="55">
                    </el-table-column>
                    <!-- 普通列表显示 -->
                    <el-table-column
                            v-for="(item,index) in tableColumn"
                            :key="index"
                            :prop="item.prop"
                            :label="item.label"
                            :min-width="item.width"
                            :sortable="item.sortable">
                    </el-table-column>
                    <!-- 图片显示 -->
                    <el-table-column prop="avater" label="会员头像">
                        <template scope="scope">
                            <el-popover trigger="hover" placement="top">
                                <div class="ad-img">
                                    <img :src="scope.row.avater" :alt="scope.row.name" width="200" height="auto"
                                         v-if="scope.row.avater !== ''">
                                    <p v-else>暂无图片</p>
                                </div>
                                <div slot="reference" class="name-wrapper">
                                    <el-tag>查看图片</el-tag>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column prop="pay_status" label="缴费状态">
                        <template scope="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                                {{ scope.row.status === 1 ? '已缴' : '未缴' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态">
                        <template scope="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
                                {{ scope.row.status === 1 ? '开启' : scope.row.status === -1 ? '删除' : '关闭' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200" fixed="right">
                        <template scope="scope">
                            <el-button size="small" @click="statusSubmit(scope.$index, scope.row)"
                                       :disabled="scope.row.status === -1">
                                {{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}
                            </el-button>
                            <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!--工具条-->
                <el-col :span="24" class="toolbar">
                    <el-button type="danger" @click="batchAction('remove')" :disabled="this.sels.length===0">
                        批量删除
                    </el-button>
                    <el-button type="warning" @click="batchAction('disable')"
                               :disabled="this.sels.length===0">
                        停用
                    </el-button>
                    <el-button type="primary" @click="batchAction('active')"
                               :disabled="this.sels.length===0">
                        启用
                    </el-button>
                    <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                                   :page-size="pagesize"
                                   :total="total" style="float:right;">
                    </el-pagination>
                </el-col>
            </el-col>
        </el-row>
    </section>
</template>

<script>
  import util from '@/utils/js'
  const MODEL_NAME = 'Clist';


  export default {
    data() {
      return {
        tableColumn: [
//          {
//            prop: 'id',
//            label: 'ID',
//            width: 80,
//            sortable: true
//          },
          {
            prop: 'car_number',
            label: '车牌号码',
            width: 120,
            sortable: false
          },
          {
            prop: 'name',
            label: '会员名',
            width: 120,
            sortable: false
          },
          {
            prop: 'tel',
            label: '会员电话',
            width: 120,
            sortable: false
          },
          {
            prop: 'pname',
            label: '所在停车场',
            width: 120,
            sortable: false
          },
          {
            prop: 'create_time',
            label: '创建时间',
            width: 200,
            sortable: false
          },
        ],
        filters: {
          value: '',
          key: 'car_number',
          options: [
            {value: 'car_number', label: '车牌号码'}
          ]
        },
        selectRow: {
          name: '',
          pid: '',
        },

        prolist: [],
        list: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], //列表选中列
      }
    },
    methods: {
      // 分页切换
      handleCurrentChange(val) {
        this.page = val;
        // 获取数据
        this.getListData();
      },
      // 修改单个状态
      async statusSubmit(index, row) {
        let params = {
          id: row.id,
          status: 1 - row.status,
          pid: this.selectRow.pid,
        };
        const res = await this.$http.post(`${MODEL_NAME}/status`, params);
        if (res === null) return;
        this.$message({
          message: '状态修改成功',
          type: 'success'
        });
        row.status = 1 - row.status;

      },
      //获取列表
      async getListData() {
        let params = {
          page: this.page,
          value: this.filters.value,
          key: this.filters.key,
          pid: this.selectRow.pid
        };
        this.listLoading = true;
        const res = await this.$http.post(`${MODEL_NAME}/list`, params);
        this.listLoading = false;
        if (res === null) return;
        this.total = res.param.pages.total;
        this.pagesize = res.param.pages.pagesize;
        this.list = res.param.list;
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
      //删除
      handleDel(index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true;
          let params = {id: row.id,pid: this.selectRow.pid};
          const res = await this.$http.post(`${MODEL_NAME}/delete`, params);
          this.listLoading = false;
          if (res === null) return;
          this.$message({
            message: res.info,
            type: 'success'
          });
          this.getListData();
        }).catch(() => {

        });
      },
      selsChange(sels) {
        this.sels = sels;
      },
      handleProChange(currentRow, oldCurrentRow) {
        this.selectRow.name = currentRow.name;
        this.selectRow.pid = currentRow.id;
        this.getListData();
      },
      batchAction(action) {
        // 三种操作：remove disable active
        let ids = this.sels.map(item => item.id).toString();
        const actions = {
          'remove': {
            tip: '删除',
            api: `${MODEL_NAME}/Delete`
          },
          'disable': {
            tip: '停用',
            api: `${MODEL_NAME}/Status`,
            status: 0
          },
          'active': {
            tip: '启用',
            api: `${MODEL_NAME}/Status`,
            status: 1
          }
        };
        this.$confirm(`确认${actions[action].tip}选中记录吗？`, '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true;
          // 非批量删除，带上 status
          let params = (action !== 'remove' ? Object.assign({
            id: ids + '',
            status: actions[action].status,
            pid: this.selectRow.pid,
          }, params) : {id: ids + ''});
          const res = await this.$http.post(actions[action].api, params);
          this.listLoading = false;
          if (res === null) return;
          this.$message({
            message: res.info,
            type: 'success'
          });
          this.getListData();
        }).catch(() => {

        });
      }
    },
    mounted() {
      this.getProlistData();
    }
  }
</script>

<style lang="scss">

</style>