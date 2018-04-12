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
                    <el-table-column prop="c_name" label="分类名称" min-width="150">
                    </el-table-column>
                    <el-table-column prop="pname" label="父级" width="180">
                    </el-table-column>
                    <el-table-column prop="update_time" label="更新时间" width="200">
                    </el-table-column>
                    <el-table-column prop="create_time" label="创建时间" width="200">
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template scope="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
                                {{ scope.row.status === 1 ? '可用' : scope.row.status === -1 ? '已删除' : '不可用' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="240" fixed="right">
                        <template scope="scope">
                            <!-- <el-button size="small" @click="statusSubmit(scope.$index, scope.row)"
                                       :disabled="scope.row.status === -1">
                                {{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}
                            </el-button> -->
                            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除
                            </el-button>
                            <el-button type="info" size="small" @click="handleInfoming(scope.$index, scope.row)">通知人管理
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <!--工具条-->
                <el-col :span="24" class="toolbar">
                    <el-button type="danger" @click="batchAction('remove')" :disabled="this.sels.length===0">
                        批量删除
                    </el-button>
                    <el-button type="warning" @click="batchAction('disable')" :disabled="this.sels.length===0">
                        禁用
                    </el-button>
                    <el-button type="primary" @click="batchAction('active')" :disabled="this.sels.length===0">
                        启用
                    </el-button>
                    <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                                   :page-size="pagesize"
                                   :total="total" style="float:right;">
                    </el-pagination>
                </el-col>
            </el-col>
        </el-row>


        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item label="分类名称" prop="c_name">
                    <el-input v-model="editForm.c_name" auto-complete="off" ></el-input>
                </el-form-item>
                <!--<el-form-item label="所属项目">-->
                    <!--<el-select v-model="editForm.pid" placeholder="选择所属项目">-->
                        <!--<el-option :label="item.name"-->
                                   <!--:value="item.id"-->
                                   <!--:key="item.id"-->
                                   <!--v-for="(item, index) in prolist"></el-option>-->
                    <!--</el-select>-->
                <!--</el-form-item>-->
                <el-form-item label="父级" prop="p_id">
                    <el-select v-model="editForm.p_id" placeholder="选择父级">
                        <el-option :label="item.c_name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in category"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
                <!--<el-form-item label="项目名称">-->
                    <!--<el-input v-model="selectRow.name" auto-complete="off" :disabled="true"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="分类名称" prop="c_name">
                    <el-input v-model="addForm.c_name" auto-complete="off" ></el-input>
                </el-form-item>
                <el-form-item label="父级"  prop="p_id">
                    <el-select v-model="addForm.p_id" placeholder="选择父级">
                        <el-option :label="item.c_name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in category"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>

         <!--通知人管理-->
        <el-dialog title="通知人管理" v-model="infoFormVisible" :close-on-click-modal="false">
            <el-form :model="infoForm" label-width="80px" :rules="infoFormRules" ref="infoForm">
                <el-button type="success" size="small" icon="plus"
                           style="margin-bottom: 10px;"
                           @click="addTelephone">添加手机号
                </el-button>
                <el-row :gutter="24" v-for="(item,index) in telephoneList" :key="index">
                    <el-col :span="21">
                        <el-form-item :label="`手机号${index+1}`"
                                      prop="telephone">
                            <el-input v-model="telephoneList[index]"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2">
                        <el-button type="danger" size="small" icon="delete2" @click="delTelephone(index)"></el-button>
                    </el-col>
                </el-row>
                 <img :src="`${baseUrl}/Infoadmin/qcode?cid=${this.infoForm.id}&pid=${this.selectRow.pid}&type=3`" alt="" width="150" height="150">
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="infoFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="infoSubmit" :loading="infoLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
  import util from '@/utils/js'
  import configs from '@/configs/api';

  const {baseUrl} = configs;
  const MODEL_NAME = 'Rcategory';

  export default {
    data() {
      return {
        baseUrl: baseUrl,
        filters: {
          value: '',
          key: 'c_name',
          options: [
            {value: 'c_name', label: '分类名称'}
          ]
        },
        prolist: [],
        category: [],
        list: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], //列表选中列
        selectRow: {
          name: '',
          pid: 0
        },

        editFormVisible: false, //编辑界面是否显示
        editLoading: false,
        editFormRules: {
          c_name: [
            {required: true, message: '请输入名称', trigger: 'blur'}
          ],
          p_id: [
            {type: 'number', required: true, message: '请选择父级', trigger: 'blur'}
          ],
        },
        //编辑界面数据
        editForm: {
          id: 0,
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          c_name: [
            {required: true, message: '请输入名称', trigger: 'blur'}
          ],
          p_id: [
            {type: 'number', required: true, message: '请选择父级', trigger: 'blur'}
          ],
        },
        //新增界面数据
        addForm: {
          c_name: '',
          p_id: ''
        },
        
        infoFormVisible: false, //编辑界面是否显示
        infoLoading: false,
        infoFormRules: {
          telephone: [
            {required: true, message: '请输入回复内容', trigger: 'blur'}
          ],
        },
        //编辑界面数据
        infoForm: {
          id: 0,
          telephone: '',
        },
        telephoneList: []
      }
    },
    methods: {
       // 显示通知人管理
      async handleInfoming(index, row) {
        this.infoFormVisible = true;
        let params = {
          cid: row.id,
          type: 3,
          pid: this.selectRow.pid,
        };
        const res = await this.$http.post(`Infoadmin/info`, params);
        if (res === null) return;
        if (res.param) { 
          this.infoForm.id = res.param.cid;
        }
        if (res.param.telephone.indexOf(',') > -1) {
          this.telephoneList = res.param.telephone.split(',');
        } else {
          this.telephoneList = [res.param.telephone];
        }
      },
      addTelephone() {
        this.telephoneList.push('');
      },
      delTelephone(index) {
        this.telephoneList.splice(index, 1);
      },
      async infoSubmit() {
        this.$refs.infoForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.infoLoading = true;
              this.infoForm.telephone = this.telephoneList + '';
              const res = await this.$http.post(`Infoadmin/rsave`, this.infoForm);
              this.infoLoading = false;
              if (res === null) return;
              this.$message({
                message: res.info,
                type: 'success'
              });
              this.$refs['infoForm'].resetFields();
              this.infoFormVisible = false;
            });
          }
        });
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
        let params = {id: 0};
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
      //显示编辑界面
      async handleEdit(index, row) {
        this.editFormVisible = true;
        let params = {
          id: row.id,
          pid: row.pid,
        };
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
        this.editForm = res.param.list;
        this.category = this.formateCategory(res.param.cat);
      },
      //显示新增界面
      handleAdd() {
        this.addFormVisible = true;
        this.addForm = {
          c_name: '',
          p_id: ''
        };
        this.getCategoryData();
      },
      // 获取分类列表
      async getCategoryData() {
        let params = { id: 0, pid: this.selectRow.pid };
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
        this.category = this.formateCategory(res.param.cat);
      },
      //编辑
      editSubmit() {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.editLoading = true;
              let params = {
                id: this.editForm.id,
                p_id: this.editForm.p_id,
                c_name: this.editForm.c_name,
                pid: this.selectRow.pid,
                path: this.editForm.path
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
                c_name: this.addForm.c_name,
                pid: this.selectRow.pid,
                p_id: this.addForm.p_id
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
      changeProject(row, event, column) {
        this.selectRow.pid = row.id;
        this.getListData();
      },
      handleProChange(currentRow, oldCurrentRow) {
        this.selectRow.name = currentRow.name;
        this.selectRow.pid = currentRow.id;
        this.getListData();
      },
      /**
       *  处理分类层级，传入 data <层级数组>
       *  返回层级数据
       * */
      formateCategory(data) {
        // 层级数据处理
        let select = [];
        data.forEach((item, index) => {
          let _tag = '| -- ';
          // 根据不同的层级 dep 数值，添加横线
          for (let i = 0; i < item.dep; i++) { _tag = _tag + '| -- ' }
          let tempObj = { id: item.id, pid: item.pid, c_name: _tag + item.c_name};
          select.push(tempObj);
        });
        return select.slice(0);
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