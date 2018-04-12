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
                            <el-input v-model="filters.title" placeholder="输入服务名称"></el-input>
                        </el-form-item>
                        <el-form-item label="服务分类">
                            <el-select v-model="filters.type" placeholder="请选择服务分类">
                                <el-option
                                        v-for="(item,index) in category"
                                        :key="index"
                                        :label="item.c_name"
                                        :value="item.id">
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
                    <!--<el-table-column prop="id" label="编号ID">-->
                    <!--</el-table-column>-->
                    <el-table-column prop="pname" label="分类名称" min-width="120">
                    </el-table-column>
                    <el-table-column prop="title" label="服务名称" min-width="120">
                    </el-table-column>
                    <el-table-column prop="icon" label="标识图">
                        <template scope="scope">
                            <el-popover trigger="hover" placement="top">
                                <div class="ad-img">
                                    <img :src="scope.row.icon" :alt="scope.row.title" width="200" height="auto"
                                         v-if="scope.row.icon !== ''">
                                    <p v-else>暂无图片</p>
                                </div>
                                <div slot="reference" class="name-wrapper">
                                    <el-tag>查看图片</el-tag>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column prop="phone" label="联系电话" width="100">
                    </el-table-column>
                    <el-table-column prop="concact_person" label="联系人姓名" width="130">
                    </el-table-column>
                    <el-table-column prop="create_time" label="创建时间" width="200">
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
                            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" :rules="addFormRules" label-width="80px" ref="addForm">
                <el-form-item label="服务名称" prop="title">
                    <el-input v-model="addForm.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="链接地址" prop="link">
                    <el-input v-model="addForm.link" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="标识图" prop="icon">
                    <i-uploader v-model="addForm.icon"></i-uploader>
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="addForm.phone" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="联系人姓名" prop="concact_person">
                    <el-input v-model="addForm.concact_person" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="服务分类" prop="s_id">
                    <el-select v-model.number="addForm.s_id" placeholder="选择服务分类">
                        <el-option :label="item.c_name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in category"></el-option>
                    </el-select>
                </el-form-item>
                <!--<el-form-item label="所属项目">-->
                    <!--<el-input v-model="selectRow.name" auto-complete="off" :disabled="true"></el-input>-->
                <!--</el-form-item>-->
            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item label="服务名称" prop="title">
                    <el-input v-model="editForm.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="链接地址" prop="link">
                    <el-input v-model="editForm.link" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="标识图" prop="icon">
                    <i-uploader v-model="editForm.icon"></i-uploader>
                </el-form-item>
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="editForm.phone" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="联系人姓名" prop="concact_person">
                    <el-input v-model="editForm.concact_person" auto-complete="off"></el-input>
                </el-form-item>
                <!--<el-form-item label="所属项目">-->
                    <!--<el-input v-model="selectRow.name" auto-complete="off" :disabled="true"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="服务分类" prop="s_id">
                    <el-select v-model.number="editForm.s_id" placeholder="选择服务分类">
                        <el-option :label="item.c_name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in category"></el-option>
                    </el-select>
                </el-form-item>
                <!--<el-form-item label="所属项目" prop="pid">-->
                    <!--<el-select v-model="editForm.pid" placeholder="选择所属项目">-->
                        <!--<el-option :label="item.name"-->
                                   <!--:value="item.id"-->
                                   <!--:key="item.id"-->
                                   <!--v-for="(item, index) in prolist"></el-option>-->
                    <!--</el-select>-->
                <!--</el-form-item>-->
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
  import Uploader from '@/components/Uploader';
  import util from '@/utils/js'
  const MODEL_NAME = 'Service';


  export default {
    data() {
      return {
        filters: {
          value: '',
          key: 'title',
          type: ''
        },
        selectRow: {
          name: '',
          pid: '',
        },

        prolist: [],
        list: [],
        category: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], //列表选中列

        editFormVisible: false, //编辑界面是否显示
        editLoading: false,
        editFormRules: {
          title: [
            {required: true, message: '请输入服务名称', trigger: 'blur'}
          ],
          link: [
            {required: true, message: '请输入链接地址', trigger: 'blur'}
          ],
          icon: [
            {required: true, message: '请上传标识图'}
          ],
          phone: [
            {required: true, message: '请输入联系电话', trigger: 'blur'}
          ],
          concact_person: [
            {required: true, message: '请输入联系人姓名', trigger: 'blur'}
          ],
          s_id: [
            {type: 'number', required: true, message: '请选择服务分类', trigger: 'blur'}
          ]
        },
        //编辑界面数据
        editForm: {
          id: 0,
          title: '',
          link: '',
          icon: '',
          phone: '',
          concact_person: '',
          s_id: '',
          pid: 0
        },


        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          title: [
            {required: true, message: '请输入服务名称', trigger: 'blur'}
          ],
          link: [
            {required: true, message: '请输入链接地址', trigger: 'blur'}
          ],
          icon: [
            {required: true, message: '请上传标识图'}
          ],
          phone: [
            {required: true, message: '请输入联系电话', trigger: 'blur'}
          ],
          concact_person: [
            {required: true, message: '请输入联系人姓名', trigger: 'blur'}
          ],
          s_id: [
            {type: 'number', required: true, message: '请选择服务分类', trigger: 'blur'}
          ]
        },
        //新增界面数据
        addForm: {
          title: '',
          link: '',
          icon: '',
          phone: '',
          concact_person: '',
          s_id: '',
          pid: 0
        },
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
          type: this.filters.type,
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
        this.getCategoryData();
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
      //显示新增界面
      async handleAdd() {
        this.addFormVisible = true;
        this.addForm = {
          title: '',
          link: '',
          icon: '',
          phone: '',
          concact_person: '',
          s_id: '',
          pid: this.selectRow.pid
        };
        this.getCategoryData();
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
        this.category = res.param.cat;
      },
      //获取父级分类
      async getCategoryData() {
        let params = {id: 0, pid: this.selectRow.pid};
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
        this.category = res.param.cat;
      },
      //编辑
      editSubmit() {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.editLoading = true;
              let params = Object.assign({}, this.editForm);
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
              let params = Object.assign({}, this.addForm);
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
    },
    components: {
      'i-uploader': Uploader
    }
  }
</script>

<style lang="scss">

</style>