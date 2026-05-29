<template>
  <div class="column items-center">
    <div class="text-weight-bold text-amber" style="font-size: 1rem; line-height: 1.1">
      {{ value }}{{ unit }}
    </div>
    <div class="text-caption text-grey-5" style="font-size: 0.65rem">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number; unit?: string }>()
</script>
