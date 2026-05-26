<template>
  <div v-if="crumbs.length > 0" class="brew-breadcrumbs q-px-lg q-py-xs row items-center">
    <q-breadcrumbs active-color="grey-4" separator-color="grey-7" class="text-caption">
      <q-breadcrumbs-el icon="home" to="/" class="text-grey-6" />
      <template v-for="(crumb, i) in crumbs" :key="crumb.to">
        <q-breadcrumbs-el
          :label="crumb.title"
          :to="i < crumbs.length - 1 ? crumb.to : undefined"
          :class="i === crumbs.length - 1 ? 'last-crumb text-weight-medium' : 'text-grey-5'"
        />
      </template>
    </q-breadcrumbs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const crumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  const result: Array<{ title: string; to: string }> = []

  for (let i = 0; i < parts.length; i++) {
    const path = '/' + parts.slice(0, i + 1).join('/')
    const resolved = router.resolve(path)
    const title = resolved.meta?.title as string | undefined
    if (title) {
      result.push({ title, to: path })
    }
  }

  return result
})
</script>

<style scoped>
.brew-breadcrumbs {
  background: transparent;
  min-height: 36px;
  border-bottom: 1px solid var(--bp-border, rgba(255,255,255,0.05));
}

/* Último item do breadcrumb — claro no dark, escuro no light */
.last-crumb {
  color: rgba(255, 255, 255, 0.92);
}

:global(body.body--light) .last-crumb {
  color: rgba(0, 0, 0, 0.82) !important;
}

:global(body.body--light) .text-grey-5 {
  color: rgba(0, 0, 0, 0.45) !important;
}
</style>
