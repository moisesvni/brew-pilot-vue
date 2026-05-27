<template>
  <brew-pilot-dialog
    v-model="open"
    title="Editar Fermentável"
    icon="mdi-barley"
    icon-color="primary"
    width="440px"
  >
    <q-card-section v-if="editItem" class="q-gutter-sm">
      <div class="row q-col-gutter-sm">
        <div class="col-12">
          <q-input v-model="editItem.name" outlined dense  label="Nome" />
        </div>
        <div class="col-12 col-sm-6">
          <q-input v-model="editItem.supplier" outlined dense  label="Fornecedor (opcional)" />
        </div>
        <div class="col-12 col-sm-6">
          <q-select v-model="editItem.type" :options="typeOptions" emit-value map-options
            outlined dense  label="Tipo" />
        </div>
        <div class="col-6 col-sm-4">
          <q-input v-model.number="editItem.amount" type="number" step="0.01"
            outlined dense  label="Quantidade" suffix="kg" />
        </div>
        <div class="col-6 col-sm-4">
          <q-input v-model.number="editItem.colorEbc" type="number"
            outlined dense  label="Cor" suffix="EBC" />
        </div>
        <div class="col-6 col-sm-4">
          <q-input v-model.number="editItem.potential" type="number" step="0.1"
            outlined dense  label="PPG" />
        </div>
        <div class="col-6 col-sm-6">
          <q-input v-model.number="editItem.yieldPercentage" type="number" step="0.1"
            outlined dense  label="Rendimento" suffix="%" />
        </div>
        <div class="col-6 col-sm-6">
          <q-select v-model="editItem.use" :options="useOptions" emit-value map-options
            outlined dense  label="Uso" />
        </div>
      </div>
    </q-card-section>

    <template #footer>
      <q-card-actions class="q-px-md q-pb-md">
        <q-btn flat no-caps label="Remover" color="negative" @click="remove" />
        <q-space />
        <q-btn flat no-caps label="Cancelar" color="grey-5" @click="open = false" />
        <q-btn unelevated no-caps label="Salvar" color="positive" @click="save" />
      </q-card-actions>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { RecipeFermentable } from '../../../../../types/recipe'
import BrewPilotDialog from '../../../../../components/BrewPilotDialog.vue'

const props = defineProps<{
  modelValue: boolean
  item: RecipeFermentable | null
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

const editItem = ref<RecipeFermentable | null>(null)

watch(() => props.item, item => {
  if (item) editItem.value = { ...item }
}, { immediate: true })

function save() {
  if (!editItem.value) return
  emit('save', { ...editItem.value })
  open.value = false
}

function remove() {
  if (!editItem.value) return
  emit('remove', editItem.value.id)
  open.value = false
}

const typeOptions = [
  { label: 'Grão', value: 'Grain' },
  { label: 'Açúcar', value: 'Sugar' },
  { label: 'Extrato Seco', value: 'DryExtract' },
  { label: 'Extrato Líquido', value: 'LiquidExtract' },
  { label: 'Mel', value: 'Honey' },
  { label: 'Suco', value: 'Juice' },
  { label: 'Adjunto', value: 'Adjunct' }
]

const useOptions = [
  { label: 'Mostura', value: 'Mash' },
  { label: 'Maceração', value: 'Steep' },
  { label: 'Fervura', value: 'Boil' },
  { label: 'Adição Tardia', value: 'LateAddition' }
]
</script>
