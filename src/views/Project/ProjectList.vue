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
            <el-table-column prop="name" label="项目名称" min-width="120">
            </el-table-column>
            <el-table-column prop="pinyin" label="拼音首字母" width="130" sortable>
            </el-table-column>
            <el-table-column prop="cover" label="封面图片" width="130">
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

            <el-table-column prop="sell_status" label="销售状态" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.sell_status === 1 ? 'success' : 'danger'">
                        {{ scope.row.sell_status === 1 ? '在售' : '售罄' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180">
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
                <template scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === -1 ? 'gray' : 'danger'">
                        {{ scope.row.status === 1 ? '可用' : scope.row.status === -1 ? '已删除' : '不可用' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
                <template scope="scope">
                    <el-button size="small" @click="statusSubmit(scope.$index, scope.row)"
                               :disabled="scope.row.status === -1">
                        {{ scope.row.status === 1 ? '停用' : scope.row.status === 0 ? '启用' : '已删除' }}
                    </el-button>
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                    <el-button class="clipboard"
                               :data-clipboard-text="`http://wx.zjnwy.com.cn/wx?project_id=${scope.row.id}`" type="info"
                               size="small">复制链接
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchAction('remove')" :disabled="this.sels.length===0">批量删除
            </el-button>
            <el-button type="warning" @click="batchAction('disable')" :disabled="this.sels.length===0">禁用
            </el-button>
            <el-button type="primary" @click="batchAction('active')" :disabled="this.sels.length===0">启用
            </el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pagesize"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false" :before-close="destroyEditEditor">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">
                <el-form-item label="项目名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off" ></el-input>
                </el-form-item>
                <!--<el-form-item label="拼音首字母" prop="pinyin">-->
                    <!--<el-input v-model="editForm.pinyin" auto-complete="off"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="省市区">
                    <el-row type="flex" justify="space-between">
                        <el-col :span="7">
                            <el-form-item prop="province_id">
                                <el-select v-model.number="province_id" placeholder="选择省市"
                                           @change="handleProvinceChange">
                                    <el-option :label="item.province"
                                               :value="item.id"
                                               :key="index"
                                               v-for="(item, index) in location.province"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item prop="city_id">
                                <el-select v-model.number="city_id" placeholder="选择城市" @change="handleCityChange">
                                    <el-option :label="item.city"
                                               :value="item.id"
                                               :key="index"
                                               v-for="(item, index) in location.city"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item prop="zone_id">
                                <el-select v-model.number="zone_id" placeholder="选择区县">
                                    <el-option :label="item.zone"
                                               :value="item.id"
                                               :key="index"
                                               v-for="(item, index) in location.zone"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
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
                    <i-baidu-map type="editForm" :lng="editForm.longitude" :lat="editForm.latitude"
                                 @success="locationSuccess"></i-baidu-map>
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="editForm.address" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="封面图片" prop="cover">
                    <i-uploader v-model="editForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="销售热线" prop="sell_phone">
                    <el-input v-model="editForm.sell_phone" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="销售状态" prop="sell_status">
                    <el-select v-model.number="editForm.sell_status" placeholder="选择销售状态">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in sellStatus"></el-option>
                    </el-select>
                </el-form-item>
                <!--<el-form-item label="业主验证码" prop="master_id">-->
                    <!--<el-input v-model="editForm.master_id" auto-complete="off"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="简要描述" prop="content">
                    <UE :defaultMsg=editForm.introduction :config=ueditor.config ref="ueEdit"></UE>
                </el-form-item>
                <el-form-item label="车位编码" prop="park_code">
                    <el-input v-model="editForm.park_code" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="车位数量" prop="car_num">
                    <el-input v-model="editForm.car_num" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="handleEditCancel">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false" :before-close="destroyAddEditor">
            <el-form :model="addForm" label-width="100px" :rules="addFormRules" ref="addForm">
                <el-form-item label="项目名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <!--<el-form-item label="拼音首字母" prop="pinyin">-->
                    <!--<el-input v-model="addForm.pinyin" auto-complete="off"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="省市区">
                    <el-row type="flex" justify="space-between">
                        <el-col :span="7">
                            <el-form-item prop="province_id">
                                <el-select v-model="province_id" placeholder="选择省市" @change="handleProvinceChange">
                                    <el-option :label="item.province"
                                               :value="item.id"
                                               :key="index"
                                               v-for="(item, index) in location.province"></el-option>

                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item prop="city_id">
                                <el-select v-model="city_id" placeholder="选择城市" @change="handleCityChange">
                                    <el-option :label="item.city"
                                               :value="item.id"
                                               :key="index"
                                               v-for="(item, index) in location.city"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="7">
                            <el-form-item prop="zone_id">
                                <el-select v-model="zone_id" placeholder="选择区县">
                                    <el-option :label="item.zone"
                                               :value="item.id"
                                               :key="index"
                                               v-for="(item, index) in location.zone"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
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
                    <i-baidu-map type="editForm" :lng="editForm.longitude" :lat="editForm.latitude"
                                 @success="locationSuccess"></i-baidu-map>
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="addForm.address" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="封面图片" prop="cover">
                    <i-uploader v-model="addForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="销售热线" prop="sell_phone">
                    <el-input v-model="addForm.sell_phone" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="销售状态" prop="sell_status">
                    <el-select v-model.number="editForm.sell_status" placeholder="选择销售状态">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in sellStatus"></el-option>
                    </el-select>
                </el-form-item>
                <!--<el-form-item label="业主验证码" prop="master_id">-->
                    <!--<el-input v-model.number="addForm.master_id" auto-complete="off"></el-input>-->
                <!--</el-form-item>-->
                <el-form-item label="简要描述" prop="content">
                    <UE :defaultMsg=addForm.introduction :config=ueditor.config ref="ueAdd"></UE>
                </el-form-item>
                <el-form-item label="车位编码" prop="park_code">
                    <el-input v-model="addForm.park_code" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="车位数量" prop="car_num">
                    <el-input v-model.number="addForm.car_num" auto-complete="off"></el-input>
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
  import util from '@/utils/js'
  import UE from '@/components/UEditor';
  import Uploader from '@/components/Uploader';
  import BaiduMap from '@/components/BaiduMap';

  import Clipboard from 'clipboard';

  const MODEL_NAME = 'Project';

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
            {value: 'name', label: '项目名称'}
          ]
        },
        list: [],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [],//列表选中列
        sellStatus: [
          {
            id: 1,
            name: '在售'
          },
          {
            id: 0,
            name: '售罄'
          }
        ],
        location: {
          province: [],
          city: [],
          zone: []
        },
        // 省市区联动
        province_id: '',
        city_id: '',
        zone_id: '',
        editLoad: false,

        editFormVisible: false,//编辑界面是否显示
        editLoading: false,
        editFormRules: {
          name: [
            {required: true, message: '请输入项目名称', trigger: 'blur'}
          ],
//          master_id: [
//            {type: 'number', required: true, message: '请输入业主验证码', trigger: 'blur'}
//          ],
          sell_status: [
            {type: 'number', required: true, message: '请选择销售状态', trigger: 'blur'}
          ],
          latitude: [
            {type: 'number', required: true, message: '请输入纬度'}
          ],
          longitude: [
            {type: 'number', required: true, message: '请输入经度'}
          ],
          sell_phone: [
            {required: true, message: '请输入销售热线', trigger: 'blur'}
          ],
//          pinyin: [
//            {required: true, message: '请输入拼音首字母', trigger: 'blur'}
//          ],
          address: [
            {required: true, message: '请输入地址', trigger: 'blur'}
          ],
          park_code: [
            {required: true, message: '请输入项目的车位编码', trigger: 'blur'}
          ],
          car_num: [
            {type: 'number', required: true, message: '请输入车位数量', trigger: 'blur'}
          ],
          introduction: [
            {validator: validateEditContent, trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传封面图片'}
          ]
        },
        //编辑界面数据
        editForm: {
          id: 0,
          name: '',
          province_id: '',
          city_id: '',
          clicks: 0,
          zone_id: '',
//          master_id: '',
          sell_status: 0,
          latitude: 30.264479,
          longitude: 120.099968,
          sell_phone: '',
//          pinyin: '',
          introduction: '',
          address: '',
          cover: '',
          park_code: '',
          car_num: ''
        },

        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          name: [
            {required: true, message: '请输入项目名称', trigger: 'blur'}
          ],
//          master_id: [
//            {type: 'number', required: true, message: '请输入业主验证码', trigger: 'blur'}
//          ],
          sell_status: [
            {type: 'number', required: true, message: '请选择销售状态', trigger: 'blur'}
          ],
          latitude: [
            {type: 'number', required: true, message: '请输入纬度'}
          ],
          longitude: [
            {type: 'number', required: true, message: '请输入经度'}
          ],
          sell_phone: [
            {required: true, message: '请输入销售热线', trigger: 'blur'}
          ],
//          pinyin: [
//            {required: true, message: '请输入拼音首字母', trigger: 'blur'}
//          ],
          address: [
            {required: true, message: '请输入地址', trigger: 'blur'}
          ],
          park_code: [
            {required: true, message: '请输入项目的车位编码', trigger: 'blur'}
          ],
          car_num: [
            {type: 'number', required: true, message: '请输入车位数量', trigger: 'blur'}
          ],
          introduction: [
            {validator: validateAddContent, trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请上传封面图片'}
          ],
        },
        //新增界面数据
        addForm: {
          name: '',
//          master_id: '',
          sell_status: 0,
          latitude: 30.264479,
          longitude: 120.099968,
          sell_phone: '',
//          pinyin: '',
          introduction: '',
          address: '',
          cover: '',
          park_code: '',
          car_num: ''
        }
      }
    },
    methods: {
      locationSuccess(data) {
        this[data.type].longitude = data.lng;
        this[data.type].latitude = data.lat;
      },
      // 自动转成拼音首字母
      handleChinese(value) {
        this.addForm.pinyin = util.getChinesePy(value)[0];
      },
      // 格式化更新时间
      formateDate(row, column) {
        return ` ${util.formatDate.format(new Date(row.update_time * 1000), 'yyyy-MM-dd hh:mm:ss')}`
      },
      handleCurrentChange(val) {
        this.page = val;
        this.getListData();
      },
      /**
       * 获取省份列表
       * */
      async getProvince() {
        const res = await this.$http.post('sysinfoProvince', {});
        if (res === null) return;
        this.location.province = res.param;
        if (!this.editLoad) {
          this.province_id = 11; // 默认杭州
          this.getCity(11);
        }
      },
      /**
       * 获取城市列表
       * @param c_id 用于编辑页面传入city_id
       * @param callback 用于编辑页面异步加载区县列表
       * */
      async getCity(id, c_id = 0, callback = false) {
        const res = await this.$http.post('sysinfoCity', {province_id: id});
        if (res === null) return;
        this.location.city = res.param;
        if (!this.editLoad) {
          this.city_id = this.location.city[0].id;
          this.getZone(this.city_id);
        }
        if (callback) {
          this.getZone(c_id);
        }
      },
      /**
       * 获取区县列表
       * @param editLoad 用于编辑页面初次加载
       * */
      async getZone(id, editLoad = false) {
        const res = await this.$http.post('sysinfoZone', {city_id: id});
        if (res === null) return;
        this.location.zone = res.param;
        if (!this.editLoad) {
          this.zone_id = this.location.zone[0].id;
        }
//        if(editLoad && this.editLoad){
//          this.editLoad = false;
//        }
      },
      // 省市级联动
      handleProvinceChange(p_id) {
        this.location.city = [];
        this.location.zone = [];
        this.getCity(p_id);
        if (this.editLoad) {
          this.city_id = this.editForm.city_id;
          this.zone_id = this.editForm.zone_id;
        }
      },
      handleCityChange(c_id) {
        this.location.zone = [];
        if (this.city_id !== '') {
          this.getZone(c_id);
        }
        if (this.editLoad) {
          this.zone_id = this.editForm.zone_id;
        } else {

        }

      },
      //获列表
      async getListData() {
        this.listLoading = true;
        let params = {
          page: this.page,
          key: this.filters.key, // 可选参数查询
          value: this.filters.value // 可选参数查询
        };

        const res = await this.$http.post(`${MODEL_NAME}/list`, params);
        this.listLoading = false;
        if (res === null) return;
        this.total = res.param.pages.total;
        this.pagesize = res.param.pages.pagesize;
        this.list = res.param.list;
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
            message: '删除成功',
            type: 'success'
          });
          this.getListData();
        }).catch(() => {

        });
      },
      handleAddCancel() {
        this.addFormVisible = false;
        this.destroyAddEditor();
      },
      handleEditCancel() {
        this.editFormVisible = false;
        this.destroyEditEditor();
      },
      //显示编辑界面
      async handleEdit(index, row) {
        this.editFormVisible = true;
        let params = {
          id: row.id
        };
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
        this.editForm = Object.assign({}, res.param);
        // 经纬度需要数值类型，需转换
        this.editForm.longitude = Number(this.editForm.longitude);
        this.editForm.latitude = Number(this.editForm.latitude);
        this.province_id = this.editForm.province_id;
        this.city_id = this.editForm.city_id;
        this.zone_id = this.editForm.zone_id;
        this.editLoad = true;
        this.getCity(this.editForm.province_id, this.editForm.city_id, true);
      },
      //显示新增界面
      handleAdd() {
        this.addFormVisible = true;
        this.addForm = {
          name: '',
          master_id: '',
          sell_status: 0,
          latitude: 30.264479,
          longitude: 120.099968,
          sell_phone: '',
          pinyin: '',
          introduction: '',
          address: '',
          cover: '',
          park_code: '',
          car_num: ''
        };
        // 初始化省市区信息
//        this.province_id = '';
//        this.city_id = '';
//        this.zone_id = '';
        this.getProvince();
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
                province_id: this.province_id,
                city_id: this.city_id,
                zone_id: this.zone_id,
//                master_id: this.editForm.master_id,
                sell_phone: this.editForm.sell_phone,
                sell_status: this.editForm.sell_status,
                latitude: this.editForm.latitude,
                longitude: this.editForm.longitude,
//                pinyin: this.editForm.pinyin,
                address: this.editForm.address,
                cover: this.editForm.cover,
                park_code: this.editForm.park_code,
                car_num: this.editForm.car_num,
                introduction: this.getUEContent('ueEdit'), // 富文本内容
              };
              const res = await this.$http.post(`${MODEL_NAME}/update`, params);
              this.editLoading = false;
              if (res === null) return;
              //NProgress.done();
              this.$message({
                message: '修改成功',
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

              let params = Object.assign({}, this.addForm);
              params.province_id = this.province_id;
              params.city_id = this.city_id;
              params.zone_id = this.zone_id;
              params.introduction = this.getUEContent('ueAdd');
              const res = await this.$http.post(`${MODEL_NAME}/add`, params);
              this.addLoading = false;
              if (res === null) return;
              this.$message({
                message: '新建成功',
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
      // 修改状态
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
      selsChange(sels) {
        this.sels = sels;
      },
      //批量删除
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
      }
    },
    mounted() {
      this.getListData();
      this.getProvince();

      console.log(util.getChinesePy("中节能•西溪首座"));

//      console.log(clipboard);
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
    },
    components: {
      UE,
      'i-uploader': Uploader,
      'i-baidu-map': BaiduMap
    },
  }

</script>

<style lang="scss">
</style>