<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-select
        filled
        v-model="model"
        multiple
        :options="options"
        counter
        hint="With counter"
        style="width: 250px"
      />
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      model: null,
      model2: null,

      options: [
        'Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'
      ]
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
</style>
