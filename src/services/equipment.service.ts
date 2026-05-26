import apiClient from './apiClient'
import type { EquipmentProfile, CreateEquipmentProfileRequest } from '../types/equipment'

export const equipmentService = {
  getAll: () =>
    apiClient.get<EquipmentProfile[]>('/equipment').then(r => r.data),

  create: (data: CreateEquipmentProfileRequest) =>
    apiClient.post<EquipmentProfile>('/equipment', data).then(r => r.data),

  update: (id: string, data: CreateEquipmentProfileRequest) =>
    apiClient.put<EquipmentProfile>(`/equipment/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    apiClient.delete(`/equipment/${id}`),
}

