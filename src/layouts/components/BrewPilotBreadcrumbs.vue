<template>
  <div v-if="crumbs.length > 0" class="brew-breadcrumbs q-px-lg q-py-xs row items-center">
    <q-breadcrumbs
      :active-color="$q.dark.isActive ? 'grey-4' : 'brown-7'"
      :separator-color="$q.dark.isActive ? 'grey-7' : 'brown-6'"
      class="text-caption"
    >
      <q-breadcrumbs-el icon="home" to="/" :class="$q.dark.isActive ? 'text-grey-6' : 'text-brown'" />
      <template v-for="(crumb, i) in crumbs" :key="crumb.to">
        <q-breadcrumbs-el
          :label="crumb.title"
          :to="i < crumbs.length - 1 ? crumb.to : undefined"
          :class="i === crumbs.length - 1
            ? ['last-crumb', 'text-weight-medium']
            : ($q.dark.isActive ? 'text-grey-5' : 'text-brown')"
        />
      </template>
    </q-breadcrumbs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
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

.last-crumb {
  /* Uns tons acima do preto → marrom médio (mais claro que primary) */
  color: var(--bp-text-value);
}
</style>
