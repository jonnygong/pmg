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

                    <!--<el-table-column prop="id" label="项目ID" min-width="100"></el-table-column>-->
                    <el-table-column prop="name" label="项目名称" min-width="100"></el-table-column>
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
                            <el-select v-model="filters.hid" placeholder="按楼盘搜索">
                                <el-option
                                        v-for="(item,index) in filters.options.house"
                                        :key="index"
                                        :label="item.name"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-select v-model="filters.areaid" placeholder="按面积搜索">
                                <el-option
                                        v-for="(item,index) in filters.options.area"
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
                    <el-table-column type="selection" width="55"></el-table-column>
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
                    <el-table-column prop="cover" label="封面" width="100">
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
        <el-dialog title="新增" v-model="addFormVisible" :close-on-click-modal="false" :before-close="destroyAddEditor">
            <el-form :model="addForm" :rules="addFormRules" label-width="80px" ref="addForm">


                <h3 class="title">第一步：基础信息</h3>

                <el-form-item label="楼盘名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="楼栋名称" prop="building_name">
                    <el-input v-model="addForm.building_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="楼层名称" prop="level_name">
                    <el-input v-model="addForm.level_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="房屋名称" prop="house_name">
                    <el-input v-model="addForm.house_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="住户名称" prop="htype_name">
                    <el-input v-model="addForm.htype_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="业主名称" prop="master_name">
                    <el-input v-model="addForm.master_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="所属楼盘" prop="hid">
                    <el-select v-model.number="addForm.hid" placeholder="选择楼盘">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in category"></el-option>
                    </el-select>
                </el-form-item>
                <!--<el-form-item label="所属项目" prop="pid">-->
                    <!--<el-input v-model="selectRow.name" auto-complete="off" :disabled="true"></el-input>-->
                <!--</el-form-item>-->


                <h3 class="title">第二步：业主信息</h3>


                <el-form-item label="业主电话" prop="tel">
                    <el-input v-model="addForm.tel" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="住户电话" prop="phone">
                    <el-input v-model="addForm.phone" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="租赁状态" prop="rent_status">
                    <el-select v-model.number="addForm.rent_status" placeholder="选择租赁状态">
                        <el-option :label="item.label"
                                   :value="item.value"
                                   :key="index"
                                   v-for="(item, index) in rentOptions"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="销售状态" prop="sell_status">
                    <el-select v-model.number="addForm.sell_status" placeholder="选择销售状态">
                        <el-option :label="item.label"
                                   :value="item.value"
                                   :key="index"
                                   v-for="(item, index) in saleOptions"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="联系人" prop="contact">
                    <el-input v-model="addForm.contact" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="建筑面积" prop="area">
                    <el-input v-model.number="addForm.area" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="addForm.address" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="租赁开始时间" prop="start_time">
                    <el-date-picker
                            v-model.date="addForm.start_time"
                            align="right"
                            type="datetime"
                            placeholder="选择日期"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="租赁结束时间" prop="end_time">
                    <el-date-picker
                            v-model.date="addForm.end_time"
                            align="right"
                            type="datetime"
                            placeholder="选择日期"
                            :picker-options="pickerOptions">
                    </el-date-picker>
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
                <el-form-item label="封面图片" prop="cover">
                    <i-uploader v-model="addForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input v-model.number="addForm.price" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="notes">
                    <el-input type="textarea" v-model="addForm.notes"></el-input>
                </el-form-item>
                <!--<el-form-item label="所属项目" prop="pid">-->
                    <!--<el-input v-model="selectRow.name" auto-complete="off" :disabled="true"></el-input>-->
                <!--</el-form-item>-->


                <h3 class="title">第三步：其他信息</h3>


                <el-form-item label="配套说明" prop="">
                    <UE :defaultMsg=addForm.info :config=ueditor.config ref="ueAddInfo"></UE>
                </el-form-item>
                <el-form-item label="租赁说明" prop="">
                    <UE :defaultMsg=addForm.rent_info :config=ueditor.config ref="ueAddRent"></UE>
                </el-form-item>
                <el-form-item label="其他信息" prop="">
                    <UE :defaultMsg=addForm.other_info :config=ueditor.config ref="ueAddOther"></UE>
                </el-form-item>

            </el-form>

            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="editFormVisible" :close-on-click-modal="false" :before-close="destroyEditEditor">
            <el-form :model="editForm" label-width="100px" :rules="editFormRules" ref="editForm">


                <h3 class="title">第一步：基础信息</h3>

                <el-form-item label="楼盘名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="楼栋名称" prop="building_name">
                    <el-input v-model="editForm.building_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="楼层名称" prop="level_name">
                    <el-input v-model="editForm.level_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="房屋名称" prop="house_name">
                    <el-input v-model="editForm.house_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="住户名称" prop="htype_name">
                    <el-input v-model="editForm.htype_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="业主名称" prop="master_name">
                    <el-input v-model="editForm.master_name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="所属楼盘" prop="hid">
                    <el-select v-model.number="editForm.hid" placeholder="选择楼盘">
                        <el-option :label="item.name"
                                   :value="item.id"
                                   :key="index"
                                   v-for="(item, index) in category"></el-option>
                    </el-select>
                </el-form-item>
                <!--<el-form-item label="所属项目" prop="pid">-->
                    <!--<el-input v-model="selectRow.name" auto-complete="off" :disabled="true"></el-input>-->
                <!--</el-form-item>-->


                <h3 class="title">第二步：业主信息</h3>


                <el-form-item label="业主电话" prop="tel">
                    <el-input v-model="editForm.tel" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="住户电话" prop="phone">
                    <el-input v-model="editForm.phone" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="租赁状态" prop="rent_status">
                    <el-select v-model.number="editForm.rent_status" placeholder="选择租赁状态">
                        <el-option :label="item.label"
                                   :value="item.value"
                                   :key="index"
                                   v-for="(item, index) in rentOptions"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="销售状态" prop="sell_status">
                    <el-select v-model.number="editForm.sell_status" placeholder="选择销售状态">
                        <el-option :label="item.label"
                                   :value="item.value"
                                   :key="index"
                                   v-for="(item, index) in saleOptions"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="联系人" prop="contact">
                    <el-input v-model="editForm.contact" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="建筑面积" prop="area">
                    <el-input v-model.number="editForm.area" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="editForm.address" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="租赁开始时间" prop="start_time">
                    <el-date-picker
                            v-model.date="editForm.start_time"
                            align="right"
                            type="datetime"
                            placeholder="选择日期"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="租赁结束时间" prop="end_time">
                    <el-date-picker
                            v-model.date="editForm.end_time"
                            align="right"
                            type="datetime"
                            placeholder="选择日期"
                            :picker-options="pickerOptions">
                    </el-date-picker>
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
                <el-form-item label="封面图片" prop="cover">
                    <i-uploader v-model="editForm.cover"></i-uploader>
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input v-model.number="editForm.price" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="notes">
                    <el-input type="textarea" v-model="editForm.notes"></el-input>
                </el-form-item>
                <!--<el-form-item label="所属项目" prop="pid">-->
                    <!--<el-select v-model="editForm.pid" placeholder="选择所属项目">-->
                        <!--<el-option :label="item.name"-->
                                   <!--:value="item.id"-->
                                   <!--:key="item.id"-->
                                   <!--v-for="(item, index) in prolist"></el-option>-->
                    <!--</el-select>-->
                <!--</el-form-item>-->


                <h3 class="title">第三步：其他信息</h3>


                <el-form-item label="配套说明" prop="">
                    <UE :defaultMsg=editForm.info :config=ueditor.config ref="ueEditInfo"></UE>
                </el-form-item>
                <el-form-item label="租赁说明" prop="">
                    <UE :defaultMsg=editForm.rent_info :config=ueditor.config ref="ueEditRent"></UE>
                </el-form-item>
                <el-form-item label="其他信息" prop="">
                    <UE :defaultMsg=editForm.other_info :config=ueditor.config ref="ueEditOther"></UE>
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
  import util from '@/utils/js';
  import UE from '@/components/UEditor';
  import Uploader from '@/components/Uploader';
  import BaiduMap from '@/components/BaiduMap';

  const MODEL_NAME = 'Bussiness';


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
            prop: 'name',
            label: '招租名称',
            width: 120,
            sortable: false
          },
          {
            prop: 'area',
            label: '建筑面积',
            width: 120,
            sortable: false
          },
          {
            prop: 'htype_name',
            label: '住户名称',
            width: 120,
            sortable: false
          },
          {
            prop: 'price',
            label: '价格',
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
        ueditor: {
          config: {
            initialFrameWidth: null,
            initialFrameHeight: 350,
            zIndex: 9999
          }
        },
        filters: {
          value: '',
          hid: '',
          areaid: '',
          options: {
            house: [],
            area: [
              {value: '', label: '不限面积'},
              {value: 1, label: '小于等于500'},
              {value: 2, label: '500-1000'},
              {value: 3, label: '大于等于1000'}
            ]
          }
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
        selectRow: {
          name: '',
          pid: '',
        },

        prolist: [],
        list: [],
        category: [],
        rentOptions: [
          {label: '空置', value: 1},
          {label: '已租', value: 2},
          {label: '自用', value: 3},
          {label: '意向', value: 4}
        ],
        saleOptions: [
          {label: '未售', value: 1},
          {label: '已售', value: 2}
        ],
        total: 0,
        page: 1,
        pagesize: 0,
        listLoading: false,
        sels: [], //列表选中列

        editFormVisible: false, //编辑界面是否显示
        editLoading: false,
        editFormRules: {
          rent_status: [
            {type:'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          sell_status: [
            {type:'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          building_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          level_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          house_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          area: [
            {type:'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          htype_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          master_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请输入内容'}
          ],
          contact: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          tel: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          phone: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
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
          rent_status: '',
          building_name: '',
          level_name: '',
          house_name: '',
          area: '',
          htype_name: '',
          master_name: '',
          phone: '',
          notes: '',
          sell_status: '',
          price: '',
          start_time: '',
          hid: '',
          cover: '',
          end_time: '',
          longitude: '',
          latitude: '',
          contact: '',
          address: '',
          tel: '',
          info: '',
          rent_info: '',
          other_info: '',
          pid: 0
        },


        addFormVisible: false,//新增界面是否显示
        addLoading: false,
        addFormRules: {
          rent_status: [
            {type:'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          sell_status: [
            {type:'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          building_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          level_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          house_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          area: [
            {type:'number', required: true, message: '请输入内容', trigger: 'blur'}
          ],
          htype_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          master_name: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          cover: [
            {required: true, message: '请输入内容'}
          ],
          contact: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          address: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          tel: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          phone: [
            {required: true, message: '请输入内容', trigger: 'blur'}
          ],
          start_time: [
            {type: 'date', required: true, message: '请输入开始时间', trigger: 'blur'}
          ],
          end_time: [
            {type: 'date', required: true, message: '请输入结束时间', trigger: 'blur'}
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
          pid: 0,
          rent_status: '',
          building_name: '',
          level_name: '',
          house_name: '',
          area: '',
          htype_name: '',
          master_name: '',
          phone: '',
          notes: '',
          sell_status: '',
          price: '',
          start_time: '',
          hid: '',
          cover: '',
          end_time: '',
          longitude: 0,
          latitude: 0,
          contact: '',
          address: '',
          tel: '',
          info: '',
          rent_info: '',
          other_info: '',
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
          status: 1 - row.status,
          pid: row.pid
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
          hid: this.filters.hid,
          areaid: this.filters.areaid,
          pid: this.selectRow.pid,
          key: "name",
          value: this.filters.value
        };
        this.listLoading = true;
        const res = await this.$http.post(`${MODEL_NAME}/list`, params);
        this.listLoading = false;
        if (res === null) return;
        this.total = res.param.list.pages.total;
        this.pagesize = res.param.list.pages.pagesize;
        this.list = res.param.list.list;
        this.filters.options.house = res.param.house;
        this.filters.options.house.push({id: '', name: '不限楼盘'});
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
          rent_status: '',
          building_name: '',
          level_name: '',
          house_name: '',
          area: '',
          htype_name: '',
          master_name: '',
          phone: '',
          notes: '',
          sell_status: '',
          price: '',
          start_time: '',
          hid: '',
          cover: '',
          end_time: '',
          longitude: 0,
          latitude: 0,
          contact: '',
          address: '',
          tel: '',
          info: '',
          rent_info: '',
          other_info: '',
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
        this.category = res.param.house;
        this.editForm.start_time = new Date(this.editForm.start_time * 1000);
        this.editForm.end_time = new Date(this.editForm.end_time * 1000);
        // 经纬度需要数值类型，需转换
        this.editForm.longitude = Number(this.editForm.longitude);
        this.editForm.latitude = Number(this.editForm.latitude);
      },
      //获取父级分类
      async getCategoryData() {
        let params = {id: 0, pid: this.selectRow.pid};
        const res = await this.$http.post(`${MODEL_NAME}/info`, params);
        if (res === null) return;
        this.category = res.param.house;
      },
      //编辑
      editSubmit() {
        this.$refs.editForm.validate((valid) => {
          if (valid) {
            this.$confirm('确认提交吗？', '提示', {}).then(async () => {
              this.editLoading = true;
              let params = Object.assign({}, this.editForm);
              params.info = this.getUEContent('ueEditInfo');
              params.rent_info = this.getUEContent('ueEditRent');
              params.other_info = this.getUEContent('ueEditOther');
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
              params.info = this.getUEContent('ueAddInfo');
              params.rent_info = this.getUEContent('ueAddRent');
              params.other_info = this.getUEContent('ueAddOther');

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
      },
      // Ueditor 获取内容
      getUEContent(ele) {
        return this.$refs[ele].getUEContent();
      },
      destroyAddEditor(done) {
        this.addForm.info = this.getUEContent('ueAddInfo');
        this.addForm.rent_info = this.getUEContent('ueAddRent');
        this.addForm.other_info = this.getUEContent('ueAddOther');

        if (typeof done === 'function') {
          done();
        }
      },
      destroyEditEditor(done) {
        this.editForm.info = this.getUEContent('ueEditInfo');
        this.editForm.rent_info = this.getUEContent('ueEditRent');
        this.editForm.other_info = this.getUEContent('ueEditOther');
        if (typeof done === 'function') {
          done();
        }
      }
    },
    components: {
      UE,
      'i-uploader': Uploader,
      'i-baidu-map': BaiduMap
    },
    mounted() {
      this.getProlistData();
    }
  }
</script>

<style lang="scss" scoped>
    .title {
        padding-bottom: 19px;
        border-bottom: 1px solid #eaeefb;
    }
</style>