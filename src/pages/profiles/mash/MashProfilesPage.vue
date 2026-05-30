<template>
  <brew-pilot-page>
    <brew-pilot-page-header icon="mdi-thermometer" title="Perfis de Mostura" :bleed="false">
      <template #actions>
        <brew-pilot-button variant="filled" color="primary" no-caps icon="mdi-plus" label="Criar Perfil"
          :disable="!mashStore.canAddMore" @click="openCreate" />
      </template>
    </brew-pilot-page-header>

    <div class="q-pa-md">

      <!-- Loading -->
      <div v-if="mashStore.loading" class="row justify-center q-py-xl">
        <brew-pilot-loading />
      </div>

      <!-- Erro -->
      <q-banner v-else-if="mashStore.error" rounded dense class="bg-negative text-white q-mb-md">
        <template #avatar><q-icon name="mdi-alert-circle-outline" /></template>
        {{ mashStore.error }}
        <template #action>
          <q-btn flat dense no-caps label="Tentar novamente" @click="mashStore.fetchAll()" />
        </template>
      </q-banner>

      <template v-else>

        <!-- ── Banner Upgrade ────────────────────────────── -->
        <div v-if="!mashStore.canAddMore" class="upgrade-banner q-mb-lg">
          <div class="row items-center no-wrap" style="gap: 12px">
            <div class="upgrade-icon-wrap">
              <q-icon name="mdi-crown" color="amber-7" size="28px" />
            </div>
            <div class="col">
              <div class="text-body2 text-weight-bold upgrade-title">
                Você atingiu o limite do plano gratuito
              </div>
              <div class="text-caption upgrade-sub">
                O plano Free permite até {{ FREE_LIMIT }} perfis de mostura.
                Altere seu plano, você cria perfis ilimitados e acessa recursos avançados.
              </div>
            </div>
            <brew-pilot-subscription-plan-button />
          </div>
        </div>

        <!-- ── Perfil padrão (destaque no topo) ─────────── -->
        <template v-if="defaultProfile">
          <div class="text-caption text-weight-medium q-mb-xs"
            style="color: var(--bp-text-muted); letter-spacing: 0.04em; text-transform: uppercase">
            Padrão
          </div>
          <mash-profile-card
            :profile="defaultProfile"
            :can-duplicate="mashStore.canAddMore"
            class="q-mb-lg"
            @edit="openEdit"
            @delete="confirmDelete"
            @duplicate="openCreateFromBase"
            @remove-default="toggleDefault"
          />
          <div v-if="regularProfiles.length" class="text-caption text-weight-medium q-mb-xs"
            style="color: var(--bp-text-muted); letter-spacing: 0.04em; text-transform: uppercase">
            Outros Perfis
          </div>
        </template>

        <!-- ── Lista de perfis ───────────────────────────── -->
        <div v-if="regularProfiles.length" class="column q-gutter-sm q-mb-md">
          <mash-profile-card
            v-for="p in regularProfiles"
            :key="p.id"
            :profile="p"
            :can-duplicate="mashStore.canAddMore"
            @edit="openEdit"
            @delete="confirmDelete"
            @duplicate="openCreateFromBase"
            @set-default="toggleDefault"
          />
        </div>

        <!-- Vazio -->
        <div v-if="!mashStore.profiles.length" class="column items-center q-py-xl" style="color: var(--bp-text-muted)">
          <q-icon name="mdi-thermometer-off" size="48px" class="q-mb-sm" />
          <div class="text-body1">Nenhum perfil de mostura ainda</div>
          <brew-pilot-button variant="filled" color="primary" no-caps icon="mdi-plus"
            label="Criar primeiro perfil" class="q-mt-md" @click="openCreate" />
        </div>

        <!-- Contador -->
        <div v-if="mashStore.profiles.length" class="text-caption" style="color: var(--bp-text-muted)">
          {{ mashStore.profiles.length }} / {{ FREE_LIMIT }} perfis
          <template v-if="!mashStore.canAddMore"> — limite atingido</template>
        </div>

      </template>
    </div>

    <!-- ── Dialogs ───────────────────────────────────────── -->
    <edit-mash-profile-dialog v-model="editDialog" :base-profile="editBase" @saved="onSaved" />

    <brew-pilot-dialog v-model="deleteDialog" title="Excluir Perfil" icon="mdi-delete"
      icon-color="negative" width="360px">
      <q-card-section class="q-pt-sm">
        <div style="color: var(--bp-text-secondary)">
          Deseja excluir <strong style="color: var(--bp-text-primary)">{{ deleteTarget?.name }}</strong>?
          Esta ação não pode ser desfeita.
        </div>
      </q-card-section>
      <template #footer>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <brew-pilot-button variant="flat" no-caps label="Cancelar" @click="deleteDialog = false" />
          <brew-pilot-button variant="filled" color="negative" no-caps label="Excluir"
            :loading="deleting" @click="doDelete" />
        </q-card-actions>
      </template>
    </brew-pilot-dialog>
  </brew-pilot-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMashProfileStore } from '@/stores/mashProfileStore'
import type { MashProfile } from '@/types/mash'
import EditMashProfileDialog from './EditMashProfileDialog.vue'
import MashProfileCard from './MashProfileCard.vue'

const FREE_LIMIT = 3
const $q = useQuasar()
const mashStore = useMashProfileStore()

onMounted(() => { if (!mashStore.profiles.length) mashStore.fetchAll() })

const defaultProfile = computed(() => mashStore.profiles.find(p => p.isDefault) ?? null)

const regularProfiles = computed(() =>
  [...mashStore.profiles]
    .filter(p => !p.isDefault)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
)

const editDialog   = ref(false)
const editBase     = ref<MashProfile | null>(null)
const deleteDialog = ref(false)
const deleteTarget = ref<MashProfile | null>(null)
const deleting     = ref(false)

function openCreate() { editBase.value = null; editDialog.value = true }
function openEdit(p: MashProfile) { editBase.value = p; editDialog.value = true }
function openCreateFromBase(p: MashProfile) {
  editBase.value = { ...p, id: '', isDefault: false }
  editDialog.value = true
}
function onSaved(_: MashProfile) { /* store updated inside dialog */ }
function confirmDelete(p: MashProfile) { deleteTarget.value = p; deleteDialog.value = true }

async function toggleDefault(p: MashProfile) {
  try {
    await mashStore.update(p.id, { ...p, isDefault: !p.isDefault })
    $q.notify({
      type: 'positive',
      message: p.isDefault ? 'Perfil removido dos padrões.' : 'Perfil definido como padrão.',
      timeout: 2000,
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Erro ao atualizar perfil.', timeout: 4000 })
  }
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await mashStore.remove(deleteTarget.value.id)
    deleteDialog.value = false
    deleteTarget.value = null
    $q.notify({ type: 'positive', message: 'Perfil excluído.', timeout: 2000 })
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    $q.notify({
      type: 'negative',
      message: msg ?? 'Erro ao excluir perfil. Tente novamente.',
      timeout: 4000,
    })
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.upgrade-banner {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, #f59e0b 10%, var(--bp-surface-alt)),
    color-mix(in srgb, #c1710e 8%, var(--bp-surface-alt))
  );
  border: 1px solid color-mix(in srgb, #f59e0b 35%, transparent);
  border-radius: 12px;
  padding: 14px 16px;
}
.upgrade-icon-wrap {
  background: color-mix(in srgb, #f59e0b 15%, transparent);
  border-radius: 10px;
  padding: 8px;
  flex-shrink: 0;
}
.upgrade-title { color: var(--bp-text-primary); margin-bottom: 2px; }
.upgrade-sub { color: var(--bp-text-secondary); }
</style>
