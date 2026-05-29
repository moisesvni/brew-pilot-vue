<template>
  <brew-pilot-dialog v-model="open" title="Selecionar Estilo" icon="mdi-book-open-variant" icon-color="primary"
    width="680px">

    <q-card-section class="q-pb-xs">

      <!-- ── Busca + Filtrar ── -->
      <div class="row items-center no-wrap q-mb-xs" style="gap: 8px">

        <!-- Botão Fonte com menu dropdown -->
        <brew-pilot-button flat no-caps dense icon="mdi-book-open-page-variant-outline"
          :color="selectedSources.size < allSources.length ? 'primary' : 'grey-5'"
          size="sm" class="style-filter-btn">
          <span class="q-ml-xs">Fonte</span>
          <q-badge v-if="selectedSources.size < allSources.length" floating color="primary"
            :label="selectedSources.size"
            style="font-size: 9px; min-height: 14px; min-width: 14px; padding: 3px 5px" />
          <q-menu :auto-close="false" anchor="bottom left" self="top left" :offset="[0, 4]" class="style-filter-menu">
            <div style="min-width: 260px">
              <div class="q-px-md q-pt-sm q-pb-xs">
                <div class="text-caption text-weight-medium"
                  style="color: var(--bp-text-muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px">
                  Fonte / Guia de Estilos
                </div>
              </div>
              <q-list dense>
                <!-- Todos -->
                <q-item clickable v-ripple dense
                  :active="selectedSources.size === allSources.length"
                  active-class="style-menu-item--active" style="min-height: 36px"
                  @click.stop="selectedSources = new Set(allSources)">
                  <q-item-section avatar style="min-width: 28px; padding-left: 4px">
                    <q-icon name="mdi-format-list-bulleted" size="16px"
                      :color="selectedSources.size === allSources.length ? 'primary' : 'grey-5'" />
                  </q-item-section>
                  <q-item-section style="font-size: 13px">Todas as fontes</q-item-section>
                  <q-item-section side v-if="selectedSources.size === allSources.length">
                    <q-icon name="mdi-check" size="14px" color="primary" />
                  </q-item-section>
                </q-item>
                <q-separator class="q-my-xs" />
                <q-item v-for="src in allSources" :key="src" clickable dense
                  :class="{ 'style-menu-item--active': selectedSources.has(src) }" style="min-height: 36px"
                  @click.stop="toggleSource(src)">
                  <q-item-section side style="padding-right: 8px; min-width: 0">
                    <q-checkbox :model-value="selectedSources.has(src)" dense size="sm" color="primary"
                      @update:model-value="toggleSource(src)" @click.stop />
                  </q-item-section>
                  <q-item-section style="font-size: 12px">{{ src }}</q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-menu>
        </brew-pilot-button>

        <!-- Botão Categorias com menu dropdown -->
        <brew-pilot-button flat no-caps dense icon="mdi-tag-multiple-outline" :color="selectedCategories.size > 0 ? 'primary' : 'grey-5'"
          size="sm" class="style-filter-btn">
          <span class="q-ml-xs">Categorias</span>
          <q-badge v-if="selectedCategories.size > 0" floating color="primary" :label="selectedCategories.size"
            style="font-size: 9px; min-height: 14px; min-width: 14px; padding: 3px 5px" />
          <q-menu :auto-close="false" anchor="bottom left" self="top left" :offset="[0, 4]" class="style-filter-menu">
            <div style="min-width: 250px; max-height: 380px; overflow-y: auto">
              <div class="q-px-md q-pt-sm q-pb-xs">
                <div class="text-caption text-weight-medium"
                  style="color: var(--bp-text-muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px">
                  Categoria
                </div>
              </div>
              <q-list dense>
                <!-- Todos -->
                <q-item clickable v-ripple dense :active="selectedCategories.size === 0"
                  active-class="style-menu-item--active" style="min-height: 36px"
                  @click.stop="selectedCategories = new Set()">
                  <q-item-section avatar style="min-width: 28px; padding-left: 4px">
                    <q-icon name="mdi-format-list-bulleted" size="16px"
                      :color="selectedCategories.size === 0 ? 'primary' : 'grey-5'" />
                  </q-item-section>
                  <q-item-section style="font-size: 13px">Todas as categorias</q-item-section>
                  <q-item-section side v-if="selectedCategories.size === 0">
                    <q-icon name="mdi-check" size="14px" color="primary" />
                  </q-item-section>
                </q-item>

                <q-separator class="q-my-xs" />

                <!-- Categorias com checkbox -->
                <q-item v-for="cat in allCategoryChips" :key="cat.code" clickable dense
                  :class="{ 'style-menu-item--active': selectedCategories.has(cat.code) }" style="min-height: 36px"
                  @click.stop="toggleCategory(cat.code)">
                  <q-item-section side style="padding-right: 8px; min-width: 0">
                    <q-checkbox :model-value="selectedCategories.has(cat.code)" dense size="sm" color="primary"
                      @update:model-value="toggleCategory(cat.code)" @click.stop />
                  </q-item-section>
                  <q-item-section style="font-size: 13px">{{ cat.name }}</q-item-section>
                  <q-item-section side>
                    <span style="font-size: 11px; color: var(--bp-text-muted)">{{ cat.count }}</span>
                  </q-item-section>
                </q-item>

                <q-separator class="q-mt-xs" />

                <!-- Limpar filtros -->
                <q-item clickable dense :disable="selectedCategories.size === 0" style="min-height: 36px"
                  @click.stop="selectedCategories = new Set()">
                  <q-item-section avatar style="min-width: 28px; padding-left: 4px">
                    <q-icon name="mdi-filter-remove-outline" size="16px"
                      :color="selectedCategories.size > 0 ? 'negative' : 'grey-7'" />
                  </q-item-section>
                  <q-item-section
                    :style="{ fontSize: '13px', color: selectedCategories.size > 0 ? 'var(--bp-text-primary)' : 'var(--bp-text-muted)' }">
                    Limpar filtros
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-menu>
        </brew-pilot-button>

        <!-- Input de busca -->
        <brew-pilot-search-input dense v-model="styleSearch" placeholder="Buscar estilo (ex: IPA, Stout, 12C...)" class="col" />
      </div>

      <!-- Chips de filtros ativos (removíveis) -->
      <div v-if="selectedCategories.size > 0" class="row q-gutter-xs q-mb-xs">
        <q-chip v-for="cat in activeCategoryChips" :key="cat.code" dense removable color="primary" text-color="white"
          size="sm" @remove="toggleCategory(cat.code)">
          {{ cat.name }}
        </q-chip>
      </div>

    </q-card-section>

    <q-card-section class="q-pt-none">
      <div v-if="!filteredStyles.length" class="text-grey-5 text-center q-py-lg">
        <q-icon name="mdi-magnify-remove-outline" size="36px" class="q-mb-xs" /><br>
        Nenhum estilo encontrado
      </div>
      <q-list v-else separator style="max-height: 56vh; overflow-y: auto">
        <q-item v-for="s in filteredStyles" :key="s.id" class="style-item q-py-sm q-px-md"
          :class="{ 'style-item--active': recipe.styleGuideId === s.id }">
          <q-item-section>

            <!-- ── LINHA DE CABEÇALHO: [chevron] [código–nome] [botão] ── -->
            <div class="row items-center no-wrap style-header-row">
              <!-- Chevron expand/collapse -->
              <q-btn flat round dense :icon="expandedId === s.id ? 'mdi-chevron-up' : 'mdi-chevron-down'" color="grey-5"
                size="sm" class="q-mr-sm" @click.stop="toggleExpand(s.id)">
                <q-tooltip>{{ expandedId === s.id ? 'Menos detalhes' : 'Mais detalhes' }}</q-tooltip>
              </q-btn>

              <!-- Nome – Código (cresce) -->
              <div class="col style-title">
                <brew-pilot-label :variant="recipe.styleGuideId === s.id ? 'value' : 'secondary'" tag="span" size= "13px" class="text-weight-medium">  {{ s.name }}</brew-pilot-label>
                <brew-pilot-label variant="secondary" tag="span" size= "11px" class="q-ml-sm text-weight-medium">  {{ s.code }}</brew-pilot-label>
              </div>

              <!-- Botão Selecionar / Selecionado -->
              <q-btn v-if="recipe.styleGuideId !== s.id"
                unelevated dense no-caps
                icon="mdi-playlist-check"
                label="Selecionar"
                color="primary"
                text-color="white"
                size="sm"
                class="select-btn q-ml-sm"
                @click.stop="selectStyle(s)">
                <q-tooltip>Selecionar este estilo</q-tooltip>
              </q-btn>
              <q-btn v-else
                unelevated dense no-caps
                icon="mdi-check-circle"
                label="Selecionado"
                color="positive"
                text-color="white"
                size="sm"
                class="select-btn q-ml-sm"
                disable>
                <q-tooltip>Estilo atual da receita</q-tooltip>
              </q-btn>
            </div>

            <!-- Caption -->
            <div class="style-caption q-mt-xs q-ml-lg">
              <brew-pilot-label variant="muted" size="11px">{{ s.category }} · ABV {{ s.abvMin }}–{{ s.abvMax }}% · IBU {{ s.ibuMin }}–{{ s.ibuMax }}<template v-if="s.source"> · {{ s.source }}</template></brew-pilot-label>
            </div>

            <!-- Barra EBC -->
            <div class="q-mt-xs q-ml-lg">
              <div v-if="hasEbc(s)" class="ebc-bar" :style="{ background: ebcGradient(s) }">
                <span class="ebc-label">EBC {{ s.ebcMin }}–{{ s.ebcMax }}</span>
              </div>
              <div v-else class="no-ebc">
                <q-icon name="mdi-palette-outline" size="10px" class="q-mr-xs" />
                <span>Sem dados de cor definidos</span>
              </div>
            </div>

            <!-- ── DETALHES EXPANDIDOS ── -->
            <transition name="expand">
              <div v-if="expandedId === s.id" class="style-details q-mt-md q-ml-lg">

                <!-- Parâmetros -->
                <div class="detail-section">
                  <div class="detail-section-title">Parâmetros</div>
                  <style-param-bar label="ABV" :min="s.abvMin" :max="s.abvMax" :decimals="1" unit="%" />
                  <style-param-bar label="OG"  :min="s.ogMin"  :max="s.ogMax"  :decimals="3" />
                  <style-param-bar label="FG"  :min="s.fgMin"  :max="s.fgMax"  :decimals="3" />
                  <style-param-bar v-if="hasEbc(s)" label="EBC" :min="s.ebcMin" :max="s.ebcMax" :decimals="1" />
                  <style-param-bar label="IBU" :min="s.ibuMin" :max="s.ibuMax" :decimals="0" />
                  <style-param-bar label="BU/GU" :min="buguMin(s)" :max="buguMax(s)" :decimals="2" />
                </div>

                <div v-if="s.overallImpression" class="detail-section">
                  <div class="detail-section-title">Impressão Geral</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.overallImpression }}</brew-pilot-label>
                </div>
                <div v-if="s.aroma" class="detail-section">
                  <div class="detail-section-title">Aroma</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.aroma }}</brew-pilot-label>
                </div>
                <div v-if="s.appearance" class="detail-section">
                  <div class="detail-section-title">Aparência</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.appearance }}</brew-pilot-label>
                </div>
                <div v-if="s.flavor" class="detail-section">
                  <div class="detail-section-title">Sabor</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.flavor }}</brew-pilot-label>
                </div>
                <div v-if="s.mouthfeel" class="detail-section">
                  <div class="detail-section-title">Sensação na Boca</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.mouthfeel }}</brew-pilot-label>
                </div>
                <div v-if="s.comments" class="detail-section">
                  <div class="detail-section-title">Comentários</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.comments }}</brew-pilot-label>
                </div>
                <div v-if="s.history" class="detail-section">
                  <div class="detail-section-title">Histórico</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.history }}</brew-pilot-label>
                </div>
                <div v-if="s.characteristicIngredients" class="detail-section">
                  <div class="detail-section-title">Ingredientes</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.characteristicIngredients }}</brew-pilot-label>
                </div>
                <div v-if="s.styleComparison" class="detail-section">
                  <div class="detail-section-title">Comparação</div>
                  <brew-pilot-label tag="p" variant="secondary" size="12px" class="detail-text">{{ s.styleComparison }}</brew-pilot-label>
                </div>
                <div v-if="s.commercialExamples" class="detail-section">
                  <div class="detail-section-title">Exemplos Comerciais</div>
                  <brew-pilot-label tag="p" variant="value" size="12px" class="detail-text detail-text--examples">{{ s.commercialExamples }}</brew-pilot-label>
                </div>

                <!-- Fonte -->
                <div v-if="s.source" class="detail-source">
                  <q-icon name="mdi-information-outline" size="11px" class="q-mr-xs" />
                  <brew-pilot-label variant="muted" size="10px">{{ s.source }}</brew-pilot-label>
                </div>

              </div>
            </transition>

          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import type { StyleGuide } from '@/types/recipe'
import { stylesService } from '@/services/styles.service'
import { srmToHex } from '@/composables/useBrewCalculator'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)

const styleSearch = ref('')
const selectedCategories = ref<Set<string>>(new Set())
const expandedId = ref<string | null>(null)
const allStyles = stylesService.getAll()

// ── Sources disponíveis (inicializa com todos selecionados) ─────────────────
const allSources = [...new Set(allStyles.map(s => s.source).filter(Boolean) as string[])].sort()
const selectedSources = ref<Set<string>>(new Set(allSources))

// ── Filtro por fonte ─────────────────────────────────────────────────────────
const stylesAfterSource = computed(() => {
  if (selectedSources.value.size === allSources.length) return allStyles
  return allStyles.filter(s => s.source && selectedSources.value.has(s.source))
})

// ── Filtro por texto ─────────────────────────────────────────────────────────
const stylesAfterText = computed(() => {
  const q = styleSearch.value.toLowerCase().trim()
  const base = stylesAfterSource.value
  if (!q) return base
  return base.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q)
  )
})

// ── Categorias disponíveis (apenas das fontes selecionadas) ────────────────────
const allCategoryChips = computed(() => {
  const map = new Map<string, { code: string; name: string; count: number }>()
  for (const s of stylesAfterSource.value) {
    const code = s.categoryCode ?? ''
    if (!code) continue
    const existing = map.get(code)
    if (existing) { existing.count++ }
    else { map.set(code, { code, name: s.category, count: 1 }) }
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code))
})

const activeCategoryChips = computed(() =>
  allCategoryChips.value.filter(c => selectedCategories.value.has(c.code))
)

// ── Lista final (ordenada por Nome, depois Código) ──────────────────────────
const filteredStyles = computed(() => {
  const base = !selectedCategories.value.size
    ? stylesAfterText.value
    : stylesAfterText.value.filter(s =>
        s.categoryCode && selectedCategories.value.has(s.categoryCode)
      )
  return [...base].sort((a, b) => {
    const nameCompare = a.name.localeCompare(b.name, 'pt-BR')
    return nameCompare !== 0 ? nameCompare : a.code.localeCompare(b.code, 'pt-BR')
  })
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function toggleCategory(code: string) {
  const next = new Set(selectedCategories.value)
  if (next.has(code)) next.delete(code)
  else next.add(code)
  selectedCategories.value = next
}

function toggleSource(src: string) {
  const next = new Set(selectedSources.value)
  if (next.has(src)) next.delete(src)
  else next.add(src)
  selectedSources.value = next
  // limpa categorias que não existem mais nas fontes selecionadas
  const validCodes = new Set(allCategoryChips.value.map(c => c.code))
  const nextCats = new Set([...selectedCategories.value].filter(c => validCodes.has(c)))
  selectedCategories.value = nextCats
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function hasEbc(s: StyleGuide): boolean {
  return s.ebcMin > 0 || s.ebcMax > 0
}

function ebcToHex(ebc: number): string {
  // srmColors começa em SRM 2 — clampamos para evitar fallback ao preto
  return srmToHex(Math.max(ebc / 1.97, 2))
}

function ebcGradient(s: StyleGuide): string {
  const hexMin = ebcToHex(s.ebcMin)
  const hexMax = ebcToHex(s.ebcMax)
  if (s.ebcMin === s.ebcMax) return hexMin
  return `linear-gradient(to right, ${hexMin}, ${hexMax})`
}

function buguMin(s: StyleGuide): number {
  const og = s.ogMin - 1
  if (!og) return 0
  return Number((s.ibuMin / (og * 1000)).toFixed(2))
}

function buguMax(s: StyleGuide): number {
  const og = s.ogMax - 1
  if (!og) return 0
  return Number((s.ibuMax / (og * 1000)).toFixed(2))
}

function selectStyle(s: StyleGuide) {
  recipe.value.styleGuideId = s.id
  recipe.value.styleGuide = s
  open.value = false
}

function clearStyle() {
  recipe.value.styleGuideId = ''
  recipe.value.styleGuide = undefined
  open.value = false
}
</script>

<style scoped>
/* ── Botão Filtrar ── */
.style-filter-btn {
  border: 1px solid var(--bp-border);
  border-radius: 6px;
  font-size: 12px;
  padding: 0 10px;
  height: 36px;
  flex-shrink: 0;
  position: relative;
}

.style-filter-menu {
  background: var(--bp-surface) !important;
  border: 1px solid var(--bp-border);
  border-radius: 8px;
}

.style-menu-item--active {
  background: color-mix(in srgb, #c1710e 10%, transparent);
}

/* ── Cabeçalho do item ── */
.style-header-row {
  min-height: 28px;
}

.select-btn {
  border-radius: 6px;
  font-size: 11px;
  padding: 0 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.style-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--q-primary);
}

.style-name--selected {
  font-weight: 700;
}

.style-code {
  font-size: 10px;
  font-weight: 600;
  color: var(--q-primary);
  opacity: 0.75;
}

/* ── Item da lista ── */
.style-item {
  transition: background 0.15s ease;
}

.style-item--active {
  background: rgba(193, 113, 14, 0.12) !important;
  border-left: 3px solid var(--q-primary);
}
.body--light .style-item--active {
  background: rgba(193, 113, 14, 0.08) !important;
}
.style-item:not(.style-item--active) {
  border-left: 3px solid transparent;
}

/* ── Barra EBC ── */
.ebc-bar {
  height: 8px;
  border-radius: 4px;
  position: relative;
  overflow: visible;
}

.ebc-label {
  position: absolute;
  right: 0;
  top: -13px;
  font-size: 10px;
  color: var(--bp-text-muted);
  white-space: nowrap;
  pointer-events: none;
}

.no-ebc {
  display: flex;
  align-items: center;
  font-size: 10px;
  color: var(--bp-text-muted);
  height: 8px;
}

/* ── Detalhes expandidos ── */
.style-details {
  border-top: 1px solid var(--bp-border);
  padding-top: 10px;
}

.detail-section {
  margin-bottom: 10px;
}

.detail-section-title {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--bp-text-muted);
  margin-bottom: 4px;
}

.detail-text {
  line-height: 1.5;
  margin: 0;
}

.detail-text--examples {
  font-style: italic;
}

.detail-source {
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--bp-border);
  color: var(--bp-text-muted);
}

/* ── Transição expand ── */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
