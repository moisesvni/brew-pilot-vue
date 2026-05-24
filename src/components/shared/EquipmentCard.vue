<template>
  <q-card bordered flat>
    <q-card-section class="q-pb-xs">
      <div class="row items-center">
        <div class="text-subtitle1 text-weight-medium col">{{ profile.name }}</div>
        <q-badge v-if="profile.isDefault" color="blue-grey" label="Padrão" />
        <template v-else-if="!readonly">
          <q-btn flat round dense icon="edit"   size="sm" class="q-ml-xs" @click="$emit('edit')" />
          <q-btn flat round dense icon="delete" size="sm" color="negative" @click="$emit('delete')" />
        </template>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pt-xs">
      <div class="row q-gutter-xs text-body2 text-grey-8">
        <div class="col-6">Batelada: <strong>{{ profile.batchVolume }} L</strong></div>
        <div class="col-6">Pré-fervura: <strong>{{ profile.preBoilVolume }} L</strong></div>
        <div class="col-6">Eficiência: <strong>{{ profile.efficiency }}%</strong></div>
        <div class="col-6">Fervura: <strong>{{ profile.boilTime }} min</strong></div>
        <div class="col-6">Evaporação: <strong>{{ profile.boilOffRate }}%</strong></div>
        <div class="col-6">Ef. mostura: <strong>{{ profile.mashEfficiency }}%</strong></div>
      </div>
      <div v-if="profile.notes" class="text-caption text-grey-6 q-mt-xs">{{ profile.notes }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { EquipmentProfile } from '../../types/equipment.types'

defineProps<{
  profile: EquipmentProfile
  readonly?: boolean
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>
