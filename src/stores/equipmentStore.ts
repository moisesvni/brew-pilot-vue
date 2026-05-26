import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { equipmentService } from '../services/equipment.service'
import type { EquipmentProfile, CreateEquipmentProfileRequest } from '../types/equipment'
import { useAuthStore } from './authStore'
import { UserPlan } from '../types/auth'

const FREE_EQUIPMENT_LIMIT = 2

export const useEquipmentStore = defineStore('equipment', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const profiles = ref<EquipmentProfile[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  // ── Getters ────────────────────────────────────────────────────────────────
  const globalProfiles = computed(() => profiles.value.filter(p => p.isDefault))
  const userProfiles   = computed(() => profiles.value.filter(p => !p.isDefault))

  const canAddMore = computed(() => {
    const auth = useAuthStore()
    if (auth.isPro) return true
    return userProfiles.value.length < FREE_EQUIPMENT_LIMIT
  })

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      profiles.value = await equipmentService.getAll()
    } catch (e: unknown) {
      error.value = (e as Error)?.message ?? 'Erro ao carregar perfis.'
    } finally {
      loading.value = false
    }
  }

  async function create(data: CreateEquipmentProfileRequest) {
    const created = await equipmentService.create(data)
    profiles.value.push(created)
    return created
  }

  async function update(id: string, data: CreateEquipmentProfileRequest) {
    const updated = await equipmentService.update(id, data)
    const idx = profiles.value.findIndex(p => p.id === id)
    if (idx !== -1) profiles.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await equipmentService.remove(id)
    profiles.value = profiles.value.filter(p => p.id !== id)
  }

  return {
    profiles,
    loading,
    error,
    globalProfiles,
    userProfiles,
    canAddMore,
    fetchAll,
    create,
    update,
    remove,
  }
})
