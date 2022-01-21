<template>
  <div class="q-pa-md" style="position:absolute;right:0;left:80px;width: 90%;padding: 20px">
    <div class="q-gutter-md">
      <q-card-section>
        <div class="text-h6">参数配置</div>
      </q-card-section>
      <q-select filled v-model="appW" :options="appWS" label="应用占屏幕宽度百分比" label-color="red"  />

      <q-select filled v-model="appH" :options="appHS" label="应用占屏幕高度度百分比" label-color="red"  />

      <q-select filled v-model="splitterModel" :options="splitterModels" label="Tree占应用宽度百分比" label-color="red"  />

      <q-select filled v-model="defautKeysSize" :options="defautKeysSizes" label="默认从每个节点加载key的数量" label-color="red"  />

      <q-select filled v-model="treeListSplit" :options="treeListSplits" label="Tree的children数量达到此值会转为虚拟列表" label-color="red"    />

      <q-select filled v-model="virtualHeight" :options="virtualHeights" label="tree中虚拟列表高度" label-color="red"    />

      <q-select filled v-model="view" :options="views" label="主视图" label-color="red"   />

      <q-select filled v-model="uiModel" :options="uiModels" label="value显示方式" label-color="red"   />

      <q-card-actions align="right">
        <q-btn label="保存" color="primary" @click.stop="saveConfig"/>
      </q-card-actions>
      <q-dialog v-model="alert">
        <q-card style="width: 500px" >
          <q-card-section>
            <div class="text-h6">提示信息</div>
          </q-card-section>

          <q-card-section class="q-pt-none" v-html="alertContent">

          </q-card-section>

          <q-card-actions align="right">
            <q-btn  label="知道了" color="primary" v-close-popup/>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>


<script>

  let store = require('../js/store.js').Store();
  const appConfig = store.get("appConfig");
  const uiConfig = store.get("uiConfig");

  const crypto = require('../js/crypto.js');
  let appW = "80%";
  let appH = "90%";
  let splitterModel = "40%";
  let defautKeysSize = "10万";
  let treeListSplit = 500;
  let virtualHeight = "150px";
  let uiModel = "JSON";
  let view="view";
  if (appConfig != null) {
    defautKeysSize = appConfig.defautKeysSize / 10000 + "万";
    treeListSplit = appConfig.treeListSplit;
  }
  if (uiConfig != null) {
    splitterModel = uiConfig.splitterModel + "%";
    appW = uiConfig.appWHConfig.appW * 100 + "%";
    appH = uiConfig.appWHConfig.appH * 100 + "%";
    virtualHeight = uiConfig.virtualHeight;
    uiModel = uiConfig.uiModel;
    view = uiConfig.view;
  }
  let views = ["view"]
  const license = store.get("license");
  const licenseStr = crypto.Crypto().aesDecrypt(license,"prettyRedisGo-go","prettyRedisGo-go");
  if(licenseStr.startsWith("prod")){
    views.push("terminal");
  }
  export default {
    data() {
      return {
        alert:false,
        alertContent:"<font color='green'>配置成功，重启应用生效</font>",
        appW: appW,
        appWS: ["60%", "70%", "80%", "85%", "90%", "95%", "100%"],
        appH: appH,
        appHS: ["60%", "70%", "80%", "85%", "90%", "95%", "100%"],
        splitterModel: splitterModel,
        splitterModels: ["25%", "30%", "35%", "40%", "45%", "50%"],
        defautKeysSize: defautKeysSize,
        defautKeysSizes: ["5万", "10万", "15万", "20万", "25万", "50万", "100万"],
        treeListSplit: treeListSplit,
        treeListSplits: [150, 300, 500, 800, 1000, 1500, 2000],
        virtualHeight:virtualHeight,
        virtualHeights:["150px","250px","350px","500px","600px","800px","1000px","1200px"],
        uiModel:uiModel,
        uiModels:["JSON","TABLE"],
        view:view,
        views:views
      }
    },
    methods: {
      saveConfig: function () {
        appConfig.defautKeysSize = parseInt(this.defautKeysSize.replace("万",""))*10000;
        appConfig.treeListSplit = this.treeListSplit;
        store.set("appConfig",appConfig);
        uiConfig.splitterModel = parseInt(this.splitterModel.replace("%",""));
        uiConfig.appWHConfig.appW = parseInt(this.appW.replace("%",""))/100;
        uiConfig.appWHConfig.appH = parseInt(this.appH.replace("%",""))/100;

        uiConfig.virtualHeight = this.virtualHeight;
        uiConfig.uiModel = this.uiModel;
        uiConfig.view = this.view;
        store.set("uiConfig",uiConfig);
        this.alert=true;

      }
    }

  }
</script>
<style>
</style>

