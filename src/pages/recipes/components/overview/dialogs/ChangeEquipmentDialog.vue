<template>
  <brew-pilot-dialog v-model="open" title="Alterar Equipamento" icon="mdi-swap-horizontal"
    icon-color="grey-5" width="480px">

    <q-card-section>
      <q-list separator >
        <q-item v-for="p in equipStore.profiles" :key="p.id" clickable v-ripple
          :active="recipe.equipmentProfileId === p.id" active-class="text-amber"
          @click="applyEquipment(p.id)">
          <q-item-section avatar>
            <q-icon name="mdi-kettle"
              :color="recipe.equipmentProfileId === p.id ? 'amber' : 'grey-6'" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ p.name }}</q-item-label>
            <q-item-label caption class="text-grey-5">
              {{ p.batchVolume }} L · {{ p.boilTime }} min · {{ p.efficiency }}%
            </q-item-label>
          </q-item-section>
          <q-item-section side v-if="recipe.equipmentProfileId === p.id">
            <q-icon name="mdi-check-circle" color="positive" />
          </q-item-section>
        </q-item>
        <q-item v-if="!equipStore.profiles.length">
          <q-item-section class="text-grey-5 text-caption">
            Nenhum equipamento cadastrado
          </q-item-section>
        </q-item>
      </q-list>
      <q-btn v-if="recipe.equipmentProfileId" flat dense no-caps size="sm" color="grey-6"
        icon="mdi-close-circle-outline" label="Remover equipamento" class="q-mt-sm"
        @click="applyEquipment(null)" />
    </q-card-section>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BrewPilotDialog from '../../../../../components/BrewPilotDialog.vue'
import { useRecipeStore } from '../../../../../stores/recipeStore'
import { useEquipmentStore } from '../../../../../stores/equipmentStore'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const equipStore = useEquipmentStore()

function applyEquipment(id: string | null) {
  recipe.value.equipmentProfileId = id ?? undefined
  const profile = id ? equipStore.profiles.find(p => p.id === id) : null
  recipe.value.equipmentProfile = profile ?? undefined
  if (profile) {
    recipe.value.batchVolume = profile.batchVolume
    recipe.value.preBoilVolume = profile.preBoilVolume
    recipe.value.boilTime = profile.boilTime
    recipe.value.efficiency = profile.efficiency
  }
  open.value = false
}
</script>
