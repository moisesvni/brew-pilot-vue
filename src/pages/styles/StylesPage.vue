<template>
  <brew-pilot-page padding>
    <brew-pilot-page-header
      icon="mdi-book-open-variant"
      title="Guia de Estilos"
      :bleed="false"
    >
      <template #subtitle>
        <span style="color: var(--bp-text-muted)">
          {{ filteredStyles.length }} estilo{{ filteredStyles.length !== 1 ? 's' : '' }}
          <template v-if="isFiltered"> encontrado{{ filteredStyles.length !== 1 ? 's' : '' }}</template>
          <template v-else> no guia</template>
        </span>
      </template>
    </brew-pilot-page-header>

    <!-- ── Barra de filtros ─────────────────────────────────────── -->
    <div class="row items-center q-mb-sm no-wrap" style="gap: 8px">

      <!-- Fonte -->
      <brew-pilot-button flat no-caps dense icon="mdi-book-open-page-variant-outline"
        :color="selectedSources.size < allSources.length ? 'primary' : 'grey-5'"
        size="sm">
        <span class="q-ml-xs">Fonte</span>
        <q-badge v-if="selectedSources.size < allSources.length" floating color="primary"
          :label="selectedSources.size"
          style="font-size: 9px; min-height: 14px; min-width: 14px; padding: 3px 5px" />
        <q-menu :auto-close="false" anchor="bottom left" self="top left" :offset="[0, 4]">
          <div style="min-width: 280px">
            <div class="q-px-md q-pt-sm q-pb-xs text-overline text-weight-bold" style="color: var(--bp-text-muted)">
              Fonte / Guia de Estilos
            </div>
            <q-list dense>
              <q-item clickable v-ripple dense style="min-height: 36px"
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
              <q-item v-for="src in allSources" :key="src" clickable dense style="min-height: 36px"
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

      <!-- Categorias -->
      <brew-pilot-button flat no-caps dense icon="mdi-tag-multiple-outline"
        :color="selectedCategories.size > 0 ? 'primary' : 'grey-5'"
        size="sm">
        <span class="q-ml-xs">Categorias</span>
        <q-badge v-if="selectedCategories.size > 0" floating color="primary"
          :label="selectedCategories.size"
          style="font-size: 9px; min-height: 14px; min-width: 14px; padding: 3px 5px" />
        <q-menu :auto-close="false" anchor="bottom left" self="top left" :offset="[0, 4]">
          <div style="min-width: 260px; max-height: 420px; overflow-y: auto">
            <div class="q-px-md q-pt-sm q-pb-xs text-overline text-weight-bold" style="color: var(--bp-text-muted)">
              Categoria
            </div>
            <q-list dense>
              <q-item clickable v-ripple dense style="min-height: 36px"
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
              <q-item v-for="cat in allCategoryChips" :key="cat.code" clickable dense style="min-height: 36px"
                @click.stop="toggleCategory(cat.code)">
                <q-item-section side style="padding-right: 8px; min-width: 0">
                  <q-checkbox :model-value="selectedCategories.has(cat.code)" dense size="sm" color="primary"
                    @update:model-value="toggleCategory(cat.code)" @click.stop />
                </q-item-section>
                <q-item-section style="font-size: 12px">{{ cat.name }}</q-item-section>
                <q-item-section side>
                  <span style="font-size: 11px; color: var(--bp-text-muted)">{{ cat.count }}</span>
                </q-item-section>
              </q-item>
              <q-separator class="q-mt-xs" />
              <q-item clickable dense :disable="selectedCategories.size === 0" style="min-height: 36px"
                @click.stop="selectedCategories = new Set()">
                <q-item-section avatar style="min-width: 28px; padding-left: 4px">
                  <q-icon name="mdi-filter-remove-outline" size="16px"
                    :color="selectedCategories.size > 0 ? 'negative' : 'grey-7'" />
                </q-item-section>
                <q-item-section :style="{ fontSize: '13px', color: selectedCategories.size > 0 ? 'var(--bp-text-primary)' : 'var(--bp-text-muted)' }">
                  Limpar filtros
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-menu>
      </brew-pilot-button>

      <!-- Busca -->
      <brew-pilot-search-input dense v-model="styleSearch" placeholder="Buscar por nome, código ou categoria..." class="col" />

      <!-- Limpar tudo -->
      <q-btn v-if="isFiltered" flat round dense icon="mdi-filter-remove" color="negative" size="sm"
        @click="clearFilters">
        <q-tooltip>Limpar todos os filtros</q-tooltip>
      </q-btn>
    </div>

    <!-- Chips de categorias ativas -->
    <div v-if="selectedCategories.size > 0" class="row q-gutter-xs q-mb-sm">
      <q-chip v-for="cat in activeCategoryChips" :key="cat.code" dense removable
        color="primary" text-color="white" size="sm" @remove="toggleCategory(cat.code)">
        {{ cat.name }}
      </q-chip>
    </div>

    <!-- ── Lista de estilos ─────────────────────────────────────── -->
    <div v-if="!filteredStyles.length" class="column items-center q-py-xl" style="color: var(--bp-text-muted)">
      <q-icon name="mdi-magnify-remove-outline" size="48px" class="q-mb-sm" />
      <div class="text-body1">Nenhum estilo encontrado</div>
      <div class="text-caption q-mt-xs">Tente mudar os filtros ou o termo de busca</div>
    </div>

    <!-- Agrupado por categoria -->
    <template v-else>
      <div v-for="group in groupedStyles" :key="group.categoryCode" class="q-mb-lg">

        <!-- Cabeçalho da categoria -->
        <div class="row items-center q-mb-xs" style="gap: 8px">
          <div class="text-overline text-weight-bold" style="color: var(--bp-text-muted); font-size: 10px">
            {{ group.categoryCode }} — {{ group.categoryName }}
          </div>
          <q-badge color="grey-6" text-color="white" :label="group.styles.length" style="font-size: 10px" />
          <div class="col" style="height: 1px; background: var(--bp-border)" />
          <span class="text-caption" style="color: var(--bp-text-muted); font-size: 10px">
            {{ group.source }}
          </span>
        </div>

        <!-- Cards dos estilos -->
        <div class="column q-gutter-xs">
          <div v-for="s in group.styles" :key="s.id" class="style-card"
            :class="{ 'style-card--expanded': expandedId === s.id }">

            <!-- Linha principal -->
            <div class="row items-center no-wrap style-card-header" @click="toggleExpand(s.id)">
              <!-- Faixa de cor EBC -->
              <div v-if="hasEbc(s)" class="ebc-strip" :style="{ background: ebcGradient(s) }" />
              <div v-else class="ebc-strip ebc-strip--empty" />

              <!-- Nome + código -->
              <div class="col" style="min-width: 0">
                <div class="row items-baseline no-wrap" style="gap: 6px">
                  <span class="text-body2 text-weight-medium ellipsis" style="color: var(--bp-text-primary)">
                    {{ s.name }}
                  </span>
                  <span class="text-caption" style="color: var(--bp-text-muted); flex-shrink: 0">{{ s.code }}</span>
                </div>
                <!-- Stats inline (desktop: tudo em linha; mobile: wrap) -->
                <div class="row items-center q-gutter-x-md q-mt-xs" style="flex-wrap: wrap; gap-y: 2px">
                  <span class="stat-inline">ABV {{ s.abvMin }}–{{ s.abvMax }}%</span>
                  <span class="stat-inline">IBU {{ s.ibuMin }}–{{ s.ibuMax }}</span>
                  <span class="stat-inline">OG {{ fmtOg(s.ogMin) }}–{{ fmtOg(s.ogMax) }}</span>
                  <span v-if="hasEbc(s)" class="stat-inline">EBC {{ s.ebcMin }}–{{ s.ebcMax }}</span>
                </div>
              </div>

              <!-- Exemplos comerciais (visível somente no desktop, truncado) -->
              <div class="gt-xs col-4 text-caption ellipsis q-mx-md"
                style="color: var(--bp-text-muted); min-width: 0"
                v-if="s.commercialExamples">
                <q-icon name="mdi-glass-mug-variant" size="11px" class="q-mr-xs" />
                {{ s.commercialExamples }}
              </div>

              <!-- Chevron -->
              <q-icon
                :name="expandedId === s.id ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                size="18px" color="grey-5" class="flex-shrink-0" />
            </div>

            <!-- Detalhe expandido -->
            <transition name="expand">
              <div v-if="expandedId === s.id" class="style-card-detail q-pt-sm">

                <div class="row q-col-gutter-lg">
                  <!-- Coluna esquerda: parâmetros + exemplos + fonte -->
                  <div class="col-12 col-sm-4">
                    <div class="detail-section-title q-mb-xs">Parâmetros</div>
                    <style-param-bar label="ABV"   :min="s.abvMin" :max="s.abvMax" :decimals="1" unit="%" />
                    <style-param-bar label="OG"    :min="s.ogMin"  :max="s.ogMax"  :decimals="3" />
                    <style-param-bar label="FG"    :min="s.fgMin"  :max="s.fgMax"  :decimals="3" />
                    <style-param-bar v-if="hasEbc(s)" label="EBC" :min="s.ebcMin" :max="s.ebcMax" :decimals="1" />
                    <style-param-bar label="IBU"   :min="s.ibuMin" :max="s.ibuMax" :decimals="0" />
                    <style-param-bar label="BU/GU" :min="buguMin(s)" :max="buguMax(s)" :decimals="2" />

                    <div v-if="s.commercialExamples" class="q-mt-sm">
                      <div class="detail-section-title q-mb-xs">Exemplos Comerciais</div>
                      <div class="text-body2" style="color: var(--bp-text-secondary); font-size: 12px">
                        {{ s.commercialExamples }}
                      </div>
                    </div>

                    <div v-if="s.source" class="q-mt-sm row items-center no-wrap" style="gap: 4px">
                      <q-icon name="mdi-information-outline" size="11px" color="grey-6" />
                      <span style="font-size: 10px; color: var(--bp-text-muted)">{{ s.source }}</span>
                    </div>
                  </div>

                  <!-- Coluna direita: textos descritivos em tabs -->
                  <div class="col-12 col-sm-8">
                    <q-tabs v-model="detailTab[s.id]" dense no-caps align="left"
                      active-color="primary" indicator-color="primary"
                      class="q-mb-sm" style="font-size: 12px">
                      <q-tab v-if="s.overallImpression" name="impression" label="Impressão Geral" />
                      <q-tab v-if="s.aroma"             name="aroma"      label="Aroma" />
                      <q-tab v-if="s.appearance"        name="appearance"  label="Aparência" />
                      <q-tab v-if="s.flavor"            name="flavor"     label="Sabor" />
                      <q-tab v-if="s.mouthfeel"         name="mouthfeel"  label="Sensação" />
                      <q-tab v-if="s.comments"          name="comments"   label="Comentários" />
                      <q-tab v-if="s.history"           name="history"    label="Histórico" />
                      <q-tab v-if="s.characteristicIngredients" name="ingredients" label="Ingredientes" />
                      <q-tab v-if="s.styleComparison"   name="comparison" label="Comparação" />
                    </q-tabs>
                    <q-tab-panels v-model="detailTab[s.id]" animated class="style-tab-panels">
                      <q-tab-panel name="impression" class="q-pa-none">
                        <p class="detail-text">{{ s.overallImpression }}</p>
                      </q-tab-panel>
                      <q-tab-panel name="aroma" class="q-pa-none">
                        <p class="detail-text">{{ s.aroma }}</p>
                      </q-tab-panel>
                      <q-tab-panel name="appearance" class="q-pa-none">
                        <p class="detail-text">{{ s.appearance }}</p>
                      </q-tab-panel>
                      <q-tab-panel name="flavor" class="q-pa-none">
                        <p class="detail-text">{{ s.flavor }}</p>
                      </q-tab-panel>
                      <q-tab-panel name="mouthfeel" class="q-pa-none">
                        <p class="detail-text">{{ s.mouthfeel }}</p>
                      </q-tab-panel>
                      <q-tab-panel name="comments" class="q-pa-none">
                        <p class="detail-text">{{ s.comments }}</p>
                      </q-tab-panel>
                      <q-tab-panel name="history" class="q-pa-none">
                        <p class="detail-text">{{ s.history }}</p>
                      </q-tab-panel>
                      <q-tab-panel name="ingredients" class="q-pa-none">
                        <p class="detail-text">{{ s.characteristicIngredients }}</p>
                      </q-tab-panel>
                      <q-tab-panel name="comparison" class="q-pa-none">
                        <p class="detail-text">{{ s.styleComparison }}</p>
                      </q-tab-panel>
                    </q-tab-panels>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </template>
  </brew-pilot-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import type { StyleGuide } from '@/types/recipe'
import { stylesService } from '@/services/styles.service'
import { srmToHex } from '@/composables/useBrewCalculator'
import StyleParamBar from '@/pages/recipes/components/StyleParamBar.vue'

const allStyles = stylesService.getAll()
const styleSearch = ref('')
const selectedCategories = ref<Set<string>>(new Set())
const expandedId = ref<string | null>(null)
const detailTab = reactive<Record<string, string>>({})

// ── Sources ───────────────────────────────────────────────────────────────
const allSources = [...new Set(allStyles.map(s => s.source).filter(Boolean) as string[])].sort()
const selectedSources = ref<Set<string>>(new Set(allSources))

// ── Filtros encadeados ─────────────────────────────────────────────────────
const stylesAfterSource = computed(() => {
  if (selectedSources.value.size === allSources.length) return allStyles
  return allStyles.filter(s => s.source && selectedSources.value.has(s.source))
})

const stylesAfterText = computed(() => {
  const q = styleSearch.value.toLowerCase().trim()
  if (!q) return stylesAfterSource.value
  return stylesAfterSource.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    (s.commercialExamples?.toLowerCase().includes(q) ?? false)
  )
})

const filteredStyles = computed(() => {
  if (!selectedCategories.value.size) return stylesAfterText.value
  return stylesAfterText.value.filter(s =>
    s.categoryCode && selectedCategories.value.has(s.categoryCode)
  )
})

const isFiltered = computed(() =>
  styleSearch.value.trim().length > 0 ||
  selectedCategories.value.size > 0 ||
  selectedSources.value.size < allSources.length
)

// ── Categorias ─────────────────────────────────────────────────────────────
const allCategoryChips = computed(() => {
  const map = new Map<string, { code: string; name: string; count: number }>()
  for (const s of stylesAfterSource.value) {
    const code = s.categoryCode ?? ''
    if (!code) continue
    const ex = map.get(code)
    if (ex) ex.count++
    else map.set(code, { code, name: s.category, count: 1 })
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code))
})

const activeCategoryChips = computed(() =>
  allCategoryChips.value.filter(c => selectedCategories.value.has(c.code))
)

// ── Agrupado por categoria para exibição ──────────────────────────────────
const groupedStyles = computed(() => {
  const map = new Map<string, {
    categoryCode: string
    categoryName: string
    source: string
    styles: StyleGuide[]
  }>()
  for (const s of filteredStyles.value) {
    const code = s.categoryCode ?? 'outros'
    if (!map.has(code)) {
      map.set(code, {
        categoryCode: code,
        categoryName: s.category,
        source: s.source ?? '',
        styles: [],
      })
    }
    map.get(code)!.styles.push(s)
  }
  return [...map.values()].sort((a, b) => a.categoryCode.localeCompare(b.categoryCode))
})

// ── Helpers ────────────────────────────────────────────────────────────────
function toggleCategory(code: string) {
  const next = new Set(selectedCategories.value)
  next.has(code) ? next.delete(code) : next.add(code)
  selectedCategories.value = next
}

function toggleSource(src: string) {
  const next = new Set(selectedSources.value)
  next.has(src) ? next.delete(src) : next.add(src)
  selectedSources.value = next
  const valid = new Set(allCategoryChips.value.map(c => c.code))
  selectedCategories.value = new Set([...selectedCategories.value].filter(c => valid.has(c)))
}

function clearFilters() {
  styleSearch.value = ''
  selectedCategories.value = new Set()
  selectedSources.value = new Set(allSources)
}

function toggleExpand(id: string) {
  if (expandedId.value === id) {
    expandedId.value = null
  } else {
    expandedId.value = id
    // inicializa tab padrão se não existir
    if (!detailTab[id]) {
      const s = allStyles.find(x => x.id === id)
      detailTab[id] = s?.overallImpression ? 'impression'
        : s?.aroma ? 'aroma'
        : s?.flavor ? 'flavor'
        : 'impression'
    }
  }
}

function hasEbc(s: StyleGuide): boolean {
  return s.ebcMin > 0 || s.ebcMax > 0
}

function ebcToHex(ebc: number): string {
  return srmToHex(Math.max(ebc / 1.97, 2))
}

function ebcGradient(s: StyleGuide): string {
  if (!hasEbc(s)) return 'transparent'
  const hexMin = ebcToHex(s.ebcMin)
  const hexMax = ebcToHex(s.ebcMax)
  return s.ebcMin === s.ebcMax ? hexMin : `linear-gradient(to right, ${hexMin}, ${hexMax})`
}

function fmtOg(v: number): string {
  return v.toFixed(3)
}

function buguMin(s: StyleGuide): number {
  const og = s.ogMin - 1
  return og ? Number((s.ibuMin / (og * 1000)).toFixed(2)) : 0
}

function buguMax(s: StyleGuide): number {
  const og = s.ogMax - 1
  return og ? Number((s.ibuMax / (og * 1000)).toFixed(2)) : 0
}
</script>

<style scoped>
/* ── Card de estilo ── */
.style-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s;
}
.style-card:hover,
.style-card--expanded {
  border-color: color-mix(in srgb, var(--q-primary) 40%, transparent);
}

.style-card-header {
  padding: 10px 12px 10px 0;
  cursor: pointer;
  gap: 10px;
}

/* Faixa de cor EBC na lateral esquerda */
.ebc-strip {
  width: 5px;
  align-self: stretch;
  flex-shrink: 0;
  border-radius: 0;
}
.ebc-strip--empty {
  background: var(--bp-border);
}

/* Detalhe expandido */
.style-card-detail {
  padding: 0 12px 12px 17px;
  border-top: 1px solid var(--bp-border);
}

/* Tab panels sem fundo */
.style-tab-panels {
  background: transparent !important;
}

/* Stats inline na linha resumo */
.stat-inline {
  font-size: 11px;
  color: var(--bp-text-muted);
  white-space: nowrap;
}

/* Texto de detalhe */
.detail-text {
  font-size: 13px;
  color: var(--bp-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.detail-section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--bp-text-muted);
  margin-bottom: 6px;
}

/* Transição expand/collapse */
.expand-enter-active,
.expand-leave-active {
  transition: max-height 0.22s ease, opacity 0.18s ease;
  max-height: 1200px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
