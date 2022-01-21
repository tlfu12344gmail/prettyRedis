<template>
  <div >
    <div class="q-gutter-y-md" style="width: 100%">
      <q-card>
        <q-tabs
          v-model="tab"
          inline-label
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
          no-caps
          class="bg-grey-3"
        >
          <q-tab align="left" v-for="tab in tabs" :key="tab.name" v-bind="tab">
            <div v-if="tab.index == 0">
              <span>&nbsp;</span>
              <q-icon name="add" @click.stop="addTab()"/>
            </div>
            <div v-else>
              <span>&nbsp;</span>
              <q-icon name="remove" @click.stop="removeTab(tab)"/>
            </div>
          </q-tab>
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="tab" animated keep-alive>
          <q-tab-panel v-for="tab in tabs" :name="tab.name" :key="tab.name">
           <q-scroll-area :style="term_body">
              <div :id="tab.container">
                <output></output>
                <div :id="tab.inputLine" class="input-line">
                  <div class="termPrompt"></div>
                  <div>
                    <input class="cmdline"/><span class="pbg"></span><span class="placeholder"></span>
                  </div>
                </div>
              </div>
            </q-scroll-area>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>
<script>

  let index = 0;
  import term from "../js/terminal.js";
  import $ from "../js/jquery.min.js";
  require("../js/terminal-find.js");
  const getmac = require('getmac');
  let store = require('../js/store.js').Store();
  let serverUrl = "http://localhost:9000/pr";
  if (process.env.PROD) {
    serverUrl = "https://www.fullmile.tech/pr"
  }

puts();
  function puts() {
      //远程请求license
      try {
        let localLicense = store.get("license");
        const mac = getmac.default();
        if (mac != null && mac != "") {

          $.ajax({
            type: "POST", url: serverUrl + "/mac-license",
            contentType: "application/json", dataType: "json",
            data: JSON.stringify({
              mac: mac,
              license: localLicense,
              platform: process.platform
            }), success: function (result) {
              if (result.success) {
                if (localLicense != result.data.license) {
                  store.set("license", result.data.license);
                }
              }

            }
          });
        }

      } catch (e) {
    }
  }
  const isMac = process.platform === 'darwin';
  const tabs = [{
    name: "terminal-" + index,
    label: "Terminal-" + index,
    index: index,
    container: "container" + index,
    "inputLine": "input-line" + index
  }
  ];
  let term_body = "height: 558px; width: 100%;background-color: black";
  export default {
    data() {
      return {
        tab: 'terminal-0',
        tabs: tabs,
        term_body: term_body,
      }
    },
    mounted: function () {
      $(".q-loading-bar").remove();
      let _this = this;
      _this.calTerminalH();
      _this.initTab();
      window['updateTabName'] = (index, name) => {
        _this.updateTabName(index, name);
      };
      // window.onresize = function(){ // 定义窗口大小变更通知事件
      //   //$(".q-scrollarea").height($(document).height());
      //   _this.calTerminalH();
      // };
      window.addEventListener('resize',() => _this.calTerminalH(), false)

    },

    beforeDestroy () {
      window.onresize = null
    },
    methods: {
      setTabSelected(tab, status) {
        if (status === true) {
          this.tabs.push(tab);
        } else {
          const index = this.tabs.indexOf(tab);
          if (index > -1) {
            this.tabs.splice(index, 1);
          }
        }
      },
      initTab() {
        term.Terminal('#input-line' + index + ' .cmdline', '#container' + index + ' output',
          index);
        $('#input-line' + index + ' .termPrompt').html('use command "help" to show usage>');

      },
      updateTabName(index, name) {
        for (let i = 0; i < this.tabs.length; i++) {
          if (this.tabs[i].name == "terminal-" + index) {
            this.tabs[i].label = name;
            break;
          }
        }
      },
      calTerminalH(){
        const doc_h=$('body').height();
        const term_h  = $(".q-tabs").height()+2;//padding上下1px
        let term_b = doc_h-term_h;
        const not_mac_h = 2 //mac下没有header
        if(!isMac){
          term_b = term_b-not_mac_h;
        }else{
          term_b = term_b-not_mac_h*2;
        }
        this.term_body = "height: "+term_b+"px; width: 100%;background-color: black";
      },
      addTab() {
        index++;
        let addTab = {
          name: 'terminal-' + index,
          label: 'Terminal-' + index,
          index: index,
          container: "container" + index,
          "inputLine": "input-line" + index
        }
        this.tabs.push(addTab);
        this.tab = this.tabs[this.tabs.length-1].name;
        this.$nextTick(() => {
          this.initTab();
        })
      },
      removeTab(tab) {
        let index = this.tabs.indexOf(tab)
        if (index > -1) {
          this.tabs.splice(index, 1)
          if(index-1<0){
            index=1;
          }
          if(this.tabs.length>0){
            this.tab = this.tabs[index-1].name;
          }
        }


      }

    }
  }

</script>

<style>
  @import "../css/terminal.css";
  @import "../css/jquery.json-viewer.css";
  @import "../css/termimal-find.css";
  @import "../css/styles.css";


  .q-tab-panel {
    padding: 1px;
  }

  .self-stretch {
    align-self: baseline;
  }

  .q-tab {
    padding: 0 16px;
    min-height: 1px;
    transition: color .3s, background-color .3s;
    white-space: nowrap;
    color: inherit;
    text-decoration: none;
  }

  .q-gutter-y-md > *, .q-gutter-md > * {
    margin-top: 16px;
  }

  .q-tab__label {
    font-size: 18px;
    line-height: 1.715em;
    font-weight: 500;
  }

  .scroll {
    overflow-y: auto;
    overflow-x: hidden;
  }
  .q-card {
    font-size:16px;
  }
  .pbg{
    color: white;
    z-index: -100;
    width: 100%;
    opacity: 0;
  }
</style>
