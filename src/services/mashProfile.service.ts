import apiClient from './apiClient'
import type { MashProfile } from '@/types/mash'

export const mashProfileService = {
  getAll: () =>
    apiClient.get<MashProfile[]>('/mash-profiles').then(r => r.data),

  create: (data: Omit<MashProfile, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<MashProfile>('/mash-profiles', data).then(r => r.data),

  update: (id: string, data: Omit<MashProfile, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.put<MashProfile>(`/mash-profiles/${id}`, data).then(r => r.data),

  remove: (id: string) =>
    apiClient.delete(`/mash-profiles/${id}`),
}
