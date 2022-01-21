<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <div class="q-pa-md" style="width: 98%;margin-right: 0px;overflow-x: hidden;">
      <div class="q-gutter-md">
        <q-select
          filled
          transition-show="flip-up"
          transition-hide="flip-down"
          v-model="con"
          :options="cons"
          color="teal"
          multiple
          label="请选择连接"
          options-selected-class="text-deep-orange"
          popup-content-class="bg_opacity"
        >
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"

            >
              <q-item-section>
                <q-item-label v-html="scope.opt"/>
              </q-item-section>
              <q-item-section avatar>
                <q-icon name="edit" @click.stop="edit(scope.opt)"/>
              </q-item-section>
              <q-item-section avatar>
                <q-icon name="delete" @click.stop="del(scope.opt)"/>
              </q-item-section>
            </q-item>

          </template>
          <template v-slot:append>
            <q-icon
              class="cursor-pointer"
              name="add"
              @click.stop="add"
              color="blue"
              size="md"
            />
          </template>

        </q-select>
        <template>
          <div class="q-pa-md" style="margin-top: 2px;margin-bottom: 2px;">
            <div class="q-gutter-md" style="width: 106%">
              <q-input clearable v-model="searchText"
                       filled
                       :placeholder="placeholder" @keydown="enterSearch">
                <template v-slot:append>
                  <q-icon name="search" @click.stop="search()"/>
                </template>
              </q-input>
            </div>
          </div>

        </template>
        <template>
          <div class="q-pa-md q-gutter-sm">
            <q-dialog v-model="editConnection" transition-show="rotate" transition-hide="rotate">
              <q-card style="width: 600px" class="q-px-sm q-pb-md">
                <q-card-section>
                  <div class="text-h6">配置连接</div>
                </q-card-section>
                <q-form>

                  <q-input
                    filled
                    v-model="connection.profile"
                    label="连接名称"
                    lazy-rules
                    placeholder="连接名称"
                    :rules="[ val => val && val.length > 0 || '连接名称不能为空']"
                  />
                  <q-select
                    filled
                    transition-show="flip-up"
                    transition-hide="flip-down"
                    v-model="connection.connection.type"
                    :options="connectionTypes"
                    color="teal"
                    label="请选择连接类型"
                    options-selected-class="text-deep-orange"
                    popup-content-class="bg_opacity"
                    @input="connectionTypeOnselect"
                  />
                  <q-separator style="height: 20px;background-color: white"/>
                  <q-input
                    filled
                    v-model="connection.connection.url"
                    label="地址"
                    lazy-rules

                    placeholder="localhost:6379"
                    :rules="[ val => val && val.length > 0 || '地址不能为空']"
                  />
                  <q-input v-if="connection.connection.type=='哨兵'"
                           filled
                           v-model="connection.connection.masterName"
                           label="master名称"
                           lazy-rules
                           placeholder="master名称"
                           :rules="[ val => val && val.length > 0 || 'master名称不能为空']"
                  />
                  <q-input
                    filled
                    v-model="connection.connection.password"
                    label="密码"
                    lazy-rules
                    placeholder="密码"
                    :type="passwordType"
                    :rules="[ val => val && val.length > 0 || '密码不能为空']">
                    <template v-slot:append>
                      <q-icon :name="eyes" @click.stop="configPasswordType" class="cursor-pointer"/>
                    </template>
                  </q-input>
                  <div style="display: none" v-model="connection.profile"/>
                </q-form>
                <q-card-actions align="right">
                  <q-btn label="测试" color="primary" @click.stop="testConnection(false)"/>
                  <q-btn label="取消" color="primary" v-close-popup/>
                  <q-btn label="保存" color="primary" @click.stop="saveConnection"/>
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
            <q-dialog v-model="confirmObj.confirm" persistent>
              <q-card style="width: 500px">
                <q-card-section class="row items-center">
                  <span class="q-ml-sm" v-html="confirmObj.message"></span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn label="取消" color="primary" v-close-popup/>
                  <q-btn label="确认" color="primary" @click.stop="delAct(confirmObj.con)"/>
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
  const Redis = require('ioredis');
  const redisCommand = require('../js/redis-command.js');
  const command = redisCommand.RedisCommand();
  let store = require('../js/store.js');
  let config = store.Store().get("config");
  let cons = [];
  if (config != null && config.length > 0) {
    for (let i = 0; i < config.length; i++) {
      cons.push(config[i].profile);
    }
    cons = cons.sort();
  }

  const defaultConnection = {
    "oriProfile": null,
    "profile": "localhost",
    "connection": {
      "url": 'localhost:6379',
      "type": '直连',
      "password": "password",
      "masterName": "masterName"
    }
  }

  function findCon(profile) {
    if (config != null && config.length > 0) {
      for (let i = 0; i < config.length; i++) {
        if (config[i].profile == profile) {
          return config[i];
        }
      }
    }
    return null
  }

  const cluster = "集群";
  const single = "直连";
  const sentinel = "哨兵";
  export default {
    data() {
      return {
        con: null,
        cons: cons,
        select: false,
        searchText: '',
        placeholder: "example: key|key*|*key*",
        dbKey: null,
        editConnection: false,
        connection: {
          "oriProfile": null,
          "profile": "localhost",
          "connection": {
            "url": 'localhost:6379',
            "type": '直连',
            "password": "password",
            "masterName": "masterName"
          }

        },
        connectionTypes: [single, sentinel, cluster],
        alert: false,
        alertContent: "",
        confirmObj: {confirm: false, message: '', con: null},
        passwordType: 'password',
        eyes: "img:static/eye-close.png"
      }
    },
    mounted: function () {
      const _self = this;
      window['updatePlaceholder'] = (placeholder, dbKey) => {
        _self.placeholder = placeholder;
        _self.dbKey = dbKey;
        _self.searchText = '';
      };

      window['updateAlert'] = (alert, alterContent) => {
        _self.alert = alert;
        _self.alertContent = alterContent;
      };
    },
    methods: {
      configPasswordType: function () {
        if (this.passwordType == "password") {
          this.passwordType = "text"
          this.eyes = "img:static/eye-open.png"
        } else {
          this.passwordType = "password"
          this.eyes = "img:static/eye-close.png"
        }
      },
      showLoading: function (message) {
        this.$q.loading.show({
          message: message
        })
      },
      closeLoading: function () {
        this.$q.loading.hide();
      },
      enterSearch: function (e) {
        if (e.keyCode == 13) {
          this.search();
        }
      },
      testConnection: function (isSave) {
        if (this.connection.profile == null || this.connection.profile == "") {
          this.alertContent = "<font color='red'>连接名称不能为空</font>"
          this.alert = true;
          return new Promise(function (resolve, reject) {
            return resolve({success: false, msg: null});
          });
        }
        if (this.connection.connection.url == null || this.connection.connection.url == "") {
          this.alertContent = "<font color='red'>url不能为空</font>"
          this.alert = true;
          return new Promise(function (resolve, reject) {
            return resolve({success: false, msg: null});
          });
        }
        this.showLoading("测试中");
        if (this.connection.connection.type == single) {
          return this.testConnectionBySingle(isSave);
        } else if (this.connection.connection.type == cluster) {
          return this.testConnectionByCluster(isSave);
        } else if (this.connection.connection.type == sentinel) {
          return this.testConnectionBySentinel(isSave);
        }
      },
      testConnectionBySentinel: function (isSave) {
        const _this = this;
        if (this.connection.connection.url.indexOf(":") == -1) {
          this.alertContent = "<font color='red'>非法的url,正确格式如:localhost:6379,localhost:6380,localhost:6381</font>";
          this.alert = true;
          _this.closeLoading();
          return new Promise(function (resolve, reject) {
            return resolve({success: false, msg: null});
          });
        }
        const sentinelsArr = [];
        const nodes = this.connection.connection.url.split(",");
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].indexOf(":") == -1) {
            continue;
          }
          let sentinel = {};
          sentinel.host = nodes[i].split(":")[0];
          sentinel.port = nodes[i].split(":")[1];
          sentinelsArr.push(sentinel);
        }
        const redis = new Redis({
          sentinels: sentinelsArr,
          name: this.connection.connection.masterName,
          sentinelPassword: _this.connection.connection.password,
          retryStrategy: function (times) {
            return 'no';
          }
        });

        return new Promise(function (resolve, reject) {
          redis.get("custom:key:test:connection", function (err, res) {
            if (err == null) {
              redis.disconnect();
              _this.closeLoading();
              if (!isSave) {
                _this.alertContent = "<font color='green'>测试通过</font>"
                _this.alert = true;
              }
              return resolve({success: true, msg: ""});
            } else {
              _this.closeLoading();
              _this.alertContent = "<font color='red'>" + err + "</font>"
              _this.alert = true;
              return resolve({success: false, msg: err});
            }
          });
        });
      },
    testConnectionBySingle: function (isSave) {
      const _this = this;
      if (this.connection.connection.url.indexOf(":") == -1 || this.connection.connection.url.split(":")[1].match(/^\d+$/) == null) {
        this.alertContent = "<font color='red'>非法的url,正确格式如:localhost:6379</font>";
        this.alert = true;
        _this.closeLoading();
        return new Promise(function (resolve, reject) {
          return resolve({success: false, msg: null});
        });
      }
      let con = {
        port: _this.connection.connection.url.split(":")[1], // Redis port
        host: _this.connection.connection.url.split(":")[0], // Redis host
        password: _this.connection.connection.password,
        db: 0,
        retryStrategy: function (times) {
          return 'no';
        }
      };
      const redis = new Redis(con);
      return new Promise(function (resolve, reject) {
        redis.get("custom:key:test:connection", function (err, res) {
          if (err == null) {
            redis.disconnect();
            _this.closeLoading();
            if (!isSave) {
              _this.alertContent = "<font color='green'>测试通过</font>"
              _this.alert = true;
            }
            return resolve({success: true, msg: ""});
          } else {
            _this.closeLoading();
            _this.alertContent = "<font color='red'>" + err + "</font>"
            _this.alert = true;
            return resolve({success: false, msg: err});
          }
        });
      });
    },
    testConnectionByCluster: function (isSave) {
      const _this = this;
      if (this.connection.connection.url.indexOf(":") == -1) {
        this.alertContent = "<font color='red'>非法的url,正确格式如:localhost:6379,localhost:6380,localhost:6381</font>";
        this.alert = true;
        _this.closeLoading();
        return new Promise(function (resolve, reject) {
          return resolve({success: false, msg: null});
        });
      }
      const clusterOption = {
        clusterRetryStrategy: function (times) {
          return "no";
        }
      };
      let connection = [];
      const urls = this.connection.connection.url.split(",");
      for (let i = 0; i < urls.length; i++) {
        const con = {};
        con.password = this.connection.connection.password;
        con.host = urls[i].split(':')[0];
        con.port = urls[i].split(':')[1];
        connection.push(con);
      }
      const cluster = new Redis.Cluster(connection, clusterOption);
      return new Promise(function (resolve, reject) {
        cluster.get("custom:key:test", function (err, res) {

          if (err == null) {
            cluster.disconnect();
            _this.closeLoading();
            if (!isSave) {
              _this.alertContent = "<font color='green'>测试通过</font>"
              _this.alert = true;
            }
            return resolve({success: true, msg: ""});
          } else {
            _this.closeLoading();
            _this.alertContent = "<font color='red'>" + err + "</font>"
            _this.alert = true;
            return resolve({success: false, msg: err});
          }
        });
      });
    },
    saveConnection: function () {
      const _this = this;
      if (this.connection.profile != this.connection.oriProfile && findCon(this.connection.profile) != null) {
        this.alertContent = "<font color='red'>连接名称: " + this.connection.profile + " 已经存在</font>";
        this.alert = true;
        return
      }
      this.testConnection(true).then(function (data) {
        if (data.success) {
          if (_this.connection.oriProfile != null) {
            _this.removeProfile(_this.connection.oriProfile);
            config = store.Store().get("config");
            const index = _this.cons.indexOf(_this.connection.oriProfile);
            if (index != -1) {
              _this.cons.splice(index, 1)
            }
          }

          if (_this.connection.connection.type == single) {
            _this.saveSingle();
          } else if (_this.connection.connection.type == cluster) {
            _this.saveCluster();
          } else if (_this.connection.connection.type == sentinel) {
            _this.saveSentinel();
          }

          _this.editConnection = false;
        }
      });
    },
    removeProfile: function (profile) {
      if (config != null && config.length > 0) {
        let newConfig = [];
        for (let i = 0; i < config.length; i++) {
          let p = config[i];
          if (p.profile != profile) {
            newConfig.push(p);
          }
        }
        store.Store().set("config", newConfig);
      }

    },
    saveSentinel: function () {
      const sentinelsArr = [];
      const nodes = this.connection.connection.url.split(",");
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].indexOf(":") == -1) {
          continue;
        }
        let sentinel = {};
        sentinel.host = nodes[i].split(":")[0];
        sentinel.port = nodes[i].split(":")[1];
        sentinelsArr.push(sentinel);
      }
      const connection = {
        sentinels: sentinelsArr,
        name: this.connection.connection.masterName,
        db:0,
        sentinelPassword: this.connection.connection.password,
        retryStrategy: function (times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      }
      const con = {"profile": this.connection.profile, type: 1, "connection": connection}
      config.push(con);
      store.Store().set("config", config);

      this.cons.push(this.connection.profile)
    },
    saveSingle: function () {
      const con = {
        "profile": this.connection.profile, type: 0, "connection": {
          port: this.connection.connection.url.split(':')[1], // Redis port
          host: this.connection.connection.url.split(':')[0], // Redis host
          password: this.connection.connection.password,

          db: 0,
          retryStrategy: function (times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
          }
        }
      }
      config.push(con);
      store.Store().set("config", config);

      this.cons.push(this.connection.profile)
    }
    ,
    saveCluster: function () {
      const urls = this.connection.connection.url.split(",");
      const connection = [];
      for (let i = 0; i < urls.length; i++) {
        const con = {};
        con.password = this.connection.connection.password;
        con.host = urls[i].split(':')[0];
        con.port = urls[i].split(':')[1];
        connection.push(con);
      }
      const cluster = {"profile": this.connection.profile, type: 2, "connection": connection};
      config.push(cluster);
      store.Store().set("config", config);
      const index = this.cons.indexOf(this.connection.profile);
      this.cons.push(this.connection.profile)
    }
    ,
    search: function () {
      searchByPattern(this.searchText, this.dbKey);
    }
    ,
    edit: function (con) {
      const dbCon = findCon(con);
      if (dbCon != null) {
        this.editConnection = true;
        this.connection.profile = con;
        if (dbCon.type == 0) {
          this.connection.connection.type = single;
          this.connection.connection.password = dbCon.connection.password;
          this.connection.connection.url = dbCon.connection.host + ":" + dbCon.connection.port
        } else if (dbCon.type == 2) {
          this.connection.connection.type = cluster;
          this.connection.connection.password = dbCon.connection[0].password;
          const dbCons = dbCon.connection;
          if (dbCons != null) {
            let url = "";
            for (let i = 0; i < dbCons.length; i++) {
              url = url + dbCons[i].host + ":" + dbCons[i].port + ";"
            }
            url = url.substr(0, url.length - 1);
            this.connection.connection.url = url;
          }
        }else if(dbCon.type == 1){
          this.connection.connection.type = sentinel;
          this.connection.connection.password = dbCon.connection.sentinelPassword;
          const dbCons = dbCon.connection.sentinels;
          if (dbCons != null) {
            let url = "";
            for (let i = 0; i < dbCons.length; i++) {
              url = url + dbCons[i].host + ":" + dbCons[i].port + ";"
            }
            url = url.substr(0, url.length - 1);
            this.connection.connection.url = url;
            this.connection.connection.masterName = dbCon.connection.name;
          }
        }
      }
      this.connection.oriProfile = con;
      // this.cons.splice(index, 1, con + "edit")
    }
    ,
    del: function (con) {
      this.confirmObj.confirm = true;
      this.confirmObj.message = "<font color='red'>确认删除连接:" + con + "?</font>";
      this.confirmObj.con = con;
    }
    ,
    delAct: function (con) {
      let index = this.cons.indexOf(con);
      this.cons.splice(index, 1);
      this.removeProfile(con)
      this.confirmObj.confirm = false;
      this.confirmObj.con = null;
      this.confirmObj.message = null;
    },
    add: function () {
      this.editConnection = true;
      this.connection = {
        "oriProfile": null,
        "profile": "localhost",
        "connection": {
          "url": 'localhost:6379',
          "type": '直连',
          "password": "password",
          "masterName": "mymaster"
        }
      };
      // this.cons.splice(1, 0, "add");
    },
    connectionTypeOnselect: function (value) {
      if (value == cluster) {
        this.connection.connection.url = "localhost:6379,localhost:6380,localhost:6381,..."
      } else if(value==sentinel){
        this.connection.connection.url = "localhost:26379,localhost:26380,localhost:26381"
      }else{
        this.connection.connection.url = "localhost:6379";
      }
    },
  },
  watch: {
    con: function () {
      window.reloadCon(this.con);
    }
  }

  }
</script>
<style>
  .q-item {
    min-height: 48px;
    padding: 1px 16px;
    color: inherit;
    transition: color .3s, background-color .3s;
  }

  .bg_opacity {
    opacity: 0.9;
  }
</style>
