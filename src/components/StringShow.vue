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
            <q-btn color="primary" label="update" size="21px" no-caps class="paddingLeft1" @click.stop="updateKey"/>
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
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-md">
          <q-input type="textarea" v-model="value" borderless >
          </q-input>
        </div>
      </template>

    </q-splitter>
  </div>
</template>

<script>
  import $ from "../js/jquery.min.js";
  const redisCommand = require('../js/redis-command.js');
  const command = redisCommand.RedisCommand();
  export default {
    name: "StringShow",

    data() {
      return {splitterModel: 60, heightStyle: "height: 600px",ttl:-2,value:"",content:"", confirmObj: {confirm: false, message: '', key: null},}
    },
    mounted() {
      const _self = this;
      window['stingValueData'] = (content) => {
        _self.content=content
        let arg = [];
        arg.push(content.key);
        command.parseCmd(content.profile+":"+content.db, 'get', arg).then(function (data) {
          if (data.res) {
            _self.value=data.res
          }
        });
        command.parseCmd(content.profile+":"+content.db, 'ttl', arg).then(function (data) {
          if (data.res) {
            _self.ttl=data.res
          }
        })
      };
      const h = $('body').height() - 5;
      _self.heightStyle = "height: " + h + "px"
    },
    methods:{
      updateKey(){
        const _self = this;
        let arg = [];
        arg.push(_self.content.key);
        arg.push(this.value);
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'set', arg).then(function (data) {
           if(data.res=="OK"){
             updateAlert(true,"<font color='green'>修改成功</font>");
           }
        })
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
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'get', arg).then(function (data) {
          if (data.res) {
            _self.value=data.res
          }
        });
        command.parseCmd(_self.content.profile+":"+_self.content.db, 'ttl', arg).then(function (data) {
          if (data.res) {
            _self.ttl=data.res
            updateAlert(true,"<font color='green'>刷新成功</font>");
          }
        })
      }
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
