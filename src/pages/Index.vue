<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <q-splitter
      v-model="splitterModel"
      :limits="[25,50]"
      unit="%"
      :style="indexStyle"
    >

      <template v-slot:before>

        <q-splitter
          v-model="subModel"
          horizontal
          unit="px"
          :separator-style="{ backgroundColor: 'white' }"
        >

          <template v-slot:before>
            <ConnectionList></ConnectionList>
          </template>

          <template v-slot:after>
            <Tree></Tree>
          </template>

        </q-splitter>

      </template>

      <template v-slot:after>
        <div class="q-pa-md" v-if="uiModel=='JSON'">
          <div id="vContent">
            <q-card-actions align="center">
              <q-icon style="width: 400px;height: 300px;background-color: white" name="img:static/pr/pr-0.png"></q-icon>
            </q-card-actions>
            <!-- <q-card-actions align="center">
              <div style="padding-right: 20px"><span>版本:</span><span>1.0.0</span></div>
              <div :style="licenseStyle"><span>license:</span><span>{{licenseInfo}}</span></div>
              <q-btn v-if="licenseStyle =='color:red'" no-caps flat label="点击获取license" color="primary"
                     @click.stop="showDD"/>
            </q-card-actions> -->

            <q-card-actions align="center">
              <div style="padding-right: 20px"><span>官网地址:</span><span style="color: blue;cursor: pointer"
                                                                       @click.stop="openUrl(0)"> www.fullmile.tech</span>
              </div>
            </q-card-actions>
            <q-card-actions align="center">
              <div><span>github地址:</span><span style="color: blue;cursor: pointer" @click.stop="openUrl(1)">https://github.com/tlfu12344gmail/prettyRedis</span>
              </div>
            </q-card-actions>
            <q-card-actions align="center">
              <div><span>gitee地址:</span><span style="color: blue;cursor: pointer" @click.stop="openUrl(2)">https://gitee.com/tlfu12344gamil/prettyRedis</span>
              </div>
            </q-card-actions>
          </div>
        </div>
        <div class="q-pa-md" v-else-if="keyType=='string'">
          <StringShow></StringShow>
        </div>
        <div class="q-pa-md" v-else-if="keyType=='set'">
          <SetShow></SetShow>
        </div>
        <div class="q-pa-md" v-else-if="keyType=='list'">
          <ListShow></ListShow>
        </div>
        <div class="q-pa-md" style="color: red" v-else>
          {{defaultValue}}
        </div>
      </template>

    </q-splitter>
    <template>
      <q-dialog v-model="persistent" persistent transition-show="scale" transition-hide="scale">
        <q-card style="width: 500px">
          <q-card-section>
            <div class="text-h6">请输入license</div>
          </q-card-section>
          <q-input
            filled
            v-model="newLicense"
            label="license"
            lazy-rules
            placeholder="无license?扫码获取license"
            :rules="[ val => val && val.length > 0 || 'license不能为空']"></q-input>
          <q-card-actions align="center">
            <q-icon align="center" name="img:https://fullmile-public.oss-cn-beijing.aliyuncs.com/pr/kfk.jpeg"
                    style="height: 260px;width: 260px"></q-icon>
          </q-card-actions>
          <q-card-actions align="center">
            <div style="color: red">同一个license最多支持两台电脑，否则会自动失效，请不要给别人使用，否则后果自负.</div>
          </q-card-actions>
          <q-card-actions align="right">
            <q-btn no-caps label="验证license" color="primary" @click.stop="licenseCheck"/>
          </q-card-actions>

        </q-card>
      </q-dialog>
      <q-dialog v-model="alert">
        <q-card style="width: 500px">
          <q-card-section>
            <div class="text-h6">提示信息</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-html="alertContent">

          </q-card-section>

          <q-card-actions align="right">
            <q-btn label="知道了" color="primary" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </template>
    <template>
      <div class="q-pa-md q-gutter-sm">

        <q-dialog v-model="versionDialog" position="right">
          <q-card style="width: 350px">

            <q-card-section class="row items-center no-wrap">
              <div>
                <div class="text-weight-bold">版本更新提醒</div>
                <div class="text-grey">当前版本为:{{currentVersion}},最新版本为:{{latestVersion}},请到官网下载最新版使用。</div>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </template>

  </div>
</template>
<script>
  // window.onload=function () {
  //   $(".q-splitter").height($("body").height());
  //   console.log($("body").height()-$(".text-teal").height()-20)
  //   $(".q-virtual-scroll").height($("body").height()-$(".text-teal").height()-20);
  // }
  window.$ = window.jQuery = require("../js/jquery.min.js");
  const getmac = require('getmac');
  import ConnectionList from 'components/ConnectionList.vue'
  import Tree from 'components/Tree.vue'
  import StringShow from "components/StringShow";
  import SetShow from "components/SetShow";
  import ListShow from "components/ListShow";

  require("../js/terminal-find.js");
  require("../js/jquery.json-viewer.js");
  const crypto = require('../js/crypto.js');
  const shell = require('electron').shell;
  let indexStyle = "height:800px";
  let store = require('../js/store.js').Store();
  const exec = require('child_process').exec;
  const uiConfig = store.get("uiConfig")
  let splitterModel = 25;
  let uiModel = "JSON";
  if (uiConfig != null && uiConfig.appWHConfig != null) {
    indexStyle = "height:" + uiConfig.appWHConfig.appH + "px";
  }
  if (uiConfig != null && uiConfig.splitterModel != null) {
    splitterModel = uiConfig.splitterModel;
  }
  if (uiConfig != null && uiConfig.uiModel != null) {
    uiModel = uiConfig.uiModel;
  }
  let persistent = false;
  let licenseInfo = "";
  let licenseStyle = "";

  // //verifyLicense();
  // let serverUrl = "http://localhost:9000/pr";
  // if (process.env.PROD) {
  //   serverUrl = "https://www.fullmile.tech/pr"
  // }
  // puts()
  // function puts() {
  //     //远程请求license
  //     try {
  //       let localLicense = store.get("license");
  //       const mac = getmac.default();
  //       if (mac != null && mac != "") {

  //         $.ajax({
  //           type: "POST", url: serverUrl + "/mac-license",
  //           contentType: "application/json", dataType: "json",
  //           data: JSON.stringify({
  //             mac: mac,
  //             license: localLicense,
  //             platform: process.platform
  //           }), success: function (result) {
  //             if (result.success) {
  //               if (localLicense != result.data.license) {
  //                 store.set("license", result.data.license);
  //               }
  //             }

  //           }
  //         });
  //       }

  //     } catch (e) {
  //       console.log(e)
  //     }
  // }


  export default {

    components: {StringShow, ConnectionList, Tree,SetShow,ListShow},
    data() {
      return {
        splitterModel: splitterModel,
        content: "",
        subModel: 120,
        indexStyle: indexStyle,
        uiModel: uiModel,
        keyType: "",
        persistent: persistent,
        newLicense: "",
        licenseInfo: licenseInfo,
        licenseStyle: licenseStyle,
        currentVersion: "1.0.0",
        latestVersion: "",
        versionDialog: false,
        alert: false,
        alertContent: "",
        defaultValue:''
      }
    },
    watch: {
      latestVersion: function () {
        if (this.latestVersion != "") {
          this.versionDialog = true;
        }
      }

    },
    methods: {
      verifyLicense: function () {
        const license = store.get("license");
        if (license == null || license == "") {
          this.persistent = true;
          return;
        }
        const licenseStr = crypto.Crypto().aesDecrypt(license, "prettyRedisGo-go", "prettyRedisGo-go");
        if (licenseStr.startsWith("test")) {
          this.licenseStyle = "color:red";
          const licenseArr = licenseStr.split("_");
          const pf = licenseArr[0];
          const time = licenseArr[1];
          const isServer = licenseArr[2];
          if (parseInt(time) < (new Date().getTime())) {
            this.persistent = true;
            this.licenseInfo = "已到期"
          } else {
            this.licenseInfo = "试用版 到期日:" + new Date(parseInt(time)).toDateString()
          }

        } else if (licenseStr.startsWith("prod")) {
          this.licenseStyle = "color:green";
          const licenseArr = licenseStr.split("_");
          const pf = licenseArr[0];
          const time = licenseArr[1];
          const isServer = licenseArr[2];
          if (isServer == 2) {
            this.persistent = true;
            this.updateAlert(true, "<font color='red'>license:" + license + " 使用者过多，最多两台机器</font>");
          } else if (isServer == 3) {
            this.persistent = true;
            this.updateAlert(true, "<font color='red'>license:" + license + " 无效</font>");
          } else {
            this.licenseInfo = "正试版"
          }

        } else {
          this.persistent = true;
        }
      },
      updateAlert: function (alert, content) {
        this.alert = alert;
        this.alertContent = content
      },
      openUrl: function (type) {
        if (type == 0) {
          shell.openExternal("http://www.fullmile.tech");
        } else if (type == 1) {
          shell.openExternal("https://github.com/tlfu12344gmail/prettyRedis");
        } else if (type == 2) {
          shell.openExternal("https://gitee.com/tlfu12344gamil/prettyRedis");
        }
      },
      checkAppVersion: function () {
        let _this = this;
        $.ajax({
          //请求方式
          type: "GET",
          async: true,
          timeout: 500,
          //请求的媒体类型
          contentType: "application/json;charset=UTF-8",
          //请求地址
          url: serverUrl + "/version",
          //数据，json字符串
          //data : JSON.stringify(list),
          //请求成功
          success: function (result) {
            if (result.success) {
              if (result.data.localeCompare(_this.currentVersion) == 1) {
                _this.latestVersion = result.data;
              }
            }
          },
          //请求失败，包含具体的错误信息
          error: function (e) {
            console.log(e);
          }
        });
      },
      calSpitH: function () {
        $('.q-splitter--vertical').height($('body').height());
        $('.q-page').height($('body').height() - $(".text-teal").height() - $('.q-field__control').height() - 12);
        $('.q-page').css('min-height', '');
        $(".q-virtual-scroll").height($("body").height() - $(".text-teal").height() - $('.q-field__control').height() - 22);
      },
      licenseCheck: function () {
        if (this.newLicense == null || this.newLicense == "") {
          this.updateAlert(true, "<font color='red'>license不能为空</font>");
        } else {
          const licenseStr = crypto.Crypto().aesDecrypt(this.newLicense, "prettyRedisGo-go", "prettyRedisGo-go");
          if (licenseStr == null || licenseStr == "") {
            this.updateAlert(true, "<font color='red'>无效的license</font>");
          } else {

            const licenseArr = licenseStr.split("_");
            if (licenseArr.length == 3 && licenseArr[0] == "prod" && licenseArr[2] == 1) {
              this.licenseStyle = "color:green";
              this.licenseInfo = "正试版";
              store.set("license", this.newLicense);
              this.persistent = false;

            } else {
              this.updateAlert(true, "<font color='red'>无效的license</font>");
            }
          }
          //todo http验证 true persistent=false, false,updateAlert(true,"<font color='red'>无效的license</font>")
        }
      },
      showDD: function () {
        this.persistent = true;
      },
    },
    mounted: function () {
      $(".q-loading-bar").remove();
      let _this = this;
      _this.calSpitH();
      window.addEventListener('resize', () => _this.calSpitH(), false);
      window['contentShow'] = (content) => {
        //_this.content = content;
        if (uiModel == 'JSON') {
          $('#vContent').jsonViewer(content,
            {collapsed: false, withQuotes: true, withLinks: false});
        } else {
          if (content.type) {
            _this.keyType = content.type;
          }
          if (_this.keyType == 'string') {
            _this.$nextTick(() => {
              stingValueData(content);
            })
          }else if(_this.keyType == 'list'){
            _this.$nextTick(() => {
              listValueData(content);
            })

          }else if(_this.keyType == 'set'){
            _this.$nextTick(() => {
              setValueData(content);
            })

          }else{
            _this.defaultValue="无效的key"
          }


        }

      };
      // _this.checkAppVersion();
      // _this.verifyLicense();
    },
    beforeDestroy() {
      window.onresize = null
    }
  }
</script>
<style>
  @import "../css/termimal-find.css";
  @import "../css/jquery.json-viewer.css";

  body {
    -webkit-app-region: drag
  }

  .q-splitter__panel {
    -webkit-app-region: no-drag;
  }

  .q-pa-md {
    padding: 2px;
  }

  div::-webkit-scrollbar {
    width: 0;
  }

  body::-webkit-scrollbar {
    width: 0;
  }
</style>
