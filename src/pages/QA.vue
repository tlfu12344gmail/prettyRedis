<template>
  <div>
  <h1 style="color: #8e6767;text-align: center">prettyRedis Q&A</h1>
  <div class="q-pa-md row justify-center">
    <div style="width: 100%;">
      <!--<q-chat-message-->
        <!--name="Q:"-->
        <!--avatar="static/key.png"-->
        <!--:text="['hey, how are you?']"-->
        <!--sent-->
      <!--/>-->
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>我平常工作都用的是mac,这个应用支持mac嘛？</div>']"
        bg-color="red"

      />

      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>prettyRedis是跨平台的，支持mac,window,linux.</div>']"
        bg-color="green"
        text-size="18"
        sent
      />

      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>prettyRedis的Terminal和别的工具对比有什么优势嘛？</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>prettyRedis的Terminal有很多特别之处。<br>1. 支持多tab切换。<br>2. 同一个tab中可以在不同环境随时切换。' +
         '<br>3. 除了支持常用的redis命令外，还自定义了keysc,keysv命令，另外用scan重写了keys命令，以防止服务端读数据堵塞。<br>' +
          '4. 命令tab自动补全，动态提示命令参数，同时提供命令相关文档。<br>' +
           '5. 支持根据pattern批量删除。<br>' +
            '6. 在查询结果中，可以根据关键字再次查询。<br>' +
             '7. 自定义keysv命令可以根据pattern把相关的value一起查出来，相当于导出功能。</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>没有完全明白，能举个例子嘛？</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<img src=\'static/qa/1.png\'style=\'width: 100%\' />']"
        bg-color="green"
        sent
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<img src=\'static/qa/2.png\'style=\'width: 100%\' />']"
        bg-color="green"
        sent
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<img src=\'static/qa/3.png\'style=\'width: 100%\' />']"
        bg-color="green"
        sent
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<img src=\'static/qa/4.png\'style=\'width: 100%\' />']"
        bg-color="green"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>看不去不错呀，del pattern 在工作中很常用，<br>另外那个keysv查询出结果后，搜索框怎么调出来的呢？</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>ctrl+f或者command+f</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>我之前的非集群用redis-cli，可是服务器用了集群后，<br>' +
         'keys只能查询到当前节点的key了，<br>另外批量删除指定的key还会报错：<br>CROSSSLOT Keys in request don\'t hash to the same slot</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>您说的没错，prettyRedis很好的解决这样的问题。<br>无论是单机，哨兵，还是集群，' +
         'keys和del命令都可以正常用呢，<br>另外对于del不仅仅支持原生的指定多key删除，还扩展出根据pattern删除。</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>这个支持所有的redis命令嘛？</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>常用的redis命令都支持，可以用show commands命令查看支持的命令，<br>另外也支持lua表达试，理论上用lua可以支持任何命令。</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>好的，了解了。terminal基本可以满足我需求了？另外有时候我会忘记key，<br>偶尔会用到UI视图,UI视图中支持多连接，key支持分组显示嘛？</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>都是支持的呢。另外查询也做了优化，不用过多的操作，' +
         '<br>直接在输入框输入然后enter，查询的节点会根据用户的实时操作动态变化。<br>默认分组分割符是:，同时也做了排序。方便快速定位相关key。我直接上图看的直观些哈</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<img src=\'static/qa/21.png\'style=\'width: 100%\' />']"
        bg-color="green"
        sent
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<img src=\'static/qa/22.png\'style=\'width: 100%\' />']"
        bg-color="green"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>明白了，这样找key确实方便些。<br>这样加载key多的时候会不会很卡呀？</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>局域网实测下来百万key的加载2秒以内，<br>速度取决服务器和客户端机器性能，应用本身不会卡的。<br>' +
         '</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>我用了其它一些，要么没分组，要么分组key多会卡，<br>这个是怎么实现不卡的呢？</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>懒加载和虚拟列表技术，只展示给用户需要的。<br>另外大多数情况下也不用载那么多key，<br>可以根据自己的场景动态调整加载key的数量' +
         '</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>怎么配置的呢？</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<img src=\'static/qa/31.png\'style=\'width: 100%\' />']"
        bg-color="green"
        sent
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>在设置里有一些常用的配置，根据需要修改</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>了解，view视图中支持key的各种操作嘛</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>目前仅支持查看，后续版本会加相应的功能。</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>嗯，后面版本更新我从哪里下载呢。</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<div style=\'font-size: 20px\'>有新版本时，应用会有提示。<br>另外可关注官网：https://www.fullmile.tech <br>' +
         '</div>']"
        bg-color="green"
        text-size="18"
        sent
      />
      <q-chat-message
        avatar="static/q.svg"
        :text="['<div style=\'font-size: 20px\'>好的，我速度去下个过来体验下看看了！！！</div>']"
        bg-color="red"
      />
      <q-chat-message
        avatar="static/a.svg"
        :text="['<img src=\'static/qa/hd.png\'style=\'width: 100%\' />']"
        bg-color="green"
        sent
      />
    </div>


  </div>
  </div>
</template>

<script>
    export default {
        name: "QA"
    }
</script>

<style scoped>

</style>
