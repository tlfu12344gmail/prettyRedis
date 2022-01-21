<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <q-splitter
      v-model="splitterModel"
      horizontal
      unit="px"
      :style="heightStyle"
    >

      <template v-slot:before>
        <div class="q-pa-md runs-paginator-flex-container">
          <div class="q-gutter-y-md paddingLeft1" style="max-width: 300px;">
            <q-input outlined v-model="content.key" style="max-width: 200px" disable label="key">
              <!--<template v-slot:prepend>-->
                <!--<q-icon name="img:static/key.png"/>-->
              <!--</template>-->
            </q-input>

          </div>
          <div class="paddingLeft1">
            <q-input outlined v-model="content.type" disable label="type" style="width: 60px">
            </q-input>
          </div>
          <div class="paddingLeft1">
            <q-input outlined v-model="ttl" disable label="ttl" style="width: 80px">
            </q-input>
          </div>
          <div style="margin-left:auto;">
            <q-btn color="red" label="delete" size="21px" no-caps class="paddingLeft1" @click.stop="deleteKeyConfirm"/>
            <q-btn color="green" label="refresh" size="21px" no-caps class="paddingLeft1"  @click.stop="refreshKey"/>
          </div>
          <q-dialog v-model="confirmObj.confirm" persistent>
            <q-card style="width: 500px">
              <q-card-section class="row items-center">
                <span class="q-ml-sm" v-html="confirmObj.message"></span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn label="取消" color="primary" v-close-popup/>
                <q-btn label="确认" color="primary" @click.stop="deleteKey"/>
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-dialog v-model="setConfirmObj.confirm" persistent>
            <q-card style="width: 500px">
              <q-card-section class="row items-center">
                <span class="q-ml-sm" v-html="setConfirmObj.message"></span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn label="取消" color="primary" v-close-popup/>
                <q-btn label="确认" color="primary" @click.stop="deleteMember"/>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </template>

      <template v-slot:after>
        <template>
          <div class="q-pa-md" style="margin-top: 2px;margin-bottom: 2px;">
            <div class="q-gutter-md" style="width: 100%">
              <q-input clearable v-model="searchText"
                       filled
                       placeholder="value|value*|*value*" @keydown="enterSearch">
                <template v-slot:append>
                  <q-icon name="search" @click.stop="search()"/>
                  <q-icon name="add" @click.stop="addMember()"/>
                </template>
              </q-input>
            </div>
          </div>

        </template>
        <template>
          <div class="q-pa-md">
            <q-table
              style="height: 620px"
              title=""
              :data="data"
              :columns="columns"
              row-key="index"
              virtual-scroll
              :pagination.sync="pagination"
              :rows-per-page-options="[0]"
            >
              <template v-slot:body="props">
                <q-tr :props="props" align="left">
                  <q-td key="index" :props="props" >
                    {{ props.row.index }}
                  </q-td>
                  <q-td key="name" :props="props">
                    {{ props.row.name }}
                  </q-td>
                  <q-td key="operation" :props="props">
                    <q-icon name="delete" @click.stop="deleteMemberConfirm(props.row)" color="red" style="cursor: pointer"></q-icon>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </template>
        <template>
          <div class="q-pa-md q-gutter-sm">
            <q-dialog v-model="saddMember" transition-show="rotate" transition-hide="rotate">
              <q-card style="width: 600px" class="q-px-sm q-pb-md">
                <q-card-section>
                  <div class="text-h6">sadd</div>
                </q-card-section>
                <q-form>

                  <q-input
                    filled
                    v-model="members"
                    label="members"
                    lazy-rules
                    placeholder="多member用,逗号分割"
                    :rules="[ val => val && val.length > 0 || 'member不能为空']"
                  />

                </q-form>
                <q-card-actions align="right">
                  <q-btn label="取消" color="primary" v-close-popup/>
                  <q-btn label="保存" color="primary" @click.stop="saveMembers"/>
                </q-card-actions>

              </q-card>
            </q-dialog>
          </div>
        </template>
      </template>
    </q-splitter>
  </div>
</template>

<script>
  import $ from "../js/jquery.min.js";
  const redisCommand = require('../js/redis-command.js');
  const command = redisCommand.RedisCommand();
  // we generate lots of rows here
  export default {
    name: "ListShow",

    data() {
      return {
        saddMember:false,
        members:"",
        searchText:"",
        splitterModel: 60,
        heightStyle: "height: 600px",
        ttl: -2,
        value: "",
        content: "",
        confirmObj: {confirm: false, message: '', key: null},
        setConfirmObj: {confirm: false, message: '', row: null},
        data:[],

        pagination: {
          rowsPerPage: 5
        },

        columns: [
          {
            name: 'index',
            label: 'index',
            field: 'index',
            align: 'left',
          },
          {
            name: 'name',
            required: true,
            label: 'value',
            align: 'center',
            field: row => row.name
           // format: val => `${val}`,
           // sortable: true,
           // sort:(a, b) => a.localeCompare(b)
          },

          {
            name: 'operation',
            label: 'operation',
            field: 'operation',
            align: 'center',
          }
        ]
      }
    },
    mounted() {
      const _self = this;
      window['listValueData'] = (content) => {
        console.log(content)
        _self.content=content
        let arg = [];
        arg.push(content.key);
        arg.push(0);
        arg.push(-1);
        command.parseCmd(content.profile+":"+content.db, 'lrange', arg).then(function (data) {
          if (data.res) {
            _self.data = [];
            let members =data.res;
            for(let i=0;i<members.length;i++){
              const row = {};
              row.index = i+1;
              row.name = members[i];
              row.sIndex = i;
              _self.data.push(row);
            }

          }
        });
        arg = [];
        arg.push(content.key);
        command.parseCmd(content.profile+":"+content.db, 'ttl', arg).then(function (data) {
          if (data.res) {
            _self.ttl=data.res
          }
        })
      };
      const h = $('body').height()-5;
      _self.heightStyle = "height: " + h + "px"
    },
    methods:{
      saveMembers:function (){
        let memArr = this.members.split(",");
        const _self = this;
        let arg = [];
        arg.push(_self.content.key);
        arg = arg.concat(memArr);
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'sadd', arg).then(function (data) {
          if(data.res>0){
            _self.saddMember= false;
            // for(let i=0;i<memArr.length;i++){
            //   let row = {};
            //   row.name = memArr[i];
            //   row.index = _self.data[_self.data.length-1].index+i+1;
            //   _self.data.push(row);
            // }
            // let newarr = _self.data.filter((item)=>{
            //   return new Set(memArr).has(item.name)==true?false:true;
            // });
            // if(_self.data.length!=newarr.length){
            //   _self.data=newarr;
            // }
            //_self.data = _self.data.concat(memArr);
            let set = new Set();
            for(let i=0;i<_self.data.length;i++){
              set.add(_self.data[i].name);
            }
            for(let i=0;i<memArr.length;i++){
              set.add(memArr[i]);
            }
            let setArr = Array.from(set);
            _self.data=[];
            for(let j=0;j<setArr.length;j++){
              let row = {};
              row.index=j+1;
              row.name = setArr[j];
              _self.data.push(row);
            }
            updateAlert(true,"<font color='green'>sadd成功</font>");

          }else if(data.res==0){
            updateAlert(true,"<font color='green'>sadd成功</font>");
          }
        })
      },
      addMember:function (){
        this.saddMember= false;
        this.saddMember = true;
      },
      deleteMember:function (){
        const _self = this;
        let arg = [];
        arg.push(_self.content.key);
        arg.push(this.setConfirmObj.row.name);
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'srem', arg).then(function (data) {
          if(data.res==1){
            _self.setConfirmObj.confirm = false;
            for(let i=0;i<_self.data.length;i++){
              if(_self.data[i].name==_self.setConfirmObj.row.name){
                _self.data.splice(i, 1);
                updateAlert(true,"<font color='green'>删除成功</font>");
              }
            }


          }
        })
      },
      deleteMemberConfirm:function (row){
        this.setConfirmObj.confirm = true;
        this.setConfirmObj.message = "<font color='red'>确认删除member:" + row.name + "?</font>";
        this.setConfirmObj.row = row;
      },
      enterSearch: function (e) {
        if (e.keyCode == 13) {
          this.search();
        }
      },
      search:function (){
        let _self = this;
        let arg = [];
        arg.push(_self.content.key);
        arg.push(0);
        arg.push("match");
        arg.push(this.searchText);
        arg.push("count");
        arg.push(command.defaultKeysSize);
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'sscan', arg).then(function (data) {
          if (data.res) {
            _self.data = [];
            let members = [];
            if(data.res[1].length<10000){
              members= data.res[1].sort();
            }

            for(let i=0;i<members.length;i++){
              const row = {};
              row.index = i+1;
              row.name = members[i];
              _self.data.push(row);
            }

          }
        });
      },
      deleteKeyConfirm(key){
        this.confirmObj.confirm = true;
        this.confirmObj.message = "<font color='red'>确认删除key:" + this.content.key + "?</font>";
        this.confirmObj.key = key;
      },
      deleteKey(){
        const _self = this;
        let arg = [];
        arg.push(_self.content.key);
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'del', arg).then(function (data) {
          if(data.res==1){
            _self.confirmObj.confirm = false;
            updateAlert(true,"<font color='green'>删除成功</font>");
          }
        })
      },
      refreshKey(){
        const _self = this;
        let arg = [];
        arg.push(_self.content.key);
        arg.push(0);
        arg.push(-1);
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'lrange', arg).then(function (data) {
          if (data.res) {
            _self.data = [];
            let members = data.res[1]
            for(let i=0;i<members.length;i++){
              const row = {};
              row.index = i+1;
              row.name = members[i];
              row.sIndex = i;
              _self.data.push(row);
            }

          }
        });
        arg = [];
        arg.push(_self.content.key);
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'ttl', arg).then(function (data) {
          if (data.res) {
            _self.ttl=data.res
            updateAlert(true,"<font color='green'>刷新成功</font>");
          }
        })
      },

    }
  }
</script>

<style scoped>
  .runs-paginator-flex-container {
    flex: 1 1 auto;
    flex-direction: inherit;
    display: flex;
  }
.paddingLeft1{
  margin-left: 5px;
}
</style>
