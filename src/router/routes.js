
let store = require('../js/store.js').Store();
const uiConfig = store.get("uiConfig");
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    redirect: '/connectionList',
    children: [
      {
        path: '/connectionList', meta: {
          keepAlive: true
        },component: () => import('pages/Index.vue')
      },
      {
        path: '/terminal',meta: {
          keepAlive: true
        },
         component: () => import('pages/Terminal.vue')
      },
      {
        path: '/config',meta: {
          keepAlive: true
        }, component: () => import('pages/Config.vue')
      },
      {
        path: '/qa',meta: {
          keepAlive: true
        }, component: () => import('pages/QA.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]
if(uiConfig.view=="terminal"){
  routes[0].redirect="/terminal"
}

export default routes
