<template>
  <q-page class="brew-pilot-page" :style-fn="styleFn" v-bind="$attrs">
    <slot />
  </q-page>
</template>

<script setup lang="ts">
function styleFn(_offset: number, height: number) {
  return { minHeight: `${height * 0.85}px` }
}
</script>
