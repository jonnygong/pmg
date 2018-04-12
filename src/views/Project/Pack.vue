<template>
    <section>
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
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="list" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="name" label="名称" min-width="120">
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
                        {{ scope.row.status === 1 ? '可用' : scope.row.status === -1 ? '已删除' : '不可用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="update_time" label="更新时间" width="200">
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="200">
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="statusSubmit(scope.$index, scope.row)"
                               :disabled="scope.row.status === -1">
                        {{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}
                    </el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                    <el-button class="clipboard" :data-clipboard-text="`http://wx.zjnwy.com.cn/wx?pids=${scope.row.id}`"
                               type="info" size="small">复制链接
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchAction('remove')" :disabled="this.sels.length===0">批量删除</el-button>
            <el-button type="warning" @click="batchAction('disable')" :disabled="this.sels.length===0">禁用</el-button>
            <el-button type="primary" @click="batchAction('active')" :disabled="this.sels.length===0">启用</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pagesize"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="120px" :rules="editFormRules" ref="editForm">
                <el-form-item label="项目打包名称" prop="name">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item label="项目ids" prop="pids">
                    <el-input placeholder="请选择项目" :readonly="true" v-model="editForm.pids">
                        <el-button slot="append" @click="handleClear('editForm')">清空重选</el-button>
                    </el-input>
                    <el-table :data="prolist" highlight-current-row v-loading="listLoading"
                              style="width: 100%;">
                        <el-table-column prop="id" label="项目ID" sortable>
                        </el-table-column>
                        <el-table-column prop="name" label="项目名称">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template scope="scope">
                                <el-button size="small" @click="handleAddSelected(scope.row.id, 'editForm')">选中
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-row>
                        <el-col :span="24">
                            <el-button type="small" @click="getProlistData" :disabled="!proLoadMore">
                                {{proLoadMoreText}}
                            </el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="handleEditCancel">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="120px" :rules="addFormRules" ref="addForm">
                <el-form-item label="项目打包名称" prop="name">
                    <el-input v-model="addForm.name"></el-input>
                </el-form-item>
                <el-form-item label="项目ids" prop="pids">
                    <el-input placeholder="请选择项目" :readonly="true" v-model="addForm.pids">
                        <el-button slot="append" @click="handleClear('addForm')">清空重选</el-button>
                    </el-input>
                    <el-table :data="prolist" highlight-current-row v-loading="listLoading"
                              style="width: 100%;">
                        <el-table-column prop="id" label="项目ID" sortable>
                        </el-table-column>
                        <el-table-column prop="name" label="项目名称">
                        </el-table-column>
                        <el-table-column label="操作">
                            <template scope="scope">
                                <el-button size="small" @click="handleAddSelected(scope.row.id, 'addForm')">选中
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-row>
                        <el-col :span="24">
                            <el-button type="small" @click="getProlistData" :disabled="!proLoadMore">
                                {{proLoadMoreText}}
                            </el-button>
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="handleAddCancel">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
  import util from '@/utils/js';

  import Clipboard from 'clipboard';

  const MODEL_NAME = 'Pack';

  export default {
    data() {
      return {
        filters: {
          value: '',
          key: 'name',
          options: [
            {value: 'name', label: '项目打包名称'}
          ]
        },
        list: [],
        prolist: [],
        total: 0,
        page: 1,
        proPage: 1,
        pagesize: 0,
        listLoading: false,
        proListLoading: false,
        proLoadMore: true,
        proLoadMoreText: '点击加载更多',
        sels: [], //列表选中列
        proSels: [], // 项目子集选中

        editFormVisible: false, //编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入打包名称', trigger: 'blur'}
          ],
          pids: [
            {required: true, message: '请选择项目', trigger: 'blur'}
          ]
        },
        //编辑界面数据
        editForm: {
          id: 0,
          pids: '',
          name: '',
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            {required: true, message: '请输入打包名称', trigger: 'blur'}
          ],
          pids: [
            {required: true, message: '请选择项目', trigger: 'blur'}
          ]
        },
        //新增界面数据
        addForm: {
          pids: '',
          name: '',
        },
      }
    },
    methods: {
      // 格式化创建时间
      formateDate(row, column) {
        return util.formatDate.format(new Date(row.create_time * 1000), 'yyyy-MM-dd hh:mm:ss')
      },
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
          status: 1 - row.status
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
          key: this.filters.key, // 可选参数查询
          value: this.filters.value // 可选参数查询
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
        let params = {page: this.proPage};
        this.proListLoading = true;
        const res = await this.$http.post('projectSelect', params);
        this.proListLoading = false;
        if (res === null) return;
        if (typeof res.param === 'object') {
          this.prolist = this.prolist.concat(res.param);
          this.proPage++;
        } else {
          this.proLoadMore = false;
          this.proLoadMoreText = '已没有更多数据'
        }
      },
      //删除
      handleDel(index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          this.listLoading = true;
          let params = {id: row.id};
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
      //显示编辑界面
      async handleEdit(index, row) {
        this.editFormVisible = true;
        let params = {id: row.id};
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
        this.editForm = Object.assign({}, res.param.list);
        this.doDefault();
      },
      //显示新增界面
      handleAdd() {
        this.addFormVisible = true;
        this.addForm = {
          name: '',
          pids: '',
        };
        this.doDefault();
      },
      // 初始化
      doDefault() {
        this.prolist.length = 0;
        this.proSels.length = 0;
        this.proPage = 1;
        this.proLoadMore = true;
        this.proLoadMoreText = '点击加载更多';
        this.getProlistData();
      },
      //编辑
      editSubmit() {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.editLoading = true;
              let params = {
                id: this.editForm.id,
                name: this.editForm.name,
                pids: this.editForm.pids,
              };
              const res = await this.$http.post(`${MODEL_NAME}/update`, params);
              this.editLoading = false;
              if (res === null) return;
              this.$message({
                message: res.info,
                type: 'success'
              });
              this.$refs['editForm'].resetFields();
              this.editFormVisible = false;
              this.getListData();
            });
          }
        });
      },
      //新增
      addSubmit() {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.addLoading = true;
              let params = {
                pids: this.addForm.pids,
                name: this.addForm.name,
              };
              const res = await this.$http.post(`${MODEL_NAME}/add`, params);
              this.addLoading = false;
              if (res === null) return;
              this.$message({
                message: res.info,
                type: 'success'
              });
              this.$refs['addForm'].resetFields();
              this.addFormVisible = false;
              this.getListData();
            });
          }
        });
      },
      selsChange(sels) {
        this.sels = sels;
      },
      //批量操作
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
            status: actions[action].status
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
      },
      // 添加选中项目
      handleAddSelected(id, source) {
        if (this.proSels.indexOf(id) < 0) {
          this.proSels.push(id);
          this[source].pids = this.proSels + '';
        }
      },
      handleClear(source) {
        this.proSels.length = 0;
        this[source].pids = this.proSels + ''
      },
      handleAddCancel() {
        this.addFormVisible = false;
      },
      handleEditCancel() {
        this.editFormVisible = false;
      },
    },
    mounted() {
      this.getListData();
      let clipboard = new Clipboard('.clipboard');

      clipboard.on('success', (e) => {
//        console.info('Action:', e.action);
//        console.info('Text:', e.text);
//        console.info('Trigger:', e.trigger);
        this.$message({
          message: '复制成功！',
          type: 'success'
        });

        e.clearSelection();
      });

      clipboard.on('error', (e) => {
//        console.error('Action:', e.action);
//        console.error('Trigger:', e.trigger);
        this.$message({
          message: '复制失败！',
          type: 'error'
        });
      });
    }
  }
</script>

<style scoped>
</style>