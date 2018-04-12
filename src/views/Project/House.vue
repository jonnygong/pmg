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
                    <el-table-column prop="name" label="楼盘名称" width="120" sortable>
                    </el-table-column>
                    <el-table-column prop="status" label="状态" width="100">
                        <template scope="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
                                {{ scope.row.status === 1 ? '可用' : scope.row.status === -1 ? '已删除' : '不可用' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="cover" label="封面" width="130" sortable>
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
                    <el-table-column prop="update_time" label="更新时间" width="200">
                    </el-table-column>
                    <el-table-column prop="create_time" label="创建时间" width="200">
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
                <el-form-item label="楼盘名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <!--<el-form-item label="项目名称" prop="pid">-->
                    <!--<el-select v-model.number="editForm.pid" placeholder="选择项目名称">-->
                        <!--<el-option :label="item.name"-->
                                   <!--:value="item.id"-->
                                   <!--:key="index"-->
                                   <!--v-for="(item, index) in prolist"></el-option>-->
                    <!--</el-select>-->
                <!--</el-form-item>-->
                <el-form-item label="简要描述" prop="introduction">
                    <el-input type="textarea" v-model.number="editForm.introduction" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="具体地址" prop="address">
                    <el-input v-model.number="editForm.address" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="封面" prop="cover">
                    <i-uploader v-model="editForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="经纬度">
                    <el-row type="flex" justify="space-between">
                        <el-col :span="11">
                            <el-form-item prop="latitude">
                                <el-input placeholder="请输入内容" v-model.number="editForm.latitude">
                                    <template slot="prepend">经度</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11" :offset="2">
                            <el-form-item prop="longitude">
                                <el-input placeholder="请输入内容" v-model.number="editForm.longitude">
                                    <template slot="prepend">纬度</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <i-baidu-map type="editForm" :lng="editForm.longitude" :lat="editForm.latitude" @success="locationSuccess"></i-baidu-map>
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
                <el-form-item label="楼盘名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <!--<el-form-item label="项目名称" prop="pid">-->
                    <!--<el-select v-model.number="addForm.pid" placeholder="选择项目名称">-->
                        <!--<el-option :label="item.name"-->
                                   <!--:value="item.id"-->
                                   <!--:key="index"-->
                                   <!--v-for="(item, index) in prolist"></el-option>-->
                    <!--</el-select>-->
                <!--</el-form-item>-->
                <el-form-item label="简要描述" prop="introduction">
                    <el-input type="textarea" v-model.number="addForm.introduction" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="具体地址" prop="address">
                    <el-input v-model.number="addForm.address" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="封面" prop="cover">
                    <i-uploader v-model="addForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="经纬度">
                    <el-row type="flex" justify="space-between">
                        <el-col :span="11">
                            <el-form-item prop="latitude">
                                <el-input placeholder="请输入内容" v-model.number="addForm.latitude">
                                    <template slot="prepend">经度</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11" :offset="2">
                            <el-form-item prop="longitude">
                                <el-input placeholder="请输入内容" v-model.number="addForm.longitude">
                                    <template slot="prepend">纬度</template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <i-baidu-map type="addForm" :lng="addForm.longitude" :lat="addForm.latitude" @success="locationSuccess"></i-baidu-map>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
  import util from '@/utils/js';
  import Uploader from '@/components/Uploader';
  import BaiduMap from '@/components/BaiduMap';

  const MODEL_NAME = 'House';

  export default {
    data() {
      return {
        filters: {
          value: '',
          key: 'name',
          options: [
            {value: 'name', label: '楼盘名称'}
          ],
        },
        prolist: [],
        list: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], //列表选中列
        selectRow: {
          name: '',
          pid: '',
        },

        editFormVisible: false, //编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入楼盘名称', trigger: 'blur'}
          ],
          pid: [
            {type: 'number', required: true, message: '请选择项目ID', trigger: 'blur'}
          ],
          introduction: [
            {required: true, message: '请输入简要描述', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '请输入具体地址', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传封面'}
          ],
          latitude: [
            {type: 'number', required: true, message: '请输入纬度'}
          ],
          longitude: [
            {type: 'number', required: true, message: '请输入经度'}
          ]
        },
        //编辑界面数据
        editForm: {
          id: 0,
          name: '',
          pid: 0,
          introduction: '',
          address: '',
          cover: '',
          latitude: 30.264479,
          longitude: 120.099968
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            {required: true, message: '请输入楼盘名称', trigger: 'blur'}
          ],
          pid: [
            {type: 'number', required: true, message: '请选择项目ID', trigger: 'blur'}
          ],
          introduction: [
            {required: true, message: '请输入简要描述', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '请输入具体地址', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传封面'}
          ],
          latitude: [
            {type: 'number', required: true, message: '请输入纬度'}
          ],
          longitude: [
            {type: 'number', required: true, message: '请输入经度'}
          ]
        },
        //新增界面数据
        addForm: {
          name: '',
          pid: '',
          introduction: '',
          address: '',
          cover: '',
          latitude: 30.264479,
          longitude: 120.099968
        },
      }
    },
    methods: {
      locationSuccess(data) {
        this[data.type].longitude = data.lng;
        this[data.type].latitude = data.lat;
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
          pid: this.selectRow.pid
        };
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
//        this.editForm.id = row.id;
        this.editForm = res.param;
        // 经纬度需要数值类型，需转换
        this.editForm.longitude = Number(this.editForm.longitude);
        this.editForm.latitude = Number(this.editForm.latitude);
      },
      //显示新增界面
      async handleAdd() {
        this.addFormVisible = true;
        this.addForm = {
          name: '',
          pid: '',
          introduction: '',
          address: '',
          cover: '',
          latitude: 30.264479,
          longitude: 120.099968
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
                pid: this.editForm.pid,
                introduction: this.editForm.introduction,
                address: this.editForm.address,
                cover: this.editForm.cover,
                longitude: this.editForm.longitude,
                latitude: this.editForm.latitude,
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
                name: this.addForm.name,
                pid: this.selectRow.pid,
                introduction: this.addForm.introduction,
                address: this.addForm.address,
                cover: this.addForm.cover,
                longitude: this.editForm.longitude,
                latitude: this.editForm.latitude,
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
      'i-uploader': Uploader,
      'i-baidu-map': BaiduMap
    }
  }

</script>

<style lang="scss">
</style>