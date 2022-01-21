<template>
  <q-layout view="lHh Lpr lFf">
    <!--<q-header elevated>-->
      <!--<q-toolbar>-->
        <!--<q-btn-->
          <!--flat-->
          <!--dense-->
          <!--round-->
          <!--icon="menu"-->
          <!--aria-label="Menu"-->
          <!--@click="leftDrawerOpen = !leftDrawerOpen"-->
        <!--/>-->

        <!--<q-toolbar-title>-->
          <!--Quasar App-->
        <!--</q-toolbar-title>-->

        <!--<div>Quasar v{{ $q.version }}</div>-->
      <!--</q-toolbar>-->
    <!--</q-header>-->

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="80"
      :breakpoint="10"
      :content-style="{overflowY:'hidden',overflowX:'hidden'}"
      border
      elevated
      content-class="bg-side"
    >
      <q-list>
        <!--<q-item-label-->
          <!--header-->
          <!--class="text-grey-8"-->
        <!--&gt;-->
          <!--Essential Links-->
        <!--</q-item-label>-->
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

const linksData = [
  {
    title: '连接列表',
    caption: '@QuasarFramework',
    icon: 'list',
    link: '/connectionList'
  },
  {
    title: '终端',
    caption: '终端',
    icon: 'img:static/terminal.svg',
    link: '/terminal'
  },

  {
    title: '设置',
    caption: '@quasarframework',
    icon: 'settings',
    link: '/config'
  },

  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: '/qa'
  }
];

export default {
  name: 'MainLayout',
  components: { EssentialLink },
  data () {
    return {
      leftDrawerOpen: false,
      essentialLinks: linksData
    }
  }
}
</script>
<style>
  .bg-side {
    background: #218868 !important;
  }
</style>
