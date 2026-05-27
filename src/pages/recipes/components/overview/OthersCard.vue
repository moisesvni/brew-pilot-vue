<template>
  <recipe-section title="Outros" icon="mdi-dots-horizontal-circle-outline" icon-color="blue-grey">

    <!-- ── Tags ──────────────────────────────────────────────────────────── -->
    <div class="q-mb-sm">
      <div class="text-caption text-grey-5 q-mb-xs">Tags</div>
      <div class="row q-gutter-xs items-center">
        <q-chip
          v-for="(tag, i) in localTags"
          :key="i"
          dense
          removable
          dark
          color="grey-8"
          text-color="grey-3"
          @remove="removeTag(i)"
        >
          {{ tag }}
        </q-chip>
        <q-input
          v-model="newTag"
          dense
          borderless
          dark
          placeholder="+ Adicionar tag"
          style="font-size:12px; min-width:110px; max-width:180px"
          @keyup.enter="addTag"
          @blur="addTag"
        />
      </div>
    </div>

    <q-separator dark class="q-my-sm" />

    <!-- ── Anotações ─────────────────────────────────────────────────────── -->
    <div class="q-mb-sm">
      <div class="text-caption text-grey-5 q-mb-xs">Anotações</div>
      <q-input
        v-model="localNotes"
        type="textarea"
        dense
        outlined
        dark
        autogrow
        :rows="3"
        placeholder="Adicionar anotações sobre a receita, processo, ingredientes..."
        @update:model-value="emit('update:notes', localNotes)"
      />
    </div>

    <q-separator dark class="q-my-sm" />

    <!-- ── Texto prévio ──────────────────────────────────────────────────── -->
    <div class="q-mb-sm">
      <div class="text-caption text-grey-5 q-mb-xs">Texto prévio</div>
      <q-input
        v-model="localPreviewText"
        dense
        outlined
        dark
        placeholder="Breve descrição exibida na listagem de receitas..."
        @update:model-value="emit('update:previewText', localPreviewText)"
      />
    </div>

    <q-separator dark class="q-my-sm" />

    <!-- ── Anexos ─────────────────────────────────────────────────────────── -->
    <div>
      <div class="row items-center justify-between q-mb-xs">
        <div class="text-caption text-grey-5">Anexos <q-badge :label="attachments.length" color="grey-7" /></div>
        <q-btn outline rounded dense no-caps label="+ ADICIONAR" color="grey-5" size="sm"
          @click="fileInput?.click()">
          <q-tooltip>Funcionalidade Premium</q-tooltip>
        </q-btn>
      </div>

      <input ref="fileInput" type="file" multiple style="display:none" @change="onFileChange" />

      <div v-if="!attachments.length" class="text-caption text-grey-7 text-center q-py-sm">
        Nenhum anexo ainda
      </div>
      <div v-else>
        <div
          v-for="(a, i) in attachments"
          :key="i"
          class="row items-center q-py-xs"
          style="border-bottom:1px solid rgba(255,255,255,0.06)"
        >
          <q-icon name="mdi-file-outline" color="grey-5" size="16px" class="q-mr-xs" />
          <span class="text-caption text-grey-3 col ellipsis">{{ a.name }}</span>
          <span class="text-caption text-grey-6 q-ml-xs">{{ formatSize(a.size) }}</span>
          <q-btn flat round dense size="xs" icon="close" color="grey-6" @click="removeAttachment(i)" />
        </div>
      </div>
    </div>

  </recipe-section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRecipeStore } from '../../../../stores/recipeStore'
import RecipeSection from '../RecipeSection.vue'

const store  = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)


const emit = defineEmits<{
  (e: 'update:tags', tags: string[]): void
  (e: 'update:notes', notes: string): void
  (e: 'update:previewText', text: string): void
}>()

// ── Tags ──
const localTags = ref<string[]>([...(recipe.value.tags ?? [])])
const newTag = ref('')

function addTag () {
  const t = newTag.value.trim()
  if (t && !localTags.value.includes(t)) {
    localTags.value.push(t)
    emit('update:tags', localTags.value)
    // persist on recipe directly
    if (!recipe.value.tags) recipe.value.tags = []
    recipe.value.tags.push(t)
  }
  newTag.value = ''
}

function removeTag (i: number) {
  localTags.value.splice(i, 1)
  recipe.value.tags = [...localTags.value]
  emit('update:tags', localTags.value)
}

// ── Anotações ──
const localNotes = ref(recipe.value.notes ?? '')

watch(() => recipe.value.notes, (v) => { localNotes.value = v ?? '' })

watch(localNotes, (v) => {
  recipe.value.notes = v
})

// ── Texto prévio ──
const localPreviewText = ref(recipe.value.previewText ?? '')

watch(() => recipe.value.previewText, (v) => { localPreviewText.value = v ?? '' })

watch(localPreviewText, (v) => {
  recipe.value.previewText = v
})

// ── Anexos (local only – premium placeholder) ──
interface Attachment { name: string; size: number; url: string }
const attachments = ref<Attachment[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

function onFileChange (e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const f of Array.from(files)) {
    attachments.value.push({ name: f.name, size: f.size, url: URL.createObjectURL(f) })
  }
}

function removeAttachment (i: number) {
  URL.revokeObjectURL(attachments.value[i]!.url)
  attachments.value.splice(i, 1)
}

function formatSize (bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
