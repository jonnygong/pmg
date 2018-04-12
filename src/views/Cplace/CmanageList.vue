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
                                    :action="`${baseUrl}/Cplace/readexcel`"
                                    name="excel_file"
                                    :with-credentials="true"
                                    :show-file-list="false"
                                    :on-success="handleUploadSuccess"
                                    :on-error="handleUploadError">
                                <el-button type="primary">上传数据</el-button>
                            </el-upload>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary"><a :href="`${baseUrl}/Cplace/template`"
                                                         download="模板下载">模板下载</a></el-button>
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
                    <el-table-column prop="icon" label="车位图片" width="120">
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
                <el-form-item label="车位编号" prop="car_place">
                    <el-input v-model="addForm.car_place" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="车位图片" prop="cover">
                    <i-uploader v-model="addForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="楼盘" prop="hid">
                    <el-select v-model.number="addForm.hid" placeholder="选择楼盘">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in hList"></el-option>
                    </el-select>
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
                <el-form-item label="销售状态" prop="sell_status">
                    <el-select v-model.number="addForm.sell_status" placeholder="选择销售状态">
                        <el-option :label="item.label"
                                   :value="item.value"
                                   :key="index"
                                   v-for="(item, index) in sellList"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="内部控制" prop="arrange">
                    <el-select v-model.number="addForm.arrange" placeholder="选择内部控制">
                        <el-option :label="item.label"
                                   :value="item.value"
                                   :key="index"
                                   v-for="(item, index) in arrangeList"></el-option>
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
                <el-form-item label="车位编号" prop="car_place">
                    <el-input v-model="editForm.car_place" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="车位图片" prop="cover">
                    <i-uploader v-model="editForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="楼盘" prop="hid">
                    <el-select v-model.number="editForm.hid" placeholder="选择楼盘">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in hList"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="停车场" prop="park_id">
                    <el-select v-model.number="editForm.park_id" placeholder="选择停车场" @change="handleEditChange">
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
                <el-form-item label="销售状态" prop="sell_status">
                    <el-select v-model.number="editForm.sell_status" placeholder="选择销售状态">
                        <el-option :label="item.label"
                                   :value="item.value"
                                   :key="index"
                                   v-for="(item, index) in sellList"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="内部控制" prop="arrange">
                    <el-select v-model.number="editForm.arrange" placeholder="选择内部控制">
                        <el-option :label="item.label"
                                   :value="item.value"
                                   :key="index"
                                   v-for="(item, index) in arrangeList"></el-option>
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
  import util from '@/utils/js'

  const MODEL_NAME = 'Cplace';
  import configs from '@/configs/api';

  const {baseUrl} = configs;

  import Uploader from '@/components/Uploader';

  export default {
    data() {
      return {
        baseUrl: baseUrl,
        tableColumn: [
          {
            prop: 'car_place',
            label: '车位编号',
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
            prop: 'rname',
            label: '车区域',
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
          key: 'car_place',
          options: [
            {value: 'car_place', label: '车位编号'}
          ]
        },
        selectRow: {
          name: '',
          pid: '',
        },

        prolist: [],
        list: [],
        category: [],
        sellList: [
          {value: 1, label: '已售'},
          {value: 2, label: '未售'},
          {value: 3, label: '控售'}
        ],
        arrangeList: [
          {value: 1, label: '人防'},
          {value: 2, label: '非人防'},
          {value: 3, label: '普通'}
        ],
        parkList: [],
        hList: [],
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
          car_place: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          park_id: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传标识图'}
          ],
          hid: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          rid: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          sell_status: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          arrange: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ]
        },
        //编辑界面数据
        editForm: {
          id: 0,
          car_place: '',
          cover: '',
          park_id: '',
          hid: '',
          rid: '',
          sell_status: '',
          arrange: '',
          pid: 0
        },


        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          car_place: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          park_id: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传标识图'}
          ],
          hid: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          rid: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          sell_status: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ],
          arrange: [
            {type: 'number', required: true, message: '请选择内容', trigger: 'blur'}
          ]
        },
        //新增界面数据
        addForm: {
          car_place: '',
          cover: '',
          park_id: '',
          hid: '',
          rid: '',
          sell_status: '',
          arrange: '',
          pid: 0
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
          car_place: '',
          cover: '',
          park_id: '',
          hid: '',
          rid: '',
          sell_status: '',
          arrange: '',
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
        this.hList = res.param.house;
        this.rSource = res.param.region;
        this.parkList = res.param.park;
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
    },
    components: {
      'i-uploader': Uploader
    }
  }
</script>

<style lang="scss">

</style>