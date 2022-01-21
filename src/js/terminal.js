const redisCommand = require('./redis-command.js')
const fs=require("fs");
const path=require("path");

const s = require('./store.js');
const Redis = require('ioredis');
window.$ = window.jQuery = require("./jquery.min.js");
require("./jquery.json-viewer.js");
var currentProfile = null;
var Terminal = Terminal || function (cmdLineContainer, outputContainer,
    currentTab) {
  window.URL = window.URL || window.webkitURL;
  window.requestFileSystem = window.requestFileSystem
      || window.webkitRequestFileSystem;

  var cmdLine_ = document.querySelector(cmdLineContainer);
  var output_ = document.querySelector(outputContainer);
  var history_ = [];
  var histpos_ = 0;
  var histtemp_ = 0;
  var command = redisCommand.RedisCommand();
  const CMDS_DESC = command.CMDS_DESC;
  let cammadSort =CMDS_DESC.slice(0);
  cammadSort.sort(function (a,b) {
    return a.split(" ")[0].length - b.split(" ")[0].length
  });
  var currentTab = currentTab;

  let timer = null;
  $(".q-scrollarea").bind('mousedown',function (e) {
    if(e.target&&e.target.tagName=='A'){
      return;
    }
    let y=e.pageY;
    let x=e.pageX;
    $(".q-scrollarea").on('mouseup', function(evt) {
      let y2=evt.pageY;
      let x2=evt.pageX;
      if (evt.type === 'mouseup'&& x2==x&&y2==y) {
        clearTimeout(timer);
        timer = setTimeout(function() { //在单击事件中添加一个setTimeout()函数，设置单击事件触发的时间间隔
          $('#input-line' + currentTab + ' .cmdline').focus();
        }, 200);
      } else {
        // drag
      }
    });
  });
  $(".q-scrollarea").bind('dblclick',function () {
    clearTimeout(timer);
  });

  cmdLine_.addEventListener('keyup', historyHandler_, false);
  cmdLine_.addEventListener('keydown', processNewCommand_, false);

  function historyHandler_(e) {
    if (history_.length) {
      if (e.keyCode == 38 || e.keyCode == 40) {
        if (history_[histpos_]) {
          history_[histpos_] = this.value;
        } else {
          histtemp_ = this.value;
        }
      }

      if (e.keyCode == 38) { // up
        histpos_--;
        if (histpos_ < 0) {
          histpos_ = 0;
        }
      } else if (e.keyCode == 40) { // down
        histpos_++;
        if (histpos_ > history_.length) {
          histpos_ = history_.length;
        }
      }

      if (e.keyCode == 38 || e.keyCode == 40) {
        var temp = history_[histpos_] ? history_[histpos_] : histtemp_;
        $(this).val(temp);
      }
    }
  }

  function find(str, cha, num) {
    var x = str.indexOf(cha);
    for (var i = 0; i < num; i++) {
      x = str.indexOf(cha, x + 1);
    }
    return x;
  }

  function getCmdDesc(cmd) {
    var commandArr = cmd.split(" ");
    var newCommandArr = [];
    for (var k = 0; k < commandArr.length; k++) {
      if (commandArr[k].trim() != "") {
        newCommandArr.push(commandArr[k]);
      }
    }
    var spaceCount = newCommandArr.length;
    for (var i = 0; i < CMDS_DESC.length; i++) {
      if (CMDS_DESC[i].indexOf(commandArr[0]) == 0) {
        var index = find(CMDS_DESC[i], " ", spaceCount - 1);
        if (index >= 0) {
          return CMDS_DESC[i].substr(index);
        }

      }
    }
    return null;
  }

  //
  function buildSpace(count) {
    var spaces = "";
    for (var i = 0; i < count; i++) {
      spaces = spaces + "&nbsp;";
    }
    return spaces;
  }

  function tabEvent() {

    var input = $("#input-line" + currentTab + " .cmdline").val();
   // var count = 0;
    var temp = null;
    if (input && input != '') {
      if (input.indexOf('use ') == 0 || input.indexOf('show ') == 0) {
        var arr = input.split(' ');
        var command = arr[0];
        var content = arr[1];
        if (content.trim() != "") {
          var showContent = [];
          if (command == 'show') {
            showContent = ['cons', 'dbs', 'commands'];
          } else if (command == 'use') {
            showContent = findConsNames();
          }
          for (var i = 0; i < showContent.length; i++) {
            if (showContent[i].indexOf(content) == 0) {
              //count++;
              temp = command + " " + showContent[i];
              $("#input-line" + currentTab + " .cmdline").val(temp);
              return;
            }
          }
        }
      } else {
        for (var i = 0; i < cammadSort.length; i++) {
          var command = cammadSort[i].split(' ')[0];
          if (command.indexOf(input) == 0) {
            //count++;
            temp = command;
            $("#input-line" + currentTab + " .cmdline").val(temp);
            return;
          }
        }
      }
      // if (count == 1) {
      //   $("#input-line" + currentTab + " .cmdline").val(temp);
      // }
    }
  }

  function processNewCommand_(e) {

    if (e.keyCode == 9) { // tab
      e.preventDefault();
      tabEvent();
      // Implement tab suggest.
    } else if (e.ctrlKey && e.keyCode == 67) {
      //doSomething();
      // 返回false, 防止重复触发copy事件
      var title = $('#input-line' + currentTab + ' .termPrompt').html().replace(
        "&gt;", "");
      command.getRedis().delete(title);
      updateTabName(currentTab,"Terminal-"+currentTab);
      $('#searching' + currentTab).remove();
      $('#input-line' + currentTab + ' .termPrompt').html(
          'use command "help" to show usage> ');
    } else if (e.keyCode == 32) {//space
      if ($("#input-line" + currentTab + " .cmdline").val().trim() != "") {
        var input = $("#input-line" + currentTab + " .cmdline").val() + " ";
        var cmdDesc = getCmdDesc(input.toLowerCase());
        if (cmdDesc != null) {
          $('#input-line' + currentTab + ' .pbg:last').html(input);
          $('#input-line' + currentTab + ' .placeholder:last').html(cmdDesc);
        } else {
          $('#input-line' + currentTab + ' .placeholder:last').html("");
        }
      }
    } else if (e.keyCode == 13) { // enter
     // $('#searching' + currentTab).removeAttr("id");
      // Save shell history.
      if (this.value) {
        history_[history_.length] = this.value;
        histpos_ = history_.length;
      }

      // Duplicate current input and append to output section.
      var line = this.parentNode.parentNode.cloneNode(true);
      line.removeAttribute('id')
      line.classList.add('line');
      var input = line.querySelector('input.cmdline');
      input.autofocus = false;
      input.readOnly = true;
      $('#input-line' + currentTab).hide();
      output_.appendChild(line);

      if (this.value && this.value.trim()) {
        var args = this.value.split(' ').filter(function (val, i) {
          return val;
        });
        var cmd = args[0].toLowerCase();

        args = args.splice(1); // Remove cmd from arg list.
        if(cmd=="eval") {
          let tempScript = "";
          while (args[0].startsWith("\"") || args[0].startsWith("'") || args[0].endsWith("\"") || args[0].endsWith("'")) {
            tempScript =tempScript+ args[0] + " ";
            args = args.splice(1);
          }
          args.unshift(tempScript.trim())
        }else if(cmd=="script" && (args[0] =="load"||args[0] =="LOAD")){
          const argss=[];
          argss.push(args[0])
          const script = this.value.split(args[0])[1].trim();
          argss.push(script.substring(1,script.length-1));
          args = argss;
        }
        if (cmd.indexOf("keys") == 0 && args.length == 1 && args[0] !="-h") {
          //限制每个节点的查询数上限，-1表示不够限制
          args.push(command.defaultKeysSize);
          // if(args[0].replace(/\*/g,"")==""){
          //   args.push(command.defaultKeysSize);
          // }else{
          //   args.push(-1);
          // }
        }
      } else {
        showLine();
      }
      $('#input-line' + currentTab + ' .placeholder:last').html("");
      if (cmd == 'help') {
        help();
        showLine();
      } else if(args!=null && args.length>0&&args[args.length-1]=="-h"){
        //dev ../../public/static/command/
        let htmlPath = path.join(__dirname,"/static/command/"+cmd+".html");
        if(!process.env.PROD){
          htmlPath = path.join(__dirname,"../../public/static/command/"+cmd+".html");
        }
        fs.exists(htmlPath, function (exists) {
          if(exists){
            fs.readFile(htmlPath,function (err,data) {
              if(err){
                output("no document with command:"+cmd,false);
                showLine();
              }else{
                output(data.toString(),false);
                showLine();
              }
            })
          }else{
            output("no document with command:"+cmd,false);
            showLine();
          }

        })

      }
      else if (this.value && this.value.trim() != "") {

        if (cmd == 'use') {
          output_.insertAdjacentHTML('beforeEnd',
              '<p id="searching' + currentTab + '">connecting......</p>');
        } else {
          output_.insertAdjacentHTML('beforeEnd',
              '<p id="searching' + currentTab + '">' + cmd + '......</p>');
        }
        var title = $('#input-line' + currentTab + ' .termPrompt').html().replace(
            "&gt;", "");
        if (title.indexOf('use command') != 0) {
          if (cmd == "select") {
            currentProfile = title.split(":")[0];
          } else {
            currentProfile = title;
          }

        }else{
          if (cmd == "select") {
            dealWithRedisCallback({err: "please connect first!", res: null}, cmd);
            showLine();
            this.value = ''; // Clear/setup line for next input.
            $('#input-line' + currentTab + ' .placeholder').html("");
            return;
          }
        }
        command.parseCmd(currentProfile, cmd, args).then(function (data) {
          dealWithRedisCallback(data, cmd);
          showLine();
          $('#input-line' + currentTab + ' .cmdline').focus();
        });
      }
      this.value = ''; // Clear/setup line for next input.
      $('#input-line' + currentTab + ' .placeholder').html("");
    } else {
      $('#input-line' + currentTab + ' .placeholder:last').html("");
    }
  }

  function showLine() {
    $('#input-line' + currentTab).show();
    $('#input-line' + currentTab + ' .cmdline').focus();
    $(".scroll").scrollTop(
        $(".scroll")[0].scrollHeight + 1000000000);
  }

  function help() {
    var html = "show cons ----show existing connections<br>" +
        "use ${con} ----use a connection<br>" +
        "show commands ----show supported commands<br>" +
        "command -h ---Display command document<br>"+
        "clear ---to clear output in terminal<br>" +
        "ctrl+c ---quit the current terminal connection<br>";
    output(html);

  }

  function dealWithRedisCallback(data, cmd) {
    if (data.err && data.err.message) {
      output(data.err.message);
      return;
    }
    if (data.err) {
      output(data.err);
    } else {
      if (data.res && data.res === data.res + "" && data.res == "commands") {
        showCommands();
      } else if (data.res && data.res === data.res + "" && data.res == "cons") {
        showConnections();
      } else if (data.res && data.res === data.res + "" && data.res.indexOf(
          "use:") == 0) {
        useConnection(data.res.split(':')[1], 0);
      } else if (data.res && data.res === data.res + "" && data.res
          == "clear") {
        $('#container' + currentTab + ' output').empty();
      } else if (data.res && data.res === data.res + "" && data.res == "dbs") {
        showDbs();
      } else if (data.res && data.res === data.res + "" && data.res.indexOf(
          "select:") == 0) {
        useDb(data.res.split(':')[1]);
      } else if (data.res && Array.isArray(data.res)) {
        var newArr = data.res;
        if (newArr.length <= 100 && cmd != "keysv") {
         // newArr = newArr.sort()
          var outputShow = ""
          for (var i = 0; i < newArr.length; i++) {
            var j = i + 1;
            if ($.isPlainObject(newArr[i]) | Array.isArray(newArr[i])) {
              outputShow = outputShow + j + ") " + JSON.stringify(newArr[i])
                  + "<br>";
            } else {
              outputShow = outputShow + j + ") " + newArr[i] + "<br>";
            }

          }
         // output("<p class=\"pSize\">size:" + newArr.length + "</p>", true);
          output(outputShow);
          return;
        }
        $('#searching' + currentTab).remove();
        output("<p class=\"pSize\">size:" + newArr.length + "</p>", true);
        outputJson(newArr);
      } else if ($.isPlainObject(data.res)) {
        outputJson(data.res);
      } else {
        output(data.res);
      }

    }
  }

  function getUuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
  }

  function outputJson(dd) {
    $('#searching' + currentTab).remove();
    var uuid = getUuid();
    output_.insertAdjacentHTML('beforeEnd', '<p id=' + uuid + '></p>');
    $('#' + uuid).jsonViewer(dd,
        {collapsed: false, withQuotes: true, withLinks: false});
    //window.scrollTo(0, getDocHeight_());
    $("#container" + currentTab).scrollTop(
        $("#container" + currentTab)[0].scrollHeight + 32);
  }

  function useDb(db) {
    if (db >= 0 && db <= 50) {
      useConnection(currentProfile, db);
    } else {
      output("illegal db!");
    }

  }

  function showDbs() {
    if (currentProfile == null) {
      output("please connect first!");
    } else {
      var config = s.Store().get("config");
      var useCon = null;
      if (command.getRedis() && command.getRedis().get(currentProfile)
          != null) {
        useCon = command.getRedis().get(currentProfile).redis.options
      }
      for (var i = 0; i < config.length; i++) {
        if (config[i].profile == currentProfile) {
          useCon = config[i].connection;
          break;
        }
      }

      if (useCon != null && Array.isArray(useCon)) {
        output("0");
      } else if (useCon != null && !Array.isArray(useCon)) {
        command.parseCmd(currentProfile, 'config', ['get', 'databases']).then(
            function (data) {
              var dbCount = parseInt(data.res[1]);
              var dbs = "";
              for (var i = 0; i < dbCount; i++) {
                dbs = dbs + i + "<br>"
              }
              output(dbs);
            });

      }
    }
  }

  function findConsNames() {
    var consName = [];
    var config = s.Store().get("config");
    if (config != null) {
      for (var i = 0; i < config.length; i++) {
        consName.push(config[i].profile);
      }
    }

    return consName;
  }

  function setTabTitle(title) {
    var tab = $('#tabs').tabs('getSelected');  // get selected panel
    tab.panel('setTitle', 'title');
  }

  function useConnection(profile, db) {
    var config = s.Store().get("config");
    var useCon = null;
    for (var i = 0; i < config.length; i++) {
      if (config[i].profile == profile) {
        useCon = config[i].connection;
        break;
      }
    }
    if (useCon != null && Array.isArray(useCon)) {
      const cluserOption = {
        clusterRetryStrategy: function (times) {
          var delay = Math.min(times * 50, 2000);
          return delay;
        }
      };
      const cluserOptionTest = {
        clusterRetryStrategy: function (times) {
          return "no";
        }
      };
      const clusterTest = new Redis.Cluster(useCon, cluserOptionTest);
      clusterTest.get("custom:key:test", function (err, res) {
        if (err == null) {
          clusterTest.disconnect();
          const cluster = new Redis.Cluster(useCon, cluserOption);
          var instance = {};
          instance.redis = cluster;
          instance.isCluster = true;
          redisCommand.RedisCommand().init(profile, instance);
          $('#searching' + currentTab).html(profile + " connect successfully!");
          $('#input-line' + currentTab + ' .termPrompt').html(profile + '>');
          $('#searching' + currentTab).removeAttr("id");

          //setTabTitle(profile);
          updateTabName(currentTab,profile);
          currentProfile = profile;
          redisCommand.RedisCommand().resetSlotMap();

        } else {
          output(err);
        }
      });
    } else if (useCon != null && !Array.isArray(useCon)&&useCon.sentinels==null) {
      var con = {
        port: useCon.port, // Redis port
        host: useCon.host, // Redis host
        password: useCon.password,
        db: db,
        retryStrategy: function (times) {
          return 'no';
        }
      }
      var redisTest = new Redis(con);
      redisTest.get("custom:key:test", function (err, res) {
        if (err == null) {
          redisTest.disconnect();
          useCon.db = db;
          const redis = new Redis(useCon);
          var instance = {};
          instance.redis = redis;
          instance.isCluster = false;
          redisCommand.RedisCommand().init(profile + ":" + db, instance);
          $('#searching' + currentTab).html(
              profile + ":" + db + " connect successfully!");
          $('#input-line' + currentTab + ' .termPrompt').html(
              profile + ':' + useCon.db + '>');
          $('#searching' + currentTab).removeAttr("id");
          currentProfile = profile + ":" + db;
          //setTabTitle(profile);
          updateTabName(currentTab,profile);
        } else {
          output(err);
        }

      });
    } else if(useCon != null && !Array.isArray(useCon)&&useCon.sentinels!=null){
      const testCon = {
        sentinels: useCon.sentinels,
        name: useCon.name,
        db:0,
        sentinelPassword:useCon.sentinelPassword,
        retryStrategy: function (times) {
          return 'no';
        }
      }
      let redisTest = new Redis(testCon);
      return new Promise(function (resolve, reject) {
        redisTest.get("custom:key:test:connection", function (err, res) {
          if (err == null) {
            redisTest.disconnect();
            useCon.db = db;
            const redis = new Redis(useCon);
            var instance = {};
            instance.redis = redis;
            instance.isCluster = false;
            redisCommand.RedisCommand().init(profile + ":" + db, instance);
            $('#searching' + currentTab).html(
              profile + ":" + db + " connect successfully!");
            $('#input-line' + currentTab + ' .termPrompt').html(
              profile + ':' + useCon.db + '>');
            $('#searching' + currentTab).removeAttr("id");
            currentProfile = profile + ":" + db;
            //setTabTitle(profile);
            updateTabName(currentTab,profile);
          } else {
            output(err);
          }
        });
      });
    }else{
      output('not exist connection:' + profile);
    }

  }

  function showCommands() {
    var commands = "";
    for (var i = 0; i < CMDS_DESC.length; i++) {
      var j = i + 1;
      commands = commands + j + ") " + CMDS_DESC[i] + "<br>"
    }
    output(commands);
  }

  function showConnections() {
    try{
    var config = s.Store().get("config");
    var cons = "";
    for (var i = 0; i < config.length; i++) {
      cons = cons + config[i].profile + "<br>"
    }
    output(cons);
    }catch (e) {
      output("please configure the connection!")
    }
  }

  //
  function formatColumns_(entries) {
    var maxName = entries[0].name;
    util.toArray(entries).forEach(function (entry, i) {
      if (entry.name.length > maxName.length) {
        maxName = entry.name;
      }
    });

    var height = entries.length <= 3 ?
        'height: ' + (entries.length * 15) + 'px;' : '';

    // 12px monospace font yields ~7px screen width.
    var colWidth = maxName.length * 7;

    return ['<div class="ls-files" style="-webkit-column-width:',
      colWidth, 'px;', height, '">'];
  }

  //
  function output(html, noNeedp) {
    $('#searching' + currentTab).remove();
    if (noNeedp) {
      output_.insertAdjacentHTML('beforeEnd', html);
    } else {
      output_.insertAdjacentHTML('beforeEnd', '<p>' + html + '</p>');
    }

    //window.scrollTo(0, getDocHeight_());
    $("#container" + currentTab).scrollTop(
        $("#container" + currentTab)[0].scrollHeight + 32);
  }

  // Cross-browser impl to get document's height.
  function getDocHeight_() {
    var d = document;
    return Math.max(
        Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
        Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
        Math.max(d.body.clientHeight, d.documentElement.clientHeight)
    );
  }

  function syntaxHighlight(json) {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
    var str = json.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
          var cls = 'number';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key';
            } else {
              cls = 'string';
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean';
          } else if (/null/.test(match)) {
            cls = 'null';
          }
          return '<span class="' + cls + '">' + match + '</span>';
        });
    return '<pre>' + str + '</pre>';

  }

  //
  return {
    init: function () {
      output(
          '<img align="left" src="http://www.w3.org/html/logo/downloads/HTML5_Badge_128.png" width="100" height="100" style="padding: 0px 10px 20px 0px"><h2 style="letter-spacing: 4px">HTML5 Web Terminal</h2><p>'
          + new Date() + '</p><p>Enter "help" for more information.</p>');
    },
    output: output,
    setCurrentTab: function (currentTasb) {
      currentTab = currentTab;
    },
    syntaxHighlight: function (json) {
      return syntaxHighlight(json);
    }
  }
};
module.exports = {
  Terminal: Terminal
}
