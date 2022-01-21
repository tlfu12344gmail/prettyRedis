<template>
  <q-item
    clickable
    tag="a"
    @click="$router.push({ path:link}).catch(err => {err})"

  >
    <q-item-section
      v-if="icon"
      avatar
      style="padding: 35px 0;"
      align="center"
    >
      <q-icon :name="icon" />
    </q-item-section>

    <!--<q-item-section>-->
      <!--<q-item-label>{{ title }}</q-item-label>-->
      <!--<q-item-label caption>-->
        <!--{{ caption }}-->
      <!--</q-item-label>-->
    <!--</q-item-section>-->
  </q-item>
</template>

<script>
export default {
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    }
  }
}
</script>
