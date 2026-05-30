import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mashProfileService } from '@/services/mashProfile.service'
import type { MashProfile } from '@/types/mash'
import { useAuthStore } from './authStore'
import { UserPlan } from '@/types/auth'

const FREE_MASH_LIMIT = 3

export const useMashProfileStore = defineStore('mashProfile', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const profiles = ref<MashProfile[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  // ── Getters ────────────────────────────────────────────────────────────────
  const defaultProfiles = computed(() => profiles.value.filter(p => p.isDefault))
  const userProfiles    = computed(() => profiles.value.filter(p => !p.isDefault))

  const canAddMore = computed(() => {
    const auth = useAuthStore()
    if (auth.isPro) return true
    return profiles.value.length < FREE_MASH_LIMIT
  })

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      profiles.value = await mashProfileService.getAll()
    } catch (e: unknown) {
      // 404 significa que o endpoint ainda não existe no backend — tratar como lista vazia
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 404) {
        profiles.value = []
      } else {
        error.value = (e as Error)?.message ?? 'Erro ao carregar perfis de mostura.'
      }
    } finally {
      loading.value = false
    }
  }

  async function create(data: Omit<MashProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    const created = await mashProfileService.create(data)
    profiles.value.push(created)
    return created
  }

  async function update(id: string, data: Omit<MashProfile, 'id' | 'createdAt' | 'updatedAt'>) {
    const updated = await mashProfileService.update(id, data)
    const idx = profiles.value.findIndex(p => p.id === id)
    if (idx !== -1) profiles.value[idx] = updated
    return updated
  }

  async function remove(id: string) {
    await mashProfileService.remove(id)
    profiles.value = profiles.value.filter(p => p.id !== id)
  }

  return {
    profiles,
    loading,
    error,
    defaultProfiles,
    userProfiles,
    canAddMore,
    fetchAll,
    create,
    update,
    remove,
  }
})
