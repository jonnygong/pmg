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
                        <el-form-item>
                            <el-button type="primary" @click="handleAdd">新增</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-upload
                                    :action="`${baseUrl}/Rent/readexcel`"
                                    name="excel_file"
                                    :with-credentials="true"
                                    :show-file-list="false"
                                    :on-success="handleUploadSuccess"
                                    :on-error="handleUploadError">
                                <el-button type="primary">上传数据</el-button>
                            </el-upload>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary">
                                <a :href="`${baseUrl}/Rent/template`"
                                   download="模板下载" style="display:block">模板下载</a>
                            </el-button>
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
                    <el-table-column prop="status" label="状态">
                        <template scope="scope">
                            <el-tag :type="scope.row.status === 1 ? 'danger' : 'success'">
                                {{ scope.row.status === 1 ? '被租' : '空闲' }}
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
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="tel">
                    <el-input v-model="addForm.tel" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="车位编号" prop="cinfo">
                    <el-input v-model="addForm.cinfo" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input v-model.number="addForm.price" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="停车场" prop="park_id">
                    <el-select v-model.number="addForm.park_id" placeholder="选择停车场" @change="handleAddChange">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in parkList"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车区域" prop="rid">
                    <el-select v-model.number="addForm.rid" placeholder="选择车区域">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in rList"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="时间段">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="" prop="rent_start_time">
                                <el-date-picker
                                        v-model.date="addForm.rent_start_time"
                                        align="right"
                                        type="datetime"
                                        placeholder="开始时间"
                                        :picker-options="pickerOptions">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="2"> - </el-col>
                        <el-col :span="11">
                            <el-form-item label="" prop="rent_end_time">
                                <el-date-picker
                                        v-model.date="addForm.rent_end_time"
                                        align="right"
                                        type="datetime"
                                        placeholder="结束时间"
                                        :picker-options="pickerOptions">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="出租说明" prop="description">
                    <el-input type="textarea" v-model="addForm.description" auto-complete="off"></el-input>
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
                <!--<el-form-item label="所属项目" prop="pid">-->
                    <!--<el-select v-model="editForm.pid" placeholder="选择所属项目">-->
                        <!--<el-option :label="item.name"-->
                                   <!--:value="item.id"-->
                                   <!--:key="item.id"-->
                                   <!--v-for="(item, index) in prolist"></el-option>-->
                    <!--</el-select>-->
                <!--</el-form-item>-->
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="tel">
                    <el-input v-model="editForm.tel" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="车位编号" prop="cinfo">
                    <el-input v-model.number="editForm.cinfo" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input v-model.number="editForm.price" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="停车场" prop="park_id">
                    <el-select v-model.number="editForm.park_id" placeholder="选择停车场" @change="handleAddChange">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in parkList"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="车区域" prop="rid">
                    <el-select v-model.number="editForm.rid" placeholder="选择车区域">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in rList"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="时间段">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="" prop="rent_start_time">
                                <el-date-picker
                                        v-model.date="editForm.rent_start_time"
                                        align="right"
                                        type="datetime"
                                        placeholder="开始时间"
                                        :picker-options="pickerOptions">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="2"> - </el-col>
                        <el-col :span="11">
                            <el-form-item label="" prop="rent_end_time">
                                <el-date-picker
                                        v-model.date="editForm.rent_end_time"
                                        align="right"
                                        type="datetime"
                                        placeholder="结束时间"
                                        :picker-options="pickerOptions">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="出租说明" prop="description">
                    <el-input type="textarea" v-model="editForm.description" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
  import util from '@/utils/js'
  import configs from '@/configs/api';

  const {baseUrl} = configs;

  const MODEL_NAME = 'Rent';


  export default {
    data() {
      return {
        baseUrl: baseUrl,
        tableColumn: [
          {
            prop: 'name',
            label: '姓名',
            width: 120,
            sortable: false
          },
          {
            prop: 'tel',
            label: '电话',
            width: 120,
            sortable: false
          },
          {
            prop: 'rname',
            label: '车区域',
            width: 120,
            sortable: false
          },
          {
            prop: 'pname',
            label: '停车场',
            width: 120,
            sortable: false
          },
          {
            prop: 'rent_start_time',
            label: '出租开始时间',
            width: 200,
            sortable: false
          },
          {
            prop: 'rent_end_time',
            label: '出租结束时间',
            width: 200,
            sortable: false
          },
          {
            prop: 'update_time',
            label: '更新时间',
            width: 200,
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
          key: 'name',
          options: [
            {value: 'name', label: '名称'},
            {value: 'tel', label: '电话'}
          ]
        },
        selectRow: {
          name: '',
          pid: '',
        },
        pickerOptions: {
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '昨天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '一周前',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }]
        },

        prolist: [],
        list: [],
        parkList: [],
        rList: [],
        rSource: {},
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], //列表选中列

        editFormVisible: false, //编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          tel: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          cinfo: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          park_id: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          rid: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          rent_start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          rent_end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
          ],
          price: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ]
        },
        //编辑界面数据
        editForm: {
          name: '',
          tel: '',
          park_id: '',
          rid: '',
          rent_start_time: '',
          description: '',
          cinfo: '',
          rent_end_time: '',
          price: '',
          pid: 0
        },


        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          tel: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          cinfo: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          park_id: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          rid: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          rent_start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          rent_end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
          ],
          price: [
            {type: 'number', required: true, message: '请输入内容', trigger: 'blur'}
          ]
        },
        //新增界面数据
        addForm: {
          name: '',
          tel: '',
          park_id: '',
          rid: '',
          rent_start_time: '',
          description: '',
          cinfo: '',
          rent_end_time: '',
          price: '',
          pid: ''
        },
      }
    },
    methods: {
      handleUploadSuccess(response, file, fileList) {
        if (response.status === 200) {
          this.$message({
            message: '上传成功',
            type: 'success'
          });
          this.getListData();
        } else {
          this.$message({
            message: response.info,
            type: 'warning'
          });
        }
      },
      handleUploadError(err, file, fileList) {
        this.$message({
          message: '上传失败',
          type: 'warning'
        });
      },
      // 切换停车场自动读取车区域信息
      handleAddChange(val) {
        if (val === '') return;
        this.rList = this.rSource[val].slice(0);
        this.addForm.rid = this.rList[0].id;
      },
      handleEditChange(val) {
        this.rList = this.rSource[val].slice(0);
        if (this.editForm.firstLoad) {
          this.editForm.firstLoad = false;
        } else {
          this.editForm.rid = this.rList[0].id;
        }
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
          pid: this.selectRow.pid
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
      //显示新增界面
      async handleAdd() {
        this.addFormVisible = true;
        this.addForm = {
          name: '',
          tel: '',
          park_id: '',
          rid: '',
          rent_start_time: '',
          description: '',
          cinfo: '',
          rent_end_time: '',
          price: '',
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
        this.editForm = Object.assign({firstLoad: true}, res.param.list);
        this.editForm.rent_start_time = new Date(this.editForm.rent_start_time * 1000);
        this.editForm.rent_end_time = new Date(this.editForm.rent_end_time * 1000);
        this.rSource = res.param.region;
        this.parkList = res.param.park;
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
      //获取父级分类
      async getCategoryData() {
        let params = {id: 0, pid: this.selectRow.pid};
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
        this.hList = res.param.house;
        this.rSource = res.param.region;
        this.parkList = res.param.park;
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
            pid: this.selectRow.pid
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