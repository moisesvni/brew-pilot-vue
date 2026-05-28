<template>
  <brew-pilot-dialog v-model="open" title="Foto da Receita" icon="mdi-camera" icon-color="grey-5" width="420px">

    <q-card-section v-if="recipe.imageUrl" class="q-pt-sm q-pb-none">
      <div class="img-preview rounded-borders overflow-hidden">
        <img :src="recipe.imageUrl" style="width:100%; height:100%; object-fit:cover"
          referrerpolicy="no-referrer" />
      </div>
    </q-card-section>

    <q-card-section>
      <q-uploader flat bordered accept="image/*" :max-files="1" hide-upload-btn
        :label="recipe.imageUrl ? 'Substituir imagem' : 'Adicionar imagem'"
        class="full-width" style="border-radius: 8px" @added="onImageAdded" />
    </q-card-section>

    <template v-if="recipe.imageUrl" #footer>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat no-caps dense icon="mdi-trash-can-outline" label="Remover foto"
          color="negative" @click="removeImage" />
      </q-card-actions>
    </template>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BrewPilotDialog from '@/components/BrewPilotDialog.vue'
import { useRecipeStore } from '@/stores/recipeStore'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)

function onImageAdded(files: readonly File[]) {
  const file = files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    recipe.value.imageUrl = e.target?.result as string
    open.value = false
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  recipe.value.imageUrl = undefined
  open.value = false
}
</script>

<style scoped>
.img-preview {
  width: 100%;
  height: 220px;
  background: var(--bp-page-bg);
}
</style>
