<template>
    <section>
        <!--搜索-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.value" placeholder="关键词"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-select v-model="filters.key" placeholder="请选择搜索字段">
                        <el-option
                                v-for="(item, index) in filters.options"
                                :key="index"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="search" @click="getListData">搜索</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="list" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column prop="name" label="广告位名称" min-width="130">
            </el-table-column>
            <el-table-column prop="width" label="广告位宽度" min-width="130">
            </el-table-column>
            <el-table-column prop="height" label="广告位高度" min-width="130">
            </el-table-column>
            <el-table-column prop="max" label="最高上线数" min-width="130">
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
            <el-table-column label="操作" width="100" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>


        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="140px" :rules="editFormRules" ref="editForm">
                <el-form-item label="广告位名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="广告位宽度" prop="width">
                    <el-input v-model.number="editForm.width" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="广告位高度" prop="height">
                    <el-input v-model.number="editForm.height" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="最多上线数" prop="max">
                    <el-input v-model.number="editForm.max" auto-complete="off"></el-input>
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
  const MODEL_NAME = 'Place';

  export default {
    data() {
      return {
        filters: {
          value: '',
          key: 'name',
          options: [
            {value: 'name', label: '广告位名称'}
          ]
        },
        list: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], //列表选中列

        editFormVisible: false, //编辑界面是否显示
        editLoading: false,
        editFormRules: {
          width: [
            {type:'number',required: true, message: '请输入广告位宽度', trigger: 'blur'}
          ],
          height: [
            {type:'number',required: true, message: '请输入广告位高度', trigger: 'blur'}
          ],
          max: [
            {type:'number',required: true, message: '请输入最多上线数', trigger: 'blur'}
          ],

        },
        //编辑界面数据
        editForm: {
          id: 0,
          name: '',
          width: 0,
          height: 0,
          max: 1,
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
          value: this.filters.value,
          key: this.filters.key,
        };
        this.listLoading = true;
        const res = await this.$http.post(`${MODEL_NAME}/list`, params);
        this.listLoading = false;
        if (res === null) return;
        this.total = res.param.pages.total;
        this.pagesize = res.param.pages.pagesize;
        this.list = res.param.list;
      },
      //显示编辑界面
      async handleEdit(index, row) {
        this.editFormVisible = true;
        let params = {id: row.id};
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
//        this.id = row.id,
//        this.name = row.name,
        this.editForm = res.param;
      },
      //编辑
      editSubmit() {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.editLoading = true;
              let params = {
                id: this.editForm.id,
                width: this.editForm.width,
                height: this.editForm.height,
                max: this.editForm.max,
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
      selsChange(sels) {
        this.sels = sels;
      },
    },
    mounted() {
      this.getListData();
    }
  }
</script>

<style lang="scss">

</style>