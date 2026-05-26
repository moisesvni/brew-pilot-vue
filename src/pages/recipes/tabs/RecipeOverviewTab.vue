<template>
  <div class="q-pa-md">
    <!-- ── HEADER: 3 CARDS ───────────────────────────────────────────────── -->
    <div class="row q-col-gutter-md q-mb-md">
      <!-- ╔══ CARD 1 — Receita ═══════════════════════════════════════════╗ -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card-dark">
          <q-card-section class="q-pa-sm" style="min-height: 170px;">
            <div class="row items-center no-wrap q-gutter-sm">
              <!-- Avatar / Swatch EBC -->
              <div class="recipe-thumb rounded-borders overflow-hidden flex flex-center flex-shrink-0 cursor-pointer"
                :style="{ backgroundColor: ebcToHex(stats?.ebc ?? 4) }" @click="imageDialog = true">
                <img v-if="recipe.imageUrl" :src="recipe.imageUrl" class="fit" style="object-fit:cover"
                  referrerpolicy="no-referrer" />
                <q-icon v-else name="mdi-beer" size="30px" color="white" style="opacity:.5" />
                <div class="thumb-overlay">
                  <q-icon name="mdi-camera" size="16px" color="white" />
                </div>
              </div>
              <!-- Campos direita -->
              <div class="col column q-gutter-none">
                <!-- Nome -->
                <div class="info-row">
                  <span class="info-label">Nome</span>
                  <q-input v-model="recipe.name" borderless dense class="info-input" placeholder="Nome da receita" />
                </div>
                <q-separator dark class="q-mb-xs" />
                <!-- Autor -->
                <div class="info-row">
                  <span class="info-label">Autor</span>
                  <span class="info-value">
                    {{ recipe.author ?? auth.user?.name ?? '—' }}
                  </span>
                </div>
                <!-- Tipo + Versão chips -->
                <div class="info-row">
                  <span class="info-label">Tipo</span>
                  <span class="info-value">
                    <q-btn no-caps dense unelevated size="md" color="grey-8" :label="typeLabel"
                      icon-right="mdi-menu-down" class="text-grey-3">
                      <q-menu dark>
                        <q-list dense style="min-width: 140px">
                          <q-item v-for="opt in typeOptions" :key="opt.value" clickable v-close-popup
                            :active="recipe.type === opt.value" active-class="text-amber"
                            @click="recipe.type = opt.value as import('../../../types/recipe').RecipeType">
                            <q-item-section>{{ opt.label }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </span>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card-dark">
          <q-card-section class="q-pa-sm">
            <!-- Header: ícone + nome + ações -->
            <div class="row items-center no-wrap q-mb-xs">
              <q-icon name="mdi-kettle" color="grey-5" size="24px" class="q-mr-xs flex-shrink-0" />
              <span class="text-caption text-weight-bold text-grey-2 ellipsis col">
                {{ recipe.equipmentProfile?.name ?? 'Equipamento não selecionado' }}
              </span>
              <div class="row q-gutter-xs flex-shrink-0">
                <!-- Redimensionar -->
                <q-btn flat round dense icon="mdi-resize" color="grey-5" @click="openResizeEquip">
                  <q-tooltip>Redimensionar lote</q-tooltip>
                </q-btn>
                <!-- Alterar equipamento -->
                <q-btn flat round dense icon="mdi-swap-horizontal" color="grey-5" @click="changeEquipDialog = true"
                  v-if="recipe.equipmentProfile?.name">
                  <q-tooltip>Alterar equipamento</q-tooltip>
                </q-btn>
                <!-- Editar equipamento -->
                <q-btn flat round dense icon="mdi-pencil" color="grey-5" @click="openEditEquip">
                  <q-tooltip>Editar equipamento</q-tooltip>
                </q-btn>
              </div>
            </div>
            <q-separator dark class="q-mb-xs" />

            <!-- Dados do lote — texto compacto -->
            <div class="column q-gutter-none">

              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-cup" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Volume do Lote</span>
                <span class="text-caption text-grey-3">{{ recipe.batchVolume }} L</span>
              </div>

              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-timer-outline" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Tempo de Fervura</span>
                <span class="text-caption text-grey-3">{{ recipe.boilTime }} min</span>
              </div>

              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-cup-outline" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Volume Pré Fervura</span>
                <span class="text-caption text-grey-3">{{ recipe.preBoilVolume }} L</span>
              </div>

              <div class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-percent" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Eficiência</span>
                <span class="text-caption text-grey-3">{{ recipe.efficiency }} %</span>
              </div>

              <div v-if="recipe.equipmentProfile?.mashEfficiency" class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-percent-outline" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Ef. da Mostura</span>
                <span class="text-caption text-grey-3">{{ recipe.equipmentProfile.mashEfficiency }} %</span>
              </div>

              <div v-if="recipe.equipmentProfile?.boilTemperature" class="row items-center no-wrap q-py-xs">
                <q-icon name="mdi-thermometer" size="12px" color="grey-6" class="q-mr-xs flex-shrink-0" />
                <span class="text-caption text-grey-6 col">Temp. de Fervura</span>
                <span class="text-caption text-grey-3">{{ recipe.equipmentProfile.boilTemperature }} °C</span>
              </div>

            </div>

          </q-card-section>
        </q-card>
      </div>

      <!-- ╔══ CARD 3 — Estilo ═════════════════════════════════════════════╗ -->
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card-dark full-height">
          <q-card-section>
            <!-- Cabeçalho estilo -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center no-wrap">
                <q-icon :name="recipe.styleGuide ? 'mdi-check-circle' : 'mdi-circle-outline'"
                  :color="recipe.styleGuide ? 'positive' : 'grey-6'" size="15px" class="q-mr-xs" />
                <span class="text-caption text-weight-bold ellipsis"
                  :class="recipe.styleGuide ? 'text-white' : 'text-grey-5'" style="max-width: 200px">
                  {{ recipe.styleGuide
                    ? `${recipe.styleGuide.code} ${recipe.styleGuide.name}`
                    : 'Nenhum estilo selecionado' }}
                </span>
              </div>
              <q-btn flat round dense size="xs" icon="mdi-pencil" color="grey-5" @click="styleDialog = true" />
            </div>

            <!-- Barras de range -->
            <template v-if="stats && recipe.styleGuide">
              <recipe-style-range-bar label="ABV" :current="stats.abv" :min="recipe.styleGuide.abvMin"
                :max="recipe.styleGuide.abvMax" :decimals="1" />
              <recipe-style-range-bar label="OG" :current="stats.og" :min="recipe.styleGuide.ogMin"
                :max="recipe.styleGuide.ogMax" :decimals="3" />
              <recipe-style-range-bar label="FG" :current="stats.fg" :min="recipe.styleGuide.fgMin"
                :max="recipe.styleGuide.fgMax" :decimals="3" />
              <recipe-style-range-bar label="EBC" :current="stats.ebc" :min="recipe.styleGuide.ebcMin"
                :max="recipe.styleGuide.ebcMax" :decimals="1" />
              <recipe-style-range-bar label="IBU" :current="stats.ibu" :min="recipe.styleGuide.ibuMin"
                :max="recipe.styleGuide.ibuMax" :decimals="0" />
              <recipe-style-range-bar label="BU/GU" :current="stats.buGuRatio"
                :min="Number((recipe.styleGuide.ibuMin / ((recipe.styleGuide.ogMin - 1) * 1000)).toFixed(2))"
                :max="Number((recipe.styleGuide.ibuMax / ((recipe.styleGuide.ogMax - 1) * 1000)).toFixed(2))"
                :decimals="2" />
            </template>
            <div v-else class="text-caption text-grey-6 q-mt-sm text-center q-py-md">
              <q-icon name="mdi-chart-bar" size="28px" class="q-mb-xs block" /><br>
              Selecione um estilo para ver a comparação
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <!-- ── SEÇÕES COLAPSÁVEIS ─────────────────────────────────────────────── -->
    <!-- Fermentáveis | Lúpulos -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <fermentables-card />
      </div>
      <div class="col-12 col-md-6">
        <hops-card />
      </div>
    </div>

    <!-- Diversos | Levedura -->
    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-6">
        <recipe-section title="Diversos" icon="mdi-flask-outline" icon-color="teal">
          <template #actions>
            <q-btn outline rounded dense no-caps label="+ ADICIONAR" color="amber" size="md"
              @click.stop="miscTabRef?.openPicker()" />
          </template>
          <recipe-misc-tab ref="miscTabRef" :hide-button="true" />
        </recipe-section>
      </div>
      <div class="col-12 col-md-6">
        <yeast-card />
      </div>
    </div>

    <!-- Mostura | Fermentação -->
    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12 col-md-6">
        <mash-card section="mash" />
      </div>
      <div class="col-12 col-md-6">
        <mash-card section="fermentation" />
      </div>
    </div>

    <!-- Água (full width – último) -->
    <div class="q-mt-sm">
      <water-card />
    </div>

    <!-- Outros (Tags, Anotações, Texto, Anexos) -->
    <div class="q-mt-sm">
      <others-card />
    </div>

    <!-- ── DIALOG: Foto da Receita ──────────────────────────────────────── -->
    <q-dialog v-model="imageDialog" persistent>
      <q-card dark class="bg-grey-10" style="width: 100%; max-width: 420px; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle2 text-white">Foto da Receita</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <!-- Prévia da imagem atual -->
        <q-card-section v-if="recipe.imageUrl" class="q-pt-sm q-pb-none">
          <div class="img-preview rounded-borders overflow-hidden">
            <img :src="recipe.imageUrl" style="width:100%; height:100%; object-fit:cover"
              referrerpolicy="no-referrer" />
          </div>
        </q-card-section>

        <!-- Uploader -->
        <q-card-section>
          <q-uploader flat bordered accept="image/*" :max-files="1" hide-upload-btn
            :label="recipe.imageUrl ? 'Substituir imagem' : 'Adicionar imagem'" class="full-width"
            style="border-radius: 8px" @added="onImageAdded" />
        </q-card-section>

        <!-- Remover -->
        <q-card-actions v-if="recipe.imageUrl" align="right" class="q-px-md q-pb-md q-pt-none">
          <q-btn flat no-caps dense icon="mdi-trash-can-outline" label="Remover foto" color="negative"
            @click="removeImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── DIALOG: Alterar Equipamento ───────────────────────────────────── -->
    <q-dialog v-model="changeEquipDialog">
      <q-card dark style="min-width: 320px; max-width: 480px; width: 100%" class="bg-dark">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle2 text-white">Alterar Equipamento</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-list separator dark>
            <q-item v-for="p in equipStore.profiles" :key="p.id" clickable v-ripple v-close-popup
              :active="recipe.equipmentProfileId === p.id" active-class="text-amber" @click="applyEquipment(p.id)">
              <q-item-section avatar>
                <q-icon name="mdi-kettle" :color="recipe.equipmentProfileId === p.id ? 'amber' : 'grey-6'" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ p.name }}</q-item-label>
                <q-item-label caption class="text-grey-5">
                  {{ p.batchVolume }} L · {{ p.boilTime }} min · {{ p.efficiency }}%
                </q-item-label>
              </q-item-section>
              <q-item-section side v-if="recipe.equipmentProfileId === p.id">
                <q-icon name="mdi-check-circle" color="positive" />
              </q-item-section>
            </q-item>
            <q-item v-if="!equipStore.profiles.length">
              <q-item-section class="text-grey-5 text-caption">Nenhum equipamento cadastrado</q-item-section>
            </q-item>
          </q-list>
          <q-btn v-if="recipe.equipmentProfileId" flat dense no-caps size="sm" color="grey-6"
            icon="mdi-close-circle-outline" label="Remover equipamento" class="q-mt-sm" v-close-popup
            @click="applyEquipment(null)" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ── DIALOG: Redimensionar Lote ──────────────────────────────────── -->
    <q-dialog v-model="resizeEquipDialog">
      <q-card dark class="bg-dark" style="min-width: 300px; max-width: 380px; width: 100%">
        <q-card-section class="row items-center">
          <div class="text-subtitle2 text-white">Redimensionar</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-separator dark />
        <q-card-section class="column q-gutter-md q-pt-md">
          <q-input v-model.number="resizeForm.batchVolume" type="number" outlined dense dark
            label="Volume do Lote (Fermentador)" suffix="L" />
          <q-input v-model.number="resizeForm.efficiency" type="number" outlined dense dark
            label="Eficiência do Equipamento" suffix="%" />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn unelevated no-caps label="Redimensionar" color="positive" text-color="white" class="full-width"
            @click="saveResize" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── DIALOG: Editar Equipamento ────────────────────────────────────── -->
    <q-dialog v-model="editEquipDialog">
      <q-card dark class="bg-dark eq-dialog">

        <!-- Header fixo -->
        <div class="row items-center no-wrap q-py-sm q-px-md eq-header">
          <div class="text-subtitle1 text-weight-bold text-white">Editar Perfil de Equipamento</div>
          <q-space />
          <q-btn flat round dense icon="mdi-help-circle-outline" color="grey-5">
            <q-tooltip>Ajuda sobre campos de equipamento</q-tooltip>
          </q-btn>
          <q-btn flat round dense :icon="editEquipForm.isDefault ? 'mdi-star' : 'mdi-star-outline'"
            :color="editEquipForm.isDefault ? 'amber' : 'grey-5'"
            @click="editEquipForm.isDefault = !editEquipForm.isDefault">
            <q-tooltip>{{ editEquipForm.isDefault ? 'Equipamento padrão' : 'Definir como padrão' }}</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="close" v-close-popup />
        </div>
        <q-separator dark />

        <!-- Body rolável -->
        <div class="eq-body q-pa-md">

          <!-- Nome + Tempo + Descrição -->
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-7">
              <q-input v-model="editEquipForm.name" outlined dense dark label="Nome" />
            </div>
            <div class="col-12 col-sm-5">
              <q-input v-model.number="editEquipForm.boilTime" type="number" outlined dense dark
                label="Tempo de Fervura" suffix="min" />
            </div>
            <div class="col-12">
              <q-input v-model="editEquipForm.notes" type="textarea" :rows="3" outlined dense dark label="Descrição"
                autogrow />
            </div>
          </div>

          <!-- ─ Volumes ────────────────────────────────────────── -->
          <div class="eq-card q-mb-sm">
            <div class="eq-card-title">Volumes</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-select v-model="editEquipForm.mashWaterMethod" :options="['Fermentador', 'Panela de Fervura']"
                  outlined dense dark options-dark label="Volume Desejado do Lote" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.batchVolume" type="number" outlined dense dark
                  label="Volume do Lote (Fermentador)" suffix="L" />
              </div>
              <div class="col-12">
                <q-checkbox v-model="editEquipForm.calculateBoilVolume" dark dense label="Calcular volume de fervura"
                  color="positive" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input :model-value="editEquipForm.calculateBoilVolume ? calcPreBoilVol : editEquipForm.preBoilVolume"
                  @update:model-value="v => { if (!editEquipForm.calculateBoilVolume) editEquipForm.preBoilVolume = +(v ?? 0) }"
                  type="number" outlined dense dark
                  :label="editEquipForm.calculateBoilVolume ? 'Volume Pré Fervura (calculado)' : 'Volume Pré Fervura'"
                  suffix="L" :disable="editEquipForm.calculateBoilVolume" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.boilOffRate" type="number" step="0.1" outlined dense dark
                  :label="`Evaporação (${evapPct}%)`" suffix="L/h" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.trubLoss" type="number" step="0.1" outlined dense dark
                  label="Perda Trub/Chiller" suffix="L" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.deadSpace" type="number" step="0.1" outlined dense dark
                  label="Espaço Morto Panela de Mostura" suffix="L" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.mashLoss" type="number" step="0.1" outlined dense dark
                  label="Perda na Panela de Mostura" suffix="L" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.spargeDeadSpace" type="number" step="0.1" outlined dense dark
                  label="Espaço Morto Panela de Lavagem" suffix="L" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.fermentorLoss" type="number" step="0.1" outlined dense dark
                  label="Perda no Fermentador" suffix="L" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.fermenterWater" type="number" step="0.1" outlined dense dark
                  label="Água no Fermentador" suffix="L" />
              </div>
              <div class="col-12">
                <div class="eq-info-row">
                  <span>Volume Pós Fervura: <strong>{{ postBoilVol }} L</strong></span>
                  <span>Volume de Engarrafamento: <strong>{{ bottlingVol }} L</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- ─ Eficiência ─────────────────────────────────────── -->
          <div class="eq-card q-mb-sm">
            <div class="eq-card-title">Eficiência</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.efficiency" type="number" step="0.1" outlined dense dark
                  label="Eficiência do Equipamento" suffix="%" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="editEquipForm.calculateMashEfficiency ? calcMashEff : editEquipForm.mashEfficiency"
                  @update:model-value="v => { if (!editEquipForm.calculateMashEfficiency) editEquipForm.mashEfficiency = +(v ?? 0) }"
                  type="number" step="0.1" outlined dense dark
                  :label="editEquipForm.calculateMashEfficiency ? 'Eficiência da Mostura (calculada)' : 'Eficiência da Mostura'"
                  suffix="%" :disable="editEquipForm.calculateMashEfficiency" />
              </div>
              <div class="col-12">
                <q-checkbox v-model="editEquipForm.calculateMashEfficiency" dark dense
                  label="Calcular eficiência da mostura" color="positive" />
              </div>
            </div>
          </div>

          <!-- ─ Avançado ────────────────────────────────────────── -->
          <div class="eq-card q-mb-sm">
            <div class="eq-card-title">Avançado</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.hopUtilization" type="number" outlined dense dark
                  label="Multiplicador Utilização de Lúpulo" suffix="%" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.aromaHopUtilization" type="number" outlined dense dark
                  :label="editEquipForm.calculateAromaHopUtil ? 'Utilização Lúpulo Aroma (calculada)' : 'Utilização Lúpulo de Aroma'"
                  suffix="%" :disable="editEquipForm.calculateAromaHopUtil" />
              </div>
              <div class="col-12">
                <q-checkbox v-model="editEquipForm.calculateAromaHopUtil" dark dense
                  label="Calcular utilização de lúpulo de aroma" color="positive" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.hopstandTemperature" type="number" outlined dense dark
                  label="Temperatura de Hopstand" suffix="°C" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.whirlpoolTime" type="number" outlined dense dark
                  label="Tempo Whirlpool / No-Chill" suffix="min" />
              </div>
            </div>
          </div>

          <!-- ─ Altitude / Temperatura da Fervura ──────────────────── -->
          <div class="eq-card q-mb-sm">
            <div class="eq-card-title">Altitude / Temperatura da Fervura</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-checkbox v-model="editEquipForm.altitudeAdjust" dark dense label="Ajuste de altitude"
                  color="positive" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.altitude" type="number" outlined dense dark label="Altitude"
                  suffix="m" :disable="!editEquipForm.altitudeAdjust" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input :model-value="editEquipForm.altitudeAdjust ? calcBoilTemp : editEquipForm.boilTemperature"
                  @update:model-value="v => { if (!editEquipForm.altitudeAdjust) editEquipForm.boilTemperature = +(v ?? 0) }"
                  type="number" step="0.1" outlined dense dark
                  :label="editEquipForm.altitudeAdjust ? 'Temperatura de Fervura (calculada)' : 'Temperatura de Fervura'"
                  suffix="°C" :disable="editEquipForm.altitudeAdjust" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.boilExpansion" type="number" step="0.1" outlined dense dark
                  label="Contração/Expansão por Fervura" suffix="%" />
              </div>
            </div>
          </div>

          <!-- ─ Água de Mostura/Lavagem ─────────────────────────────── -->
          <div class="eq-card q-mb-md">
            <div class="eq-card-title">Água de Mostura / Lavagem</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.grainAbsorptionRate" type="number" step="0.01" outlined dense
                  dark label="Taxa de Absorção de Grãos" suffix="L/kg" />
              </div>
              <div class="col-12 col-sm-6">
                <q-input v-model.number="editEquipForm.waterToGrainRatio" type="number" step="0.1" outlined dense dark
                  label="Relação Água/Grão" suffix="L/kg" />
              </div>
              <div class="col-12">
                <q-select v-model="editEquipForm.mashWaterMethod"
                  :options="['Padrão', 'Por Relação Água/Grão', 'Manual']" outlined dense dark options-dark
                  label="Método de Cálculo da Água Mostura/Lavagem" />
              </div>
            </div>
          </div>

        </div><!-- fim do scroll -->

        <q-separator dark />
        <div class="row items-center q-px-md q-py-sm eq-footer">
          <q-btn flat no-caps label="COPIAR" color="grey-5" @click="copyEquip" />
          <q-space />
          <q-btn flat no-caps label="ALTERAR" color="grey-4" v-close-popup />
          <q-btn unelevated no-caps label="SALVAR" color="positive" @click="saveEditEquip" />
        </div>
      </q-card>
    </q-dialog>

    <!-- ── DIALOG: Seletor de Estilo ──────────────────────────────────────── -->
    <q-dialog v-model="styleDialog" maximized>
      <q-card class="bg-dark-page column" style="max-width: 560px; width: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-white">Selecionar Estilo BJCP</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input v-model="styleSearch" outlined dense placeholder="Buscar estilo (ex: IPA, Stout, 12C...)"
            bg-color="dark" class="q-mb-md">
            <template #prepend><q-icon name="search" /></template>
          </q-input>

          <div v-if="stylesLoading" class="text-center q-py-lg">
            <q-spinner color="amber" size="32px" />
          </div>
          <div v-else-if="!filteredStyles.length" class="text-grey-5 text-center q-py-lg">
            Nenhum estilo encontrado
          </div>
          <q-list v-else separator style="max-height: 60vh; overflow-y: auto">
            <q-item v-for="s in filteredStyles" :key="s.id" clickable v-ripple :active="recipe.styleGuideId === s.id"
              active-class="bg-amber-2 text-dark" @click="selectStyle(s)">
              <q-item-section>
                <q-item-label class="text-weight-medium">
                  <span class="text-amber-8">{{ s.code }}</span>
                  {{ s.name }}
                </q-item-label>
                <q-item-label caption class="text-grey-5">
                  {{ s.category }} ·
                  ABV {{ s.abvMin }}–{{ s.abvMax }}% ·
                  IBU {{ s.ibuMin }}–{{ s.ibuMax }}
                </q-item-label>
              </q-item-section>
              <q-item-section side v-if="recipe.styleGuideId === s.id">
                <q-icon name="check_circle" color="positive" />
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="stylesError" class="text-negative text-caption q-mt-sm">
            {{ stylesError }}
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRecipeStore } from '../../../stores/recipeStore'
import { useAuthStore } from '../../../stores/authStore'
import { useEquipmentStore } from '../../../stores/equipmentStore'
import type { Recipe, RecipeStats, StyleGuide } from '../../../types/recipe'
import RecipeStyleRangeBar from '../components/RecipeStyleRangeBar.vue'
import StatChip from '../../../components/shared/StatChip.vue'
import { sampleStyles } from '../../../data/styles-sample'
import RecipeSection from '../components/RecipeSection.vue'
import RecipeMiscTab from './RecipeMiscTab.vue'
import FermentablesCard from '../components/overview/FermentablesCard.vue'
import HopsCard from '../components/overview/HopsCard.vue'
import YeastCard from '../components/overview/YeastCard.vue'
import MashCard from '../components/overview/MashCard.vue'
import WaterCard from '../components/overview/WaterCard.vue'
import OthersCard from '../components/overview/OthersCard.vue'
import apiClient from '../../../services/apiClient'

const store = useRecipeStore()
const recipe = computed(() => store.currentRecipe!)
const stats = computed(() => store.stats)

const miscTabRef = ref<InstanceType<typeof RecipeMiscTab> | null>(null)

const auth = useAuthStore()
const equipStore = useEquipmentStore()

onMounted(() => { if (!equipStore.profiles.length) equipStore.fetchAll() })

// ── Equipamento ──────────────────────────────────────────────────────────────
const equipmentOptions = computed(() =>
  equipStore.profiles.map(p => ({ label: p.name, value: p.id }))
)

function applyEquipment(id: string | null) {
  recipe.value.equipmentProfileId = id ?? undefined
  const profile = id ? equipStore.profiles.find(p => p.id === id) : null
  recipe.value.equipmentProfile = profile ?? undefined
  if (profile) {
    recipe.value.batchVolume = profile.batchVolume
    recipe.value.preBoilVolume = profile.preBoilVolume
    recipe.value.boilTime = profile.boilTime
    recipe.value.efficiency = profile.efficiency
  }
}

// ── Tipo da receita ──────────────────────────────────────────────────────────
const typeOptions = [
  { label: 'All Grain', value: 'AllGrain' },
  { label: 'Parcial', value: 'PartialMash' },
  { label: 'Extrato', value: 'Extract' },
]
const typeLabel = computed(() => typeOptions.find(o => o.value === recipe.value.type)?.label ?? recipe.value.type)
// ── Upload de imagem ────────────────────────────────────────────────────────
const imageDialog = ref(false)

function onImageAdded(files: readonly any[]) {
  const file: File = files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    recipe.value.imageUrl = e.target?.result as string
    imageDialog.value = false
    // TODO: fazer upload para o servidor e substituir pelo URL remoto
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  recipe.value.imageUrl = undefined
  imageDialog.value = false
}

// ── Dialogs de equipamento ───────────────────────────────────────────────────
const changeEquipDialog = ref(false)
const editEquipDialog = ref(false)
const resizeEquipDialog = ref(false)

const resizeForm = ref({ batchVolume: 20, efficiency: 72 })

function openResizeEquip() {
  resizeForm.value.batchVolume = recipe.value.batchVolume
  resizeForm.value.efficiency = recipe.value.efficiency
  resizeEquipDialog.value = true
}

function saveResize() {
  recipe.value.batchVolume = resizeForm.value.batchVolume
  recipe.value.efficiency = resizeForm.value.efficiency
  resizeEquipDialog.value = false
}

const editEquipForm = ref({
  name: '',
  batchVolume: 20, preBoilVolume: 24, boilTime: 60, efficiency: 72,
  mashEfficiency: 76, boilTemperature: 100, boilOffRate: 4,
  trubLoss: 2, fermentorLoss: 1, deadSpace: 1, mashTunVolume: 30,
  notes: '' as string | undefined,
  isDefault: false,
  // Volumes avançados
  mashLoss: 0,
  spargeDeadSpace: undefined as number | undefined,
  fermenterWater: undefined as number | undefined,
  calculateBoilVolume: false,
  // Eficiência
  calculateMashEfficiency: false,
  // Lúpulo / Hopstand
  hopUtilization: 100,
  aromaHopUtilization: 76,
  calculateAromaHopUtil: true,
  hopstandTemperature: 96,
  whirlpoolTime: 20,
  // Altitude / Fervura
  altitudeAdjust: false,
  altitude: undefined as number | undefined,
  boilExpansion: 4,
  // Água de mostura
  grainAbsorptionRate: 0.8,
  waterToGrainRatio: 3.0,
  mashWaterMethod: 'Padrão',
})

// Computed de volumes
const calcPreBoilVol = computed(() => {
  const f = editEquipForm.value
  const evap = (f.boilOffRate * f.boilTime) / 60
  return +(f.batchVolume + f.trubLoss + f.fermentorLoss + evap).toFixed(2)
})
const postBoilVol = computed(() => {
  return +(editEquipForm.value.batchVolume + editEquipForm.value.trubLoss).toFixed(2)
})
const bottlingVol = computed(() => {
  return +(editEquipForm.value.batchVolume - editEquipForm.value.fermentorLoss).toFixed(2)
})
const evapPct = computed(() => {
  const f = editEquipForm.value
  const preBoil = f.calculateBoilVolume ? calcPreBoilVol.value : f.preBoilVolume
  if (!preBoil) return 0
  const evap = (f.boilOffRate * f.boilTime) / 60
  return +(evap / preBoil * 100).toFixed(1)
})
const calcMashEff = computed(() => {
  const f = editEquipForm.value
  const preBoil = f.calculateBoilVolume ? calcPreBoilVol.value : f.preBoilVolume
  if (!preBoil || !f.batchVolume) return f.mashEfficiency
  return +(f.efficiency * preBoil / f.batchVolume).toFixed(1)
})
const calcBoilTemp = computed(() => {
  const alt = editEquipForm.value.altitude ?? 0
  return +(100 - alt * 0.0034).toFixed(1)
})

// Sincronizar preBoilVolume quando calculateBoilVolume estiver ativo
watch(calcPreBoilVol, (v) => {
  if (editEquipForm.value.calculateBoilVolume) editEquipForm.value.preBoilVolume = v
})

function openEditEquip() {
  const p = recipe.value.equipmentProfile
  editEquipForm.value = p
    ? { ...editEquipForm.value, ...p, notes: p.notes ?? '' }
    : {
      ...editEquipForm.value,
      name: '',
      batchVolume: recipe.value.batchVolume,
      preBoilVolume: recipe.value.preBoilVolume ?? 24,
      boilTime: recipe.value.boilTime,
      efficiency: recipe.value.efficiency,
    }
  editEquipDialog.value = true
}

function saveEditEquip() {
  recipe.value.batchVolume = editEquipForm.value.batchVolume
  recipe.value.preBoilVolume = editEquipForm.value.calculateBoilVolume
    ? calcPreBoilVol.value
    : editEquipForm.value.preBoilVolume
  recipe.value.boilTime = editEquipForm.value.boilTime
  recipe.value.efficiency = editEquipForm.value.efficiency
  if (recipe.value.equipmentProfile) {
    Object.assign(recipe.value.equipmentProfile, editEquipForm.value)
  }
  editEquipDialog.value = false
}

function copyEquip() {
  editEquipForm.value.name = editEquipForm.value.name + ' (Cópia)'
}

// ── Estilo BJCP ──────────────────────────────────────────────────────────────
const styleDialog = ref(false)
const styleSearch = ref('')
const styles = ref<StyleGuide[]>([])
const stylesLoading = ref(false)
const stylesError = ref<string | null>(null)

watch(styleDialog, async (open) => {
  if (open && styles.value.length === 0) {
    stylesLoading.value = true
    stylesError.value = null
    try {
      const { data } = await apiClient.get<StyleGuide[]>('/styles')
      styles.value = data
    } catch {
      // Fallback local para desenvolvimento sem API
      styles.value = sampleStyles
    } finally {
      stylesLoading.value = false
    }
  }
})

const filteredStyles = computed(() => {
  const q = styleSearch.value.toLowerCase().trim()
  if (!q) return styles.value
  return styles.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q)
  )
})

function selectStyle(s: StyleGuide) {
  recipe.value.styleGuideId = s.id
  recipe.value.styleGuide = s
  styleDialog.value = false
}

// ── Cor EBC → Hex ────────────────────────────────────────────────────────────
function ebcToHex(ebc: number): string {
  const srm = ebc / 1.97
  if (srm < 2) return '#F7E697'; if (srm < 4) return '#ECD26E'
  if (srm < 6) return '#D4A830'; if (srm < 9) return '#BF7A15'
  if (srm < 14) return '#9A4A08'; if (srm < 17) return '#7D2E04'
  if (srm < 20) return '#651E02'; if (srm < 24) return '#4E1001'
  if (srm < 30) return '#370800'; if (srm < 35) return '#220400'
  return '#120100'
}
</script>

<style scoped>
/* Cards do header */
.card-dark {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

/* ── Card 1: Receita ──────────────────────────────────────────────────────── */
.recipe-thumb {
  width: 115px;
  height: 115px;
  flex-shrink: 0;
  position: relative;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.15s;
}

.recipe-thumb:hover .thumb-overlay {
  opacity: 1;
}

/* Prévia de imagem no dialog */
.img-preview {
  width: 100%;
  height: 220px;
  background: #111;
}

/* Linhas label + valor */
.info-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-height: 24px;
}

.info-label {
  font-size: 12px;
  color: #888;
  width: 42px;
  flex-shrink: 0;
  padding-top: 4px;
}

.info-value {
  font-size: 13px;
  color: #e0e0e0;
}

.info-input {
  flex: 1;
}

.info-input :deep(.q-field__control) {
  padding: 0;
  min-height: 26px;
}

.info-input :deep(input) {
  font-size: 13px;
  color: #e0e0e0;
  padding: 0;
}

/* Card 2: layout via classes Quasar — sem CSS adicional */

/* ── Dialog Editar Equipamento ──────────────────────────────────────────── */
.eq-dialog {
  width: 100%;
  max-width: 680px;
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.eq-header,
.eq-footer {
  flex-shrink: 0;
}

/* Body: ocupa espaço restante e rola com scrollbar discreta */
.eq-body {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

.eq-body::-webkit-scrollbar {
  width: 5px;
}

.eq-body::-webkit-scrollbar-track {
  background: transparent;
}

.eq-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.14);
  border-radius: 3px;
}

/* Card de seção */
.eq-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px 12px 14px;
}

.eq-card-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.38);
  margin-bottom: 10px;
}

/* Linha de info calculada (volumes) */
.eq-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.48);
  padding-top: 4px;
}

.eq-info-row strong {
  color: rgba(255, 255, 255, 0.82);
}
</style>
