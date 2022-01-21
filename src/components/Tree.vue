<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="q-pa-md q-gutter-sm">
    <q-tree
      :nodes="customize"
      node-key="id"
      @lazy-load="onLazyLoad"
      :selected.sync="selected"
      selected-color="green"
      ref="tree"
      no-connectors
    >
      <template v-slot:header-root="prop">
        <div class="row items-center" @dblclick="nodeDblclick(prop.node)">
          <span v-if="prop.node.type === 0">
            <q-icon name="img:static/redis-single.png" size="24px" class="q-mr-sm"/>
          </span>
          <span v-else-if="prop.node.type === 1">
            <q-icon name="img:static/redis-sen.png" size="24px" class="q-mr-sm"/>
          </span>
          <span v-else-if="prop.node.type === 2">
            <q-icon name="img:static/redis-cluster.png"  size="24px" class="q-mr-sm"/>
          </span>
          <div class="text-weight-bold text-primary">
            {{ prop.node.label }}
          </div>
        </div>
      </template>

      <template v-slot:header-generic="prop">
        <div class="row items-center" @dblclick="nodeDblclick(prop.node)">
          <q-icon :name="prop.node.icon || 'star'"  size="16px" class="q-mr-sm"/>
          <div class="text-primary">{{ prop.node.keyCount }}</div>
          <div  style="font-size: 14px;white-space: nowrap">{{ prop.node.label }}</div>
        </div>
      </template>
      <template v-slot:body-list="prop">
        <q-virtual-scroll
          :style="virtualHeight"
          :items="prop.node.list"
          separator
          :virtual-scroll-slice-size=50
        >
          <template v-slot="{ item, index }">
            <q-item
              :key="index"
              dense

            >
              <q-item-section>
                <div class="row items-center" @click.stop="leafEvent(item)">
                  <q-icon :name="item.icon || 'star'"  size="14px" class="q-mr-sm"/>
                  <q-item-label :id="item.profile+'-'+item.db+'-'+item.label.replace(/\:/g,'-')"
                                style="color: black;font-size: 14px;white-space: nowrap">
                    {{ item.label }}
                  </q-item-label>
                </div>
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>
        <!--<p class="text-caption">{{ prop.node.caption }}</p>-->
        <!--<q-toggle v-model="prop.node.enabled" label="I agree to the terms and conditions" />-->
      </template>
    </q-tree>
  </div>
</template>

<script>
import $ from "../js/jquery.min.js";
//const load = require( '../js/loading.js')
//const loading = load.Loading();
const Redis = require('ioredis');
const redisCommand = require('../js/redis-command.js');
const command = redisCommand.RedisCommand();
let store = require('../js/store.js');
let config = store.Store().get("config");
let customize = [
  // {
  //   label: 'root',
  //   header: 'root',
  //  // icon:"database",
  //   children: [
  //     {
  //       label: 'Good food',
  //       icon: 'restaurant_menu',
  //       header: 'generic',
  //       children: [
  //         {
  //           label: 'Quality ingredients',
  //           header: 'generic',
  //           body: 'story',
  //           story: 'Lorem ipsum dolor sit amet.'
  //         },
  //       ]
  //     },
  //     {
  //       label: 'Pleasant surroundings',
  //       children: [
  //         {label: 'Happy atmosphere'},
  //         {label: 'Good table presentation', header: 'generic'},
  //         {label: 'list',icon:'play_arrow',iconColor:"red",expandable:false , body: 'list', header: 'list', list: [{label: 'A'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}]},
  //
  //         {label: 'Pleasing decor', children: [{label: 'test2',children:[{label: 'test22'}]},{label: 'test',icon:"people",iconColor:"red"}]}
  //       ]
  //     }
  //   ]
  // }
];
let treeListSplit = 500;
let uiModel = "JSON";
const appConfig = store.Store().get("appConfig")
const uiConfig = store.Store().get("uiConfig");
if(appConfig!=null&&appConfig.treeListSplit!=null){
  treeListSplit = appConfig.treeListSplit;
}
let virtualHeight="max-height: 150px";
if (uiConfig != null) {
  virtualHeight = "max-height:"+uiConfig.virtualHeight
  uiModel = uiConfig.uiModel;
}
function getAddAndDelCons(oldCons, newCons) {
  let map = new Map();
  let adds = [];
  let dels = []
  for (let i = 0; i < oldCons.length; i++) {
    const exist = existCon(oldCons[i], newCons);
    if (!exist) {
      dels.push(oldCons[i])
      map.set("del", dels);
    }
  }
  for (let i = 0; i < newCons.length; i++) {
    const exist = existCon(newCons[i], oldCons);
    if (!exist) {
      adds.push(newCons[i])
      map.set("add", adds);
    }
  }

  return map;
}

function existCon(con, cons) {
  for (let i = 0; i < cons.length; i++) {
    if (cons[i] == con) {
      return true
    }
  }
  return false;
}

function findCon(profile) {
  if (config != null && config.length > 0) {
    for (let i = 0; i < config.length; i++) {
      if (config[i].profile == profile) {
        return config[i];
      }
    }
  }
}

export default {
  //cons是string ex:[dev,test.uat,pro]
  data() {
    return {customize: customize, cons: [], addCon: [], delCon: [], selected: null, currentDb: null, pattern: '',virtualHeight:virtualHeight}
  },

  created() {
  },
  mounted() {
    let _self = this;
    $(".q-tree__node-body").hide();
    window['reloadCon'] = (cons) => {
      config = store.Store().get("config");
      if (cons == "") {
        _self.customize = $.extend(true, [], []);
        _self.cons = [];
      } else if (_self.cons.length == 0 && cons != "") {
        _self.cons = cons;
        _self.addCon = $.extend(true, [], cons);
      } else {
        const map = getAddAndDelCons(_self.cons, cons);
        _self.addCon = $.extend(true, [], map.get("add"));
        _self.delCon = $.extend(true, [], map.get("del"));
        _self.cons = cons;
      }
    };
    window['searchByPattern'] = (pattern, dbKey) => {
      _self.pattern = pattern;
      const dbNode = _self.$refs.tree.getNodeByKey(dbKey);
      if (dbNode != null) {
        _self.dealWithDBList(dbNode, null, pattern);
      }

    }
  },
  watch: {
    addCon: function () {
      for (let i = 0; i < this.addCon.length; i++) {
        const conObj = findCon(this.addCon[i]);
        if (conObj == null) {
          continue;
        }
        //type 0:single,1:set,2:cluster
        //nodeType:0:con,1:db,2:group,3:key
        let root = {
          id: conObj.profile + Math.random() + "_-1",
          type: conObj.type,
          nodeType: 0,
          label: conObj.profile,
          header: 'root',
          profile: conObj.profile,
          lazy: true
        };
        this.customize.push(root); //= $.extend(true, [], roots);
      }

    },
    delCon: function () {
      for (let i = 0; i < this.delCon.length; i++) {
        for (let j = 0; j < this.customize.length; j++) {
          if (this.customize[j].profile == this.delCon[i]) {
            this.customize.splice(j, 1);
            return;
          }
        }
      }

    }
  },
  methods: {
    onLazyLoad({node, key, done, fail}) {
      let _self = this;
      //type 0:single,1:set,2:cluster
      //nodeType:0:con,1:db,2:group,3:key
      if (node.nodeType > 0) {
        const nowDB = node.profile + ":" + node.db;
        if (_self.currentDb == null || _self.currentDb != nowDB) {
          _self.currentDb = nowDB;
          _self.pattern = "";
          updatePlaceholder(_self.currentDb + " -> key|key*|*key*", node.dbKey);
        }
      }

      if (node.nodeType == 0 && node.type == 0) {
        _self.dealWithSingleConnection(node, done);
      } else if (node.nodeType == 1 && node.type == 0) {
        _self.dealWithDBList(node, done, _self.findDBSearchPattern());
      } else if (node.nodeType == 2 && node.type == 0) {
        _self.dealWithGroup(node, done, _self.findGroupSearchPattern(node));
      }
      //以上是直连
      else if (node.nodeType == 0 && node.type == 2) {
        _self.dealWithClusterConnection(node, done);
      } else if (node.nodeType == 1 && node.type == 2) {
        _self.dealWithDBList(node, done, _self.findDBSearchPattern());
      } else if (node.nodeType == 2 && node.type == 2) {
        _self.dealWithGroup(node, done, _self.findGroupSearchPattern(node));
      }
      //以上是集群，
      //以下是哨兵
      else if(node.nodeType == 0 && node.type == 1){
        _self.dealWithSentinelConnection(node, done);
      }else if(node.nodeType == 1 && node.type == 1){
        _self.dealWithDBList(node, done, _self.findDBSearchPattern());
      }else if(node.nodeType == 2 && node.type == 1){
        _self.dealWithGroup(node, done, _self.findGroupSearchPattern(node));
      }
    },

    nodeDblclick(node) {
      this.resetSearchText(node);
      if (node.nodeType == 1) {
        this.pattern = "";
        this.fleshDb(node);
      }
      if (node.nodeType == 2) {
        this.fleshGroup(node);
      }
      //node.label=node.label+"_dbl"
      // console.log("dbl"+node.label)
    },
    resetSearchText(node){
      const nowDB = node.profile + ":" + node.db;
      if (this.currentDb == null || this.currentDb != nowDB) {
        this.currentDb = nowDB;
        this.pattern = "";
        updatePlaceholder(this.currentDb + " -> key|key*|*key*", node.dbKey);
      }
    },
    leafEvent(node) {
      const nowDB = node.profile + ":" + node.db;
      if (this.currentDb == null || this.currentDb != nowDB) {
        this.currentDb = nowDB;
        this.pattern = "";
        updatePlaceholder(this.currentDb + " -> key|key*|*key*", node.dbKey);
      }
      this.getKeyValue(node.profile, node.db, node.actLabel);
      const leafId = node.profile + "-" + node.db + "-" + node.actLabel.replace(/\:/g, '-');
      const leafIdLike = node.profile + "-" + node.db + "-";
      const color = $("#" + leafId).css("color");

      if (color == "rgb(0, 0, 0)") {
        $("div[id^='" + leafIdLike + "']").css("color", 'black');
        $("#" + leafId).css("color", 'green');
      } else if (color == 'rgb(0, 128, 0)') {
        $("#" + leafId).css("color", 'black');
      }
    },
    fleshDb(node) {
      this.dealWithDBList(node, null, "*");
    },
    findDBSearchPattern() {
      let tempPattern = "*";
      if (this.pattern != null && this.pattern != "") {
        tempPattern = this.pattern;
      }
      return tempPattern
    },
    findGroupSearchPattern(node) {
      let tempPattern = node.actLabel + ":*";
      if (this.pattern != null && this.pattern != "") {
        if (this.pattern.startsWith("*") && !this.pattern.endsWith("*")) {
          tempPattern = node.actLabel + this.pattern;
        } else if (this.pattern.indexOf("*") == -1) {
          tempPattern = this.pattern;
        }else if(!this.pattern.startsWith("*")&&this.pattern.endsWith("*")){
          tempPattern = this.pattern;
        }else if(this.pattern.startsWith("*")&&this.pattern.endsWith("*")){
          tempPattern =this.pattern.replace(/\*/g,"").replace(/\:/,"");
          if(node.actLabel.indexOf(tempPattern)>-1){
            tempPattern = node.actLabel + ":*";
          }else {
            tempPattern = node.actLabel + this.pattern;
          }
        }
      }
      return tempPattern;
    },
    fleshGroup(node) {
      this.dealWithGroup(node, null, node.actLabel + ":*")
    },
    updateNode(target) {
      if (target == null) {
        return
      }
      this.selected = target
     // console.log(target)
     // const selectNode = this.$refs.tree.getNodeByKey(target);

    },
    handlerNode(node) {
      //this.selected = node.label
      const nowDB = node.profile + ":" + node.db;
      if (this.currentDb == null || this.currentDb != nowDB) {
        this.currentDb = nowDB;
        this.pattern = "";
        updatePlaceholder(this.currentDb + " -> key|key*|*key*", node.dbKey);
      }
      // console.log(node.label)
      if (node.nodeType == 3) {
        this.getKeyValue(node.profile, node.db, node.actLabel);
      }
    },
    dealWithGroup(node, done, pattern) {
      const _self = this;
      _self.getGroupKeyByPattern(node,pattern).then(function (d) {
        if (d.success) {
          const nowDB = node.profile + ":" + node.db;
          if (_self.currentDb == null || _self.currentDb != nowDB) {
            _self.currentDb = nowDB;
            _self.pattern = "";
            updatePlaceholder(_self.currentDb + " -> key|key*|*key*", node.dbKey);
          }
          const keys = d.msg;
          if (keys.length < treeListSplit) {
            let keysCount = 0
            for (let i = 0; i < keys.length; i++) {
              if (keys[i].nodeType == 2) {
                keysCount = keysCount + parseInt(keys[i].keyCount.replace(/\(|\)/g, ""))
              } else if (keys[i].nodeType == 3) {
                keysCount = keysCount + 1;
              }
            }
            node.keyCount = "(" + keysCount +")";
            if (done != null) {
              done(keys)
            } else {
              node.children = keys;
            }
          } else {
            node.body = "list";
            //node.header = "list"
            //node.icon = "play_arrow";
            node.list = keys;
            //node.children = keys;
            node.keyCount = "(" + keys.length + ")"
            if (done != null) {
              done([{label:""}])
            }
          }
        }
      });
    },
    dealWithDBList(node, done, pattern) {
      const _self = this;
      console.log(node.profile + "_" + node.db)
      this.getDbSize(node.type, node.profile, node.db).then(function (data) {
        if (data.success) {
          if (data.msg == null) {
            data.msg = 0;
          }
          _self.getKeyByPattern(node.type, node.profile, node.db, pattern, node.dbKey).then(function (d) {
            if (d.success) {
              const nowDB = node.profile + ":" + node.db;
              if (_self.currentDb == null || _self.currentDb != nowDB) {
                _self.currentDb = nowDB;
                _self.pattern = "";
                updatePlaceholder(_self.currentDb + " -> key|key*|*key*", node.dbKey);
              }

              const keys = d.msg;
              if (keys.length < treeListSplit) {
                let keysCount = 0
                for (let i = 0; i < keys.length; i++) {
                  if (keys[i].nodeType == 2) {
                    keysCount = keysCount + parseInt(keys[i].keyCount.replace(/\(|\)/g, ""))
                  } else if (keys[i].nodeType == 3) {
                    keysCount = keysCount + 1;
                  }
                }
                node.keyCount = "(" + keysCount + "/" + data.msg + ")"
                if (done != null) {
                  done(keys)
                } else {
                  node.children = keys;
                }
              } else {
                // {label: 'list',icon:'play_arrow',iconColor:"red",expandable:false , body: 'list', header: 'list', list: [{label: 'A'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}]},
                // node.iconColor = "red";
                node.body = "list";
                //node.header = "list"
                node.list = keys;
                //node.children = keys;
                node.keyCount = "(" + keys.length + "/" + data.msg + ")"
                node.children=[{label:"11"}]
                if (done != null) {
                  done([])
                }

              }

            }
          });
        }
      });
    },
    dealWithSingleConnection(node, done) {
      //测试redis连接，成功后加载db列表
      const _self = this;
      this.testSingeDbConnect(findCon(node.profile)).then(function (data) {
        if (data.success) {
          _self.initSingeModeConnect(findCon(node.profile), 0);
          _self.findSingeModeDbs(findCon(node.profile)).then(function (data) {
            if (data.success) {
              const rootDb = data.msg;
              done(rootDb);
            }
          });
        } else {
          updateAlert(true,"<font color='red'>"+data.msg+"</font>");
          done([])
        }
      });
    },
    dealWithSentinelConnection(node,done){
      const _self = this;
      this.testSentinelDBConnect(findCon(node.profile)).then(function (data){
        if (data.success) {
          _self.initSentinelModeConnect(findCon(node.profile), 0);
          _self.findSingeModeDbs(findCon(node.profile)).then(function (data) {
            if (data.success) {
              const rootDb = data.msg;
              done(rootDb);
            }
          });
        } else {
          updateAlert(true,"<font color='red'>"+data.msg+"</font>");
          done([])
        }
      });
    },
    dealWithClusterConnection(node, done) {
      //测试redis连接，成功后加载db列表
      const _self = this;
      this.testClusterDbConnect(findCon(node.profile)).then(function (data) {
        if (data.success) {
          _self.initClusterModeConnect(findCon(node.profile), 0);
          const rootDb = [];
          let child = {};
          child.id = node.profile + Math.random() + "_" + 0;
          child.label = "db" + 0;
          child.type = 2;
          child.nodeType = 1;
          child.header = 'generic';
          child.lazy = true;
          child.db = 0;
          child.profile = node.profile;
          child.dbKey = child.id;
          child.icon = 'img:static/redis-db.png';
          child.handler = (node) => {
            _self.handlerNode(node)
          };
          rootDb.push(child)
          done(rootDb);
        } else {
         // _self.alertInfo = true;
          //_self.alertContentInfo = data.msg;
          updateAlert(true,"<font color='red'>"+data.msg+"</font>");
          done([])
        }
      });
    },
    testSingeDbConnect(connection) {
      let con = {
        port: connection.connection.port, // Redis port
        host: connection.connection.host, // Redis host
        password: connection.connection.password,
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
            return resolve({success: true, msg: ""});
          } else {
            return resolve({success: false, msg: err});
          }
        });
      });
    },
    testSentinelDBConnect(connection){
      let con = connection.connection;
     const testCon = {
        sentinels: con.sentinels,
        name: con.name,
        db:0,
        sentinelPassword:con.sentinelPassword,
        retryStrategy: function (times) {
        return 'no';
      }
      }
      let redis = new Redis(testCon);
      return new Promise(function (resolve, reject) {
        redis.get("custom:key:test:connection", function (err, res) {
          if (err == null) {
            redis.disconnect();
            return resolve({success: true, msg: ""});
          } else {
            return resolve({success: false, msg: err});
          }
        });
      });
    },
    testClusterDbConnect(connection) {
      let con = connection.connection
      const clusterOption = {
        clusterRetryStrategy: function (times) {
          return "no";
        }
      };
      const cluster = new Redis.Cluster(con, clusterOption);
      return new Promise(function (resolve, reject) {
        cluster.get("custom:key:test:connection", function (err, res) {
          if (err == null) {
            cluster.disconnect();
            return resolve({success: true, msg: ""});
          } else {
            return resolve({success: false, msg: err});
          }
        });
      });
    },
    initSingeModeConnect(connection, db) {
      let con = connection.connection;
      con.db = db;
      const redis = new Redis(con);
      let instance = {};
      instance.redis = redis;
      instance.isCluster = false;
      redisCommand.RedisCommand().init(connection.profile + ":" + db, instance);
    },
    initSentinelModeConnect(connection, db) {
      let con = connection.connection;
      con.db = db;
      const redis = new Redis(con);
      let instance = {};
      instance.redis = redis;
      instance.isCluster = false;
      redisCommand.RedisCommand().init(connection.profile + ":" + db, instance);
    },
    initClusterModeConnect(connection, db) {
      let con = connection.connection;
      con.db = db;
      const clusterOption = {
        clusterRetryStrategy: function (times) {
          let delay = Math.min(times * 50, 2000);
          return delay;
        }
      };
      const cluster = new Redis.Cluster(con, clusterOption);
      let instance = {};
      instance.redis = cluster;
      instance.isCluster = true;
      redisCommand.RedisCommand().init(connection.profile + ":" + db, instance);
    },

    findSingeModeDbs(connection) {
      const _self = this;
      return new Promise(function (resolve, reject) {
        command.parseCmd(connection.profile + ":0", 'config', ['get', 'databases']).then(function (data) {
          const dbCount = parseInt(data.res[1]);
          let rootDb = [];
          for (let i = 0; i < dbCount; i++) {
            let child = {};
            child.id = connection.profile + Math.random() + "_" + i;
            child.label = "db" + i;
            child.type = 0;
            child.nodeType = 1;
            child.header = 'generic';
            child.lazy = true;
            child.db = i;
            child.profile = connection.profile;
            child.dbKey = child.id;
            child.icon = 'img:static/redis-db.png';
            child.handler = (node) => {
              _self.handlerNode(node)
            };
            rootDb.push(child)
          }
          return resolve({success: true, msg: rootDb});
        });
      });
    },
    getDbSize(type, profile, db) {
      if (type == 0) {
        this.initSingeModeConnect(findCon(profile), db);
      } else if (type == 2) {
        this.initClusterModeConnect(findCon(profile), db)
      }
      return new Promise(function (resolve, reject) {
        command.parseCmd(profile + ":" + db, 'dbsize').then(function (data) {
          return resolve({success: true, msg: data.res});
        });
      });
    },
    getKeyByPattern(type, profile, db, pattern, dbKey) {
      const _self = this;
      let arg = [];
      arg.push(pattern);
      arg.push(command.defaultKeysSize);
      const profileMap = redisCommand.RedisCommand().getRedis();
      if (profileMap && !profileMap.has(profile + ":" + db) && type == 0) {
        _self.initSingeModeConnect(findCon(profile), db);
      }
      if (profileMap && !profileMap.has(profile + ":" + db) && type == 2) {
        _self.initClusterModeConnect(findCon(profile), db);
      }
      return new Promise(function (resolve, reject) {
        command.parseCmd(profile + ":" + db, 'keys', arg).then(function (data) {
          console.log(data);
          let arr = data.res;
          let keys = [];
          let groupMap = new Map();
          //默认展示是tree，如果大于treeListSplit，直接用虚拟列表，不分组
          let isList = false;
          let total = 0;
          for (let i = 0; i < arr.length; i++) {
            let child = {};
            //没有分组直接加入keys中
            if (arr[i].indexOf(":") == -1) {
              child.id = profile + "_" + db + "_" + Math.random() + "_" + arr[i];
              child.label = arr[i];
              child.actLabel = arr[i];
              child.type = type;
              child.nodeType = 3;
              child.header = 'generic';
              child.icon = 'img:static/key.png';
              child.lazy = false;
              child.profile = profile;
              child.db = db;
              child.dbKey = dbKey;
              child.handler = (node) => {
                _self.handlerNode(node)
              };
              keys.push(child)
              total = total + 1;
              if (total >= treeListSplit) {
                isList = true;
                keys = [];
                break;
              }


            } else {
              //有分组，key为从开始到最后一个：,value为数量
              const groupName = arr[i].substr(0, arr[i].indexOf(":"));
              if (!groupMap.has(groupName)) {
                groupMap.set(groupName, 1);
                total = total + 1;
                if (total >= treeListSplit) {
                  isList = true;
                  keys = []
                  break;
                }
              } else {
                groupMap.set(groupName, groupMap.get(groupName) + 1);
              }
            }
          }
          if (!isList && groupMap.size > 0) {
            for (let item of groupMap.keys()) {
              let child = {};
              child.id = profile + "_" + db + "_" + Math.random() + "_" + item;
              child.label = item;
              child.actLabel = item;
              child.type = type;
              child.nodeType = 2;
              child.header = 'generic';
              child.icon = 'img:static/keys.png';
              child.lazy = true;
              child.profile = profile;
              child.db = db;
              child.keyCount = "(" + groupMap.get(item) + ")";
              child.dbKey = dbKey;
              child.handler = (node) => {
                _self.handlerNode(node)
              };
              keys.push(child);
            }
          }
          //key少，可已排序
          if (keys.length < treeListSplit) {
            keys = keys.sort(function (a, b) {
              if (a.nodeType == b.nodeType) {
                return a.label.localeCompare(b.label);
              } else {
                return a.nodeType - b.nodeType;
              }
            });
          }

          //用虚拟列表展示
          if (isList) {
            // {label: 'list',icon:'play_arrow',iconColor:"red",expandable:false , body: 'list', header: 'list', list: [{label: 'A'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}, {label: 'B'}, {label: 'C'}]},
            for (let i = 0; i < arr.length; i++) {
              let child = {};
              child.id = profile + "_" + db + "_" + Math.random() + "_" + arr[i];
              child.label = arr[i];
              child.actLabel = arr[i];
              child.type = type;
              child.nodeType = 3;
              child.icon = 'img:static/key.png';
              child.profile = profile;
              child.db = db;
              child.dbKey = dbKey;
              child.handler = (node) => {
                _self.handlerNode(node)
              };
              keys.push(child)
            }
          }

          arr = null;
          return resolve({success: true, msg: keys});
        });
      });
    },
    getGroupKeyByPattern(node,pattern) {
      const _self = this;
      let arg = [];
      arg.push(pattern);
      arg.push(command.defaultKeysSize);
      const profileMap = redisCommand.RedisCommand().getRedis();
      if (profileMap && !profileMap.has(node.profile + ":" + node.db) && type == 0) {
        _self.initSingeModeConnect(findCon(node.profile), node.db);
      }
      if (profileMap && !profileMap.has(node.profile + ":" + node.db) && type == 2) {
        _self.initClusterModeConnect(findCon(node.profile), node.db);
      }
      return new Promise(function (resolve, reject) {
        command.parseCmd(node.profile + ":" + node.db, 'keys', arg).then(function (data) {
          let arr = data.res;
          let keys = [];
          const groupMap = new Map();
          for (let i = 0; i < arr.length; i++) {
            const tempKey = arr[i].replace(node.actLabel + ":", "");
            if (tempKey.indexOf(":") == -1||arr.length>=treeListSplit) {
            let child = {};
            child.id = node.profile + Math.random() + "_" + arr[i];
            child.label = arr[i];
            child.actLabel = arr[i];
            child.type = node.type;
            child.nodeType = 3;
            child.header = 'generic';
            child.icon = 'img:static/key.png';
            child.lazy = false;
            child.profile = node.profile;
            child.db = node.db;
            child.dbKey = node.dbKey;
            child.handler = (node) => {
              _self.handlerNode(node)
            };
            keys.push(child)
          }else{
              const groupName =node.actLabel+":"+tempKey.split(":")[0];
              if (!groupMap.has(groupName)) {
                groupMap.set(groupName, 1);
              } else {
                groupMap.set(groupName, groupMap.get(groupName) + 1);
              }

             // keys.push(child)
            }
        }
          if (groupMap.size > 0) {
            for (let item of groupMap.keys()) {
              let child = {};
              child.id = node.profile + Math.random() + "_" + item;
              child.label = item.split(":")[item.split(":").length-1];
              child.actLabel = item
              child.type = node.type;
              child.nodeType = 2;
              child.header = 'generic';
              child.icon = 'img:static/keys.png';
              child.lazy = true;
              child.profile = node.profile;
              child.db = node.db;
              child.dbKey = node.dbKey;
              child.keyCount = "(" + groupMap.get(item) + ")";
              child.handler = (node) => {
                _self.handlerNode(node)
              };
              keys.push(child);
            }
          }
          if (keys.length < treeListSplit) {
            keys = keys.sort(function (a, b) {
              if (a.nodeType == b.nodeType) {
                return a.label.localeCompare(b);
              } else {
                return a.nodeType - b.nodeType;
              }
            });
          }
          arr = null;
          return resolve({success: true, msg: keys});
        });
      });
    },
    getKeyValue(profile, db, key) {
      const _self = this;
      let arg = [];
      arg.push(key);
      command.parseCmd(profile + ":" + db, 'type', arg).then(function (data) {
        if (data.res) {
          const type = data.res;
          if(uiModel=="JSON"){
            if (type == "string") {
              _self.getStringV(profile + ":" + db, key, type);
            } else if (type == "set") {
              _self.getSetV(profile + ":" + db, key, type);
            } else if (type == "zset") {
              _self.getZSetV(profile + ":" + db, key, type);
            } else if (type == "list") {
              _self.getListV(profile + ":" + db, key, type);
            } else if (type == "hash") {
              _self.getHastV(profile + ":" + db, key, type);
            } else if (type == "none") {
              _self.pushValueToView("the key:'" + key + "' of type is null! can not find the value");
            }
          }else{
            const d ={};
            d.type = type;
            d.key = key;
            d.profile = profile;
            d.db = db;
            _self.pushValueToView(d);
          }


        }
      });
    },
    pushValueToView(value){
      contentShow(value);
    },
    getHastV(profile, key, type) {
      let arg = [];
      const _self = this;
      arg.push(key);
      command.parseCmd(profile, 'hgetall', arg).then(function (data) {
        if (data.res) {
          let dd = {};
          dd.key = key;
          dd.type = type;
          dd.value = data.res;
          _self.pushValueToView(dd);
        }
      })
    },

    getListV(profile, key, type) {
      const _self = this;
      let arg = [];
      arg.push(key);
      arg.push(0);
      arg.push(-1);
      command.parseCmd(profile, 'lrange', arg).then(function (data) {
        if (data.res) {
          let dd = {};
          dd.key = key;
          dd.type = type;
          dd.value = data.res;
          _self.pushValueToView(dd);
        }
      })
    },

    getZSetV(profile, key, type) {
      const _self = this;
      let arg = [];
      arg.push(key);
      arg.push(0);
      arg.push(-1);
      arg.push("WITHSCORES");
      command.parseCmd(profile, 'zrange', arg).then(function (data) {
        if (data.res) {
          let dd = {};
          dd.key = key;
          dd.type = type;
          dd.value = data.res;
          _self.pushValueToView(dd);
        }
      })
    },

    getSetV(profile, key, type) {
      const _self = this;
      let arg = [];
      arg.push(key);
      command.parseCmd(profile, 'smembers', arg).then(function (data) {
        if (data.res) {
          var dd = {};
          dd.key = key;
          dd.type = type;
          dd.value = data.res;
          _self.pushValueToView(dd);
        }
      })
    },

    getStringV(profile, key, type) {
      let arg = [];
      arg.push(key);
      const _self = this;
      command.parseCmd(profile, 'get', arg).then(function (data) {
        if (data.res) {
          var dd = {};
          dd.key = key;
          dd.type = type;
          dd.value = data.res;
          _self.pushValueToView(dd);
        }
      })
    }
  }
}
</script>

<style scoped>

.scroll::-webkit-scrollbar {
  width: 0px;
}

.scroll::-webkit-scrollbar-track {
  background: rgb(239, 239, 239);
  border-radius: 2px;
}

.scroll::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 10px;
}

.scroll::-webkit-scrollbar-thumb:hover {
  background: #333;
}

.scroll::-webkit-scrollbar-corner {
  background: #179a16;
}

.q-tree {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.column, .flex, .row {
  display: flex;
  flex-wrap: unset;
}
.q-tree__children {
  padding-left: 10px;
}

</style>
