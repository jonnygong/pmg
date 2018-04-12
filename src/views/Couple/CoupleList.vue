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
                    <el-table-column prop="name" label="活动名称" min-width="150">
                    </el-table-column>
                    <el-table-column prop="start_time" label="开始时间" width="180">
                    </el-table-column>
                    <el-table-column prop="end_time" label="结束时间" width="180">
                    </el-table-column>
                    <el-table-column prop="cover" label="活动图片" width="130" sortable>
                        <template scope="scope">
                            <el-popover trigger="hover" placement="top">
                                <div class="ad-img">
                                    <img :src="scope.row.cover" :alt="scope.row.name" width="200" height="auto"
                                         v-if="scope.row.cover !== ''">
                                    <p v-else>暂无图片</p>
                                </div>
                                <div slot="reference" class="name-wrapper">
                                    <el-tag>查看图片</el-tag>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="是否可报名" width="120">
                        <template scope="scope">
                            <el-tag :type="scope.row.is_enroll === 1 ? 'success' : 'danger'">
                                {{ scope.row.is_enroll === 1 ? '可报名' : '不可报名' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template scope="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
                                {{ scope.row.status === 1 ? '可用' : scope.row.status === -1 ? '已删除' : '不可用' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="create_time" label="创建时间" width="200">
                    </el-table-column>
                    <el-table-column label="操作" width="220" fixed="right">
                        <template scope="scope">
                            <!--<el-button size="small" @click="statusSubmit(scope.$index, scope.row)"-->
                            <!--:disabled="scope.row.status === -1">-->
                            <!--{{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}-->
                            <!--</el-button>-->
                            <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                            <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除
                            </el-button>
                            <el-button v-if="scope.row.is_enroll === 1" size="small" type="info"
                                       @click="handlePoll(scope.$index, scope.row)">报名列表
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
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false" :before-close="destroyEditEditor">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <!--<el-form-item label="项目名称" prop="pid">-->
                <!--<el-input v-model="selectRow.name" auto-complete="off" :disabled="true"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="活动名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="活动分类" prop="a_id">
                    <el-select v-model.number="editForm.a_id" placeholder="选择活动分类">
                        <el-option :label="item.c_name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in category"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开始时间" prop="start_time">
                    <el-date-picker
                            v-model.date="editForm.start_time"
                            align="right"
                            type="datetime"
                            placeholder="选择日期"
                            :picker-options="pickerOptions"
                            :default-value="this.editForm.start_time">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间" prop="end_time">
                    <el-date-picker
                            v-model.date="editForm.end_time"
                            align="right"
                            type="datetime"
                            placeholder="选择日期"
                            :picker-options="pickerOptions"
                            :default-value="this.editForm.end_time">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="封面" prop="cover">
                    <i-uploader v-model="editForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="作者" prop="author">
                    <el-input type="textarea" v-model.number="editForm.author" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否可报名" prop="is_enroll">
                    <el-radio v-model="editForm.is_enroll" :label="0">不可报名</el-radio>
                    <el-radio v-model="editForm.is_enroll" :label="1">可报名</el-radio>
                </el-form-item>
                <el-form-item label="详情" prop="desc">
                    <UE :defaultMsg=editForm.desc :config=ueditor.config ref="ueEdit"></UE>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false" :before-close="destroyAddEditor">
            <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
                <!--<el-form-item label="项目名称" prop="pid">-->
                <!--<el-input v-model="selectRow.name" auto-complete="off" :disabled="true"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="活动名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="活动分类" prop="a_id">
                    <el-select v-model.number="addForm.a_id" placeholder="选择活动分类">
                        <el-option :label="item.c_name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in category"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开始时间" prop="start_time">
                    <el-date-picker
                            v-model.date="addForm.start_time"
                            align="right"
                            type="datetime"
                            placeholder="选择日期"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="结束时间" prop="end_time">
                    <el-date-picker
                            v-model.date="addForm.end_time"
                            align="right"
                            type="datetime"
                            placeholder="选择日期"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="封面" prop="cover">
                    <i-uploader v-model="addForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="作者" prop="author">
                    <el-input type="textarea" v-model.number="addForm.author" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否可报名" prop="is_enroll">
                    <el-radio v-model="addForm.is_enroll" :label="0">不可报名</el-radio>
                    <el-radio v-model="addForm.is_enroll" :label="1">可报名</el-radio>
                </el-form-item>
                <el-form-item label="详情" prop="desc">
                    <UE :defaultMsg=addForm.desc :config=ueditor.config ref="ueAdd"></UE>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>

        <el-dialog title="报名列表" size="large" v-model="pollListVisible" :close-on-click-modal="false">
            <el-row>
                <!--工具条-->
                <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
                    <el-form :inline="true">
                        <el-form-item>
                            <el-button type="primary"><a
                                    :href="`${baseUrl}/Poll/getdata?aid=${aid}&pid=${selectRow.pid}`"
                                    download="报名数据下载">报名数据下载</a></el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="getPollListData">刷新</el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="24">
                    <el-table :data="pollList" highlight-current-row v-loading="pollListLoading"
                              @selection-change="pollListselsChange" style="width: 100%;">
                        <el-table-column type="selection" width="55">
                        </el-table-column>
                        <el-table-column prop="name" label="姓名" min-width="150">
                        </el-table-column>
                        <el-table-column prop="tel" label="电话" width="180">
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
                        <el-table-column label="操作" width="80" fixed="right">
                            <template scope="scope">
                                <el-button type="danger" size="small" @click="handlePollDel(scope.$index, scope.row)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-col>
                <!--工具条-->
                <el-col :span="24" class="toolbar">
                    <el-pagination layout="prev, pager, next" @current-change="handlePollCurrentChange"
                                   :page-size="pollListpagesize"
                                   :total="pollListtotal" style="float:right;">
                    </el-pagination>
                </el-col>
            </el-row>
        </el-dialog>
    </section>
</template>

<script>
  import util from '@/utils/js';
  import UE from '@/components/UEditor';
  import Uploader from '@/components/Uploader';

  const MODEL_NAME = 'Couple';
  import configs from '@/configs/api';

  const {baseUrl} = configs;

  export default {
    data() {
      var validateAddContent = (rule, value, callback) => {
        value = this.$refs['ueAdd'].getUEContent();
        if (value === '') {
          callback(new Error('请输入内容'));
        } else {
          callback();
        }
      };
      var validateEditContent = (rule, value, callback) => {
        value = this.$refs['ueEdit'].getUEContent();
        if (value === '') {
          callback(new Error('请输入内容'));
        } else {
          callback();
        }
      };
      return {
        baseUrl: baseUrl,
        ueditor: {
          config: {
            initialFrameWidth: null,
            initialFrameHeight: 350,
            zIndex: 9999
          }
        },
        filters: {
          value: '',
          key: 'name',
          options: [
            {value: 'name', label: '活动名称'},
          ]
        },

        pollListVisible: false,
        pollList: [],
        pollListtotal: 0,
        pollListpage: 1,
        pollListpagesize: 0,
        pollListLoading: false,
        pollListsels: [], //列表选中列
        aid: 0,

        prolist: [],
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

        editFormVisible: false, //编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入活动名称', trigger: 'blur'}
          ],
          start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传封面'}
          ],
          pid: [
            {type: 'number', required: true, message: '项目名称', trigger: 'blur'}
          ],
          a_id: [
            {type: 'number', required: true, message: '请选择活动分类', trigger: 'blur'}
          ],
          is_enroll: [
            {type: 'number', required: true, message: '请选择是否可报名', trigger: 'change'}
          ],
          author: [
            {required: true, message: '请输入作者', trigger: 'blur'}
          ],
          desc: [
            {validator: validateEditContent, trigger: 'blur'}
          ],
        },
        //编辑界面数据
        editForm: {
          id: 0,
          name: '',
          start_time: '',
          end_time: '',
          cover: '',
          pid: '',
          author: '',
          desc: '',
          is_enroll: 0,
          a_id: 0
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            {required: true, message: '请输入活动名称', trigger: 'blur'}
          ],
          start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传封面'}
          ],
          a_id: [
            {type: 'number', required: true, message: '请选择活动分类', trigger: 'blur'}
          ],
          pid: [
            {type: 'number', required: true, message: '项目名称', trigger: 'blur'}
          ],
          is_enroll: [
            {type: 'number', required: true, message: '请选择是否可报名', trigger: 'change'}
          ],
          author: [
            {required: true, message: '请输入作者', trigger: 'blur'}
          ],
          desc: [
            {validator: validateAddContent, trigger: 'blur'}
          ],
        },
        //新增界面数据
        addForm: {
          name: '',
          start_time: '',
          end_time: '',
          cover: '',
          pid: 0,
          a_id: 0,
          author: '',
          desc: '',
          is_enroll: 0
        },
      };
    },
    methods: {
      // 分页切换
      handleCurrentChange(val) {
        this.page = val;
        // 获取数据
        this.getListData();
      },
      // 分页切换
      handlePollCurrentChange(val) {
        this.pollListpage = val;
        // 获取数据
        this.getPollListData();
      },
      //获取父级分类
      async getCategoryData() {
        let params = {id: 0, pid: this.selectRow.pid};
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
        this.category = res.param.cat;
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
          pid: this.selectRow.pid,
        };
        this.listLoading = true;
        const res = await this.$http.post(`${MODEL_NAME}/list`, params);
        this.listLoading = false;
        if (res === null) return;
        this.total = res.param.pages.total;
        this.pagesize = res.param.pages.pagesize;
        this.list = res.param.list;
        this.getCategoryData();
      },
      //获取列表
      async getPollListData() {
        let params = {
          aid: this.aid,
          page: this.pollListpage,
          pid: this.selectRow.pid,
        };
        this.pollListLoading = true;
        const res = await this.$http.post(`Poll/list`, params);
        this.pollListLoading = false;
        if (res === null) return;
        this.pollListtotal = res.param.pages.total;
        this.pollListpagesize = res.param.pages.pagesize;
        this.pollList = res.param.list;
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
          let params = {id: row.id, pid: this.selectRow.pid};
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
      handlePollDel(index, row) {
        this.$confirm('确认删除该记录吗?', '提示', {
          type: 'warning'
        }).then(async () => {
          this.pollListLoading = true;
          let params = {id: row.id, pid: this.selectRow.pid, status: -1};
          const res = await this.$http.post(`Poll/status`, params);
          this.pollListLoading = false;
          if (res === null) return;
          this.$message({
            message: res.info,
            type: 'success'
          });
          this.getPollListData();
        }).catch(() => {

        });
      },
      handlePoll(index, row) {
        this.pollListVisible = true;
        this.aid = row.id;
        this.getPollListData();
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
        this.editForm.id = row.id;
        this.editForm = res.param.list;
        this.category = res.param.cat;
        this.editForm.start_time = new Date(this.editForm.start_time * 1000);
        this.editForm.end_time = new Date(this.editForm.end_time * 1000);
      },
      //显示新增界面
      handleAdd() {
        this.addFormVisible = true;
        this.addForm = {
          name: '',
          start_time: '',
          end_time: '',
          cover: '',
          pid: this.selectRow.pid,
          author: '',
          a_id: '',
          desc: '',
          is_enroll: 0
        };
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
                start_time: this.editForm.start_time,
                end_time: this.editForm.end_time,
                cover: this.editForm.cover,
                pid: this.selectRow.pid,
                author: this.editForm.author,
                desc: this.getUEContent('ueEdit'),
                a_id: this.editForm.a_id,
                is_enroll: this.editForm.is_enroll
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
        this.destroyEditEditor();
      },
      //新增
      addSubmit() {
        this.$refs.addForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.addLoading = true;
              let params = {
                name: this.addForm.name,
                start_time: this.addForm.start_time,
                end_time: this.addForm.end_time,
                cover: this.addForm.cover,
                pid: this.selectRow.pid,
                author: this.addForm.author,
                desc: this.getUEContent('ueAdd'),
                a_id: this.addForm.a_id,
                is_enroll: this.addForm.is_enroll
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
        this.destroyAddEditor();
      },
      selsChange(sels) {
        this.sels = sels;
      },
      pollListselsChange(sels) {
        this.pollListsels = sels;
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
      },
      // Ueditor 获取内容
      getUEContent(ele) {
        return this.$refs[ele].getUEContent();
      },
      destroyAddEditor(done) {
        this.addForm.introduction = this.getUEContent('ueAdd');
        if (typeof done === 'function') {
          done();
        }
      },
      destroyEditEditor(done) {
        this.editForm.introduction = this.getUEContent('ueEdit');
        if (typeof done === 'function') {
          done();
        }
      },
      handleAddCancel() {
        this.addFormVisible = false;
        this.destroyAddEditor();
      },
      handleEditCancel() {
        this.editFormVisible = false;
        this.destroyEditEditor();
      },
    },
    mounted() {
      this.getProlistData();
    },
    components: {
      UE,
      'i-uploader': Uploader
    }
  };

</script>

<style lang="scss">
</style>