import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { equipmentService } from '@/services/equipment.service'
import type { EquipmentProfile, CreateEquipmentProfileRequest } from '@/types/equipment'
import { useAuthStore } from './authStore'
import { UserPlan } from '@/types/auth'

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

  // ── Exportar / Importar (requer plano Plus+) ───────────────────────────
  function exportProfile(profile: EquipmentProfile): void {
    const exportData = {
      _version: 1,
      _exportedAt: new Date().toISOString(),
      _app: 'BrewPilot',
      profile: {
        ...profile,
        id: undefined,
        userId: undefined,
        isDefault: false,
      },
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${profile.name.replace(/[^a-z0-9]/gi, '_')}_equipment.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importProfile(file: File): Promise<EquipmentProfile> {
    const text = await file.text()
    const data = JSON.parse(text)

    // Suporta importar com ou sem wrapper _version
    const raw: Partial<EquipmentProfile> = data.profile ?? data

    if (!raw.name || !raw.batchVolume) {
      throw new Error('Arquivo inválido: campos obrigatórios ausentes (name, batchVolume).')
    }

    const payload: CreateEquipmentProfileRequest = {
      name:             raw.name,
      setupType:        raw.setupType,
      batchVolume:      raw.batchVolume,
      preBoilVolume:    raw.preBoilVolume ?? raw.batchVolume,
      boilTime:         raw.boilTime ?? 60,
      efficiency:       raw.efficiency ?? 72,
      mashEfficiency:   raw.mashEfficiency ?? 76,
      boilOffRate:      raw.boilOffRate ?? 4,
      trubLoss:         raw.trubLoss ?? 2,
      fermentorLoss:    raw.fermentorLoss ?? 1,
      deadSpace:        raw.deadSpace ?? 1,
      mashTunVolume:    raw.mashTunVolume ?? 0,
      boilTemperature:  raw.boilTemperature ?? 100,
      notes:            raw.notes,
      // Campos opcionais preservados se presentes
      batchVolumeTarget:      raw.batchVolumeTarget,
      fermenterType:          raw.fermenterType,
      bagSqueeze:             raw.bagSqueeze,
      hltVolume:              raw.hltVolume,
      mashLoss:               raw.mashLoss,
      spargeDeadSpace:        raw.spargeDeadSpace,
      fermenterWater:         raw.fermenterWater,
      calculateBoilVolume:    raw.calculateBoilVolume,
      calculateMashEfficiency: raw.calculateMashEfficiency,
      hopUtilization:         raw.hopUtilization,
      aromaHopUtilization:    raw.aromaHopUtilization,
      calculateAromaHopUtil:  raw.calculateAromaHopUtil,
      hopstandTemperature:    raw.hopstandTemperature,
      whirlpoolTime:          raw.whirlpoolTime,
      altitudeAdjust:         raw.altitudeAdjust,
      altitude:               raw.altitude,
      boilExpansion:          raw.boilExpansion,
      grainAbsorptionRate:    raw.grainAbsorptionRate,
      waterToGrainRatio:      raw.waterToGrainRatio,
      mashWaterMethod:        raw.mashWaterMethod,
      lauterMethod:           raw.lauterMethod,
    }

    return create(payload)
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
    exportProfile,
    importProfile,
  }
})
