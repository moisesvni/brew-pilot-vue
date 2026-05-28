<template>
  <brew-pilot-dialog
    v-model="open"
    title="Editar Fermentável"
    icon="mdi-barley"
    icon-color="primary"
    width="620px"
    scrollable
  >
    <template #header-actions>
      <q-btn v-if="item?.ingredientId" flat round dense size="sm"
        icon="mdi-database-sync-outline" color="grey-5">
        <q-tooltip>Atualizar da base de ingredientes</q-tooltip>
      </q-btn>
    </template>

    <q-card-section class="q-pt-md q-pb-sm q-px-md">
      <fermentable-form-content :key="contentKey" ref="formRef" :item="item" />
    </q-card-section>

    <template #footer>
      <q-card-actions class="q-px-md q-py-sm row items-center">
        <brew-pilot-button variant="flat" no-caps icon="mdi-delete-outline" label="Remover"
          style="color: var(--q-negative) !important" @click="remove" />
        <q-space />
        <brew-pilot-button variant="outline" no-caps label="Cancelar" @click="open = false" />
        <brew-pilot-button variant="filled" no-caps color="primary" icon="mdi-check"
          label="Salvar" class="q-ml-sm" @click="save" />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecipeFermentable } from '@/types/recipe'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import BrewPilotButton from '@/components/shared/BrewPilotButton.vue'
import FermentableFormContent from './FermentableFormContent.vue'

const props = defineProps<{
  modelValue: boolean
  item?: RecipeFermentable | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', item: RecipeFermentable): void
  (e: 'remove', id: string): void
}>()

const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})

const formRef = ref<InstanceType<typeof FermentableFormContent> | null>(null)
const contentKey = ref(0)

// Força re-mount do content a cada abertura (item fresco)
watch(() => props.modelValue, v => { if (v) contentKey.value++ })

function save() {
  const item = formRef.value?.editItem
  if (!item) return
  emit('save', { ...item })
  open.value = false
}

function remove() {
  if (!props.item) return
  emit('remove', props.item.id)
  open.value = false
}
</script>
