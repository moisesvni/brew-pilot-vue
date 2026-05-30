<template>
  <brew-pilot-dialog
    v-model="open"
    title="Guia de Mostura"
    icon="mdi-book-open-variant"
    icon-color="primary"
    width="660px"
    scrollable
  >
    <div class="guide-body q-pa-md">

      <!-- ── Introdução ──────────────────────────────────────────── -->
      <div class="guide-intro q-mb-lg">
        <div class="guide-intro-text">
          A <strong>mostura</strong> é o processo de misturar o malte moído com água quente para ativar enzimas
          que convertem o amido em açúcares fermentáveis. A temperatura e o tempo de cada repouso determinam
          diretamente o perfil de fermentabilidade, o corpo, a limpidez e os sabores da sua cerveja.
          Cada faixa de temperatura ativa enzimas específicas — entender isso é o que separa uma cerveja boa de uma excepcional.
        </div>
      </div>

      <!-- ── Diagrama SVG de faixas ────────────────────────────── -->
      <div class="guide-diagram q-mb-lg">
        <div class="guide-section-title q-mb-sm">Mapa de Temperatura × Enzimas</div>
        <div class="guide-diagram-wrap">
          <svg viewBox="0 0 580 70" width="580" height="70" style="width:100%;height:auto;overflow:visible">
            <!-- faixas coloridas -->
            <rect x="0"   y="10" width="35"  height="30" rx="2" fill="#4caf50" fill-opacity="0.35"/>
            <rect x="37"  y="10" width="30"  height="30" rx="2" fill="#66bb6a" fill-opacity="0.35"/>
            <rect x="69"  y="10" width="25"  height="30" rx="2" fill="#ffd54f" fill-opacity="0.35"/>
            <rect x="96"  y="10" width="55"  height="30" rx="2" fill="#ffb300" fill-opacity="0.35"/>
            <rect x="153" y="10" width="50"  height="30" rx="2" fill="#ff9800" fill-opacity="0.40"/>
            <rect x="205" y="10" width="45"  height="30" rx="2" fill="#fb8c00" fill-opacity="0.45"/>
            <rect x="252" y="10" width="50"  height="30" rx="2" fill="#ef6c00" fill-opacity="0.45"/>
            <rect x="304" y="10" width="45"  height="30" rx="2" fill="#f44336" fill-opacity="0.40"/>
            <rect x="351" y="10" width="229" height="30" rx="2" fill="#9e9e9e" fill-opacity="0.20"/>
            <!-- labels de temperatura no eixo inferior -->
            <text x="0"   y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">35°</text>
            <text x="37"  y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">40°</text>
            <text x="69"  y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">43°</text>
            <text x="96"  y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">48°</text>
            <text x="153" y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">60°</text>
            <text x="205" y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">65°</text>
            <text x="252" y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">68°</text>
            <text x="304" y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">72°</text>
            <text x="351" y="65" font-size="8" fill="var(--bp-text-muted)" text-anchor="middle">76°C</text>
            <!-- nomes abreviados dentro das faixas -->
            <text x="17"  y="29" font-size="7.5" fill="var(--bp-text-primary)" text-anchor="middle">Ácido</text>
            <text x="52"  y="29" font-size="7.5" fill="var(--bp-text-primary)" text-anchor="middle">β-Glu.</text>
            <text x="81"  y="29" font-size="7.5" fill="var(--bp-text-primary)" text-anchor="middle">Ferúl.</text>
            <text x="123" y="29" font-size="7.5" fill="var(--bp-text-primary)" text-anchor="middle">Proteína</text>
            <text x="178" y="29" font-size="7.5" fill="var(--bp-text-primary)" text-anchor="middle">β-Amil.</text>
            <text x="228" y="29" font-size="7.5" fill="var(--bp-text-primary)" text-anchor="middle">α+β</text>
            <text x="277" y="29" font-size="7.5" fill="var(--bp-text-primary)" text-anchor="middle">α-Amil.</text>
            <text x="327" y="29" font-size="7.5" fill="var(--bp-text-primary)" text-anchor="middle">Mash Out</text>
            <text x="466" y="29" font-size="7.5" fill="var(--bp-text-muted)" text-anchor="middle">Enzimas inativas</text>
          </svg>
        </div>
      </div>

      <!-- ── Cards de Repouso ──────────────────────────────────── -->
      <div class="guide-section-title q-mb-sm">Tipos de Repouso</div>
      <div class="column q-gutter-sm q-mb-lg">

        <div v-for="rest in restGuide" :key="rest.name" class="guide-card">
          <div class="row items-start no-wrap" style="gap: 12px">
            <div class="guide-card-badge" :style="{ background: rest.badgeBg, color: rest.badgeColor }">
              {{ rest.tempRange }}
            </div>
            <div class="col">
              <div class="row items-center no-wrap q-mb-xs" style="gap: 8px">
                <span class="guide-card-name">{{ rest.name }}</span>
                <span v-if="rest.enzyme" class="guide-card-enzyme">{{ rest.enzyme }}</span>
              </div>
              <div class="guide-card-desc q-mb-xs">{{ rest.desc }}</div>
              <div class="guide-card-tip">
                <q-icon name="mdi-lightbulb-outline" size="12px" class="q-mr-xs" style="color: var(--q-primary)" />
                {{ rest.tip }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Seção Rampa ───────────────────────────────────────── -->
      <div class="guide-section-title q-mb-sm">Tempo de Rampa</div>
      <div class="guide-ramp-section q-mb-lg">
        <p class="guide-body-text">
          O <strong>tempo de rampa</strong> é o período necessário para que o mosto suba de uma temperatura para a próxima.
          Durante a rampa, o mosto passa pelas faixas intermediárias — o que significa que enzimas dessas faixas
          também atuarão brevemente. Uma rampa mais longa pode ser intencional (aproveitar o repouso de proteína
          durante a subida, por exemplo) ou técnica (limitação do equipamento).
        </p>
        <div class="column q-gutter-xs">
          <div class="guide-ramp-item">
            <q-icon name="mdi-fire" color="red-5" size="16px" class="q-mr-sm flex-shrink-0" />
            <div><strong>Chama direta:</strong> rampas rápidas (2–5 min), risco de queimar o fundo sem agitação.</div>
          </div>
          <div class="guide-ramp-item">
            <q-icon name="mdi-water-thermometer" color="blue-5" size="16px" class="q-mr-sm flex-shrink-0" />
            <div><strong>HERMS/RIMS:</strong> rampas lentas e precisas (5–20 min), ideal para step mash controlado.</div>
          </div>
          <div class="guide-ramp-item">
            <q-icon name="mdi-cup-water" color="amber-7" size="16px" class="q-mr-sm flex-shrink-0" />
            <div><strong>Infusão adicional:</strong> adicionar água fervente para subir temperatura sem equipamento especial.</div>
          </div>
          <div class="guide-ramp-item">
            <q-icon name="mdi-pot-steam" color="orange-7" size="16px" class="q-mr-sm flex-shrink-0" />
            <div><strong>Decocção:</strong> retirar parte do mosto, ferver e devolver — eleva temperatura e cria melanoidinas.</div>
          </div>
        </div>
      </div>

      <!-- ── Seção Mash Out ────────────────────────────────────── -->
      <div class="guide-section-title q-mb-sm">Por que fazer Mash Out?</div>
      <div class="guide-body-text q-mb-lg">
        O Mash Out eleva o mosto a 75–78°C, temperatura em que todas as enzimas são desnaturadas.
        Isso <strong>congela a fermentabilidade</strong> — o mosto não muda mais de composição enquanto você drena.
        Além disso, reduz a viscosidade, melhorando a velocidade da filtragem.
        Para cervejas com mash único curto (&lt;60 min), o Mash Out tem impacto ainda maior.
      </div>

      <!-- ── Seção Decocção ─────────────────────────────────────── -->
      <div class="guide-section-title q-mb-sm">Decocção</div>
      <div class="guide-body-text q-mb-lg">
        Técnica tradicional de lagers e cervejas alemãs. Retira-se 1/3 do mosto mais espesso (rico em grãos),
        ferve-se separadamente por 15–20 minutos e reintroduz-se na tina para elevar a temperatura.
        A fervura carameliza amidos residuais, criando <strong>melanoidinas</strong> que adicionam
        cor âmbar, corpo e um sabor característico de pão/biscoito impossível de replicar com apenas maltes.
        Demanda mais tempo e atenção, mas é essencial para estilos como Märzen, Helles e Dunkel tradicionais.
      </div>

      <!-- ── Dicas rápidas ──────────────────────────────────────── -->
      <div class="guide-tips">
        <div class="guide-section-title q-mb-xs">Dicas Rápidas</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <div class="guide-tip-card">
              <q-icon name="mdi-beer" color="primary" size="18px" class="q-mb-xs" />
              <div class="guide-tip-title">Cerveja seca e fácil de fermentar</div>
              <div class="guide-tip-body">Mosture em 63–65°C por 60–75 min. A β-amilase predomina e produz maltose.</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="guide-tip-card">
              <q-icon name="mdi-cup" color="primary" size="18px" class="q-mb-xs" />
              <div class="guide-tip-title">Cerveja encorpada</div>
              <div class="guide-tip-body">Mosture em 69–72°C. A α-amilase produz dextrinas — mais corpo, menos fermentável.</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="guide-tip-card">
              <q-icon name="mdi-wheat" color="primary" size="18px" class="q-mb-xs" />
              <div class="guide-tip-title">Trigo e aveia</div>
              <div class="guide-tip-body">Adicione repouso de β-glucano (40–45°C, 15 min) para melhorar a filtragem e reduzir nebulosidade indesejada.</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="guide-tip-card">
              <q-icon name="mdi-weather-sunny" color="primary" size="18px" class="q-mb-xs" />
              <div class="guide-tip-title">Weizen com cravo</div>
              <div class="guide-tip-body">Repouso Ferulic Acid a 43–45°C por 10–15 min libera precursores de 4-vinyl guaiacol — o aroma de cravo.</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <template #footer>
      <div class="row justify-end q-px-md q-py-sm">
        <brew-pilot-button variant="outline" no-caps label="Fechar" @click="open = false" />
      </div>
    </template>
  </brew-pilot-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()
const open = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })

const restGuide = [
  {
    name: 'Repouso Ácido',
    tempRange: '35–40°C',
    enzyme: 'Fitase',
    badgeBg: '#4caf5026',
    badgeColor: '#388e3c',
    desc: 'Ativa a fitase, que libera ácido fítico e reduz naturalmente o pH do mosto. Também dissolve cálcio e magnésio da casca do malte.',
    tip: 'Útil quando a água é muito calcária ou você não quer adicionar ácidos. Raramente necessário com maltes modernos bem modificados.',
  },
  {
    name: 'Repouso de Beta-Glucano',
    tempRange: '38–45°C',
    enzyme: 'β-Glucanase',
    badgeBg: '#66bb6a26',
    badgeColor: '#2e7d32',
    desc: 'Degrada beta-glucanos — polissacarídeos que tornam o mosto viscoso e dificultam a filtragem. Essencial para receitas com centeio, aveia ou trigo não malteado em altas proporções.',
    tip: 'Se a sua receita tem >20% de adjuntos não malteados e a filtração está lenta, este repouso resolve o problema.',
  },
  {
    name: 'Repouso de Ácido Ferúlico',
    tempRange: '43–45°C',
    enzyme: '— (liberação de precursor)',
    badgeBg: '#ffd54f26',
    badgeColor: '#f57f17',
    desc: 'Não é uma enzima — é uma reação de liberação do ácido ferúlico da parede celular do malte de trigo. A levedura de Weizen converte esse ácido em 4-vinyl guaiacol, responsável pelo aroma característico de cravo.',
    tip: 'Indispensável para Hefeweizen e Dunkelweizen autênticos. 10–15 min são suficientes.',
  },
  {
    name: 'Repouso de Proteína',
    tempRange: '45–58°C',
    enzyme: 'Proteases (Endopeptidase)',
    badgeBg: '#ffb30026',
    badgeColor: '#e65100',
    desc: 'Quebra proteínas em fragmentos menores (peptídeos e aminoácidos). Proteínas grandes causam turbidez; proteínas médias contribuem para espuma e corpo. Quebrar demais reduz espuma e corpo da cerveja.',
    tip: 'Maltes modernos já são bem modificados — um repouso de proteína longo pode prejudicar o corpo. Use tempos curtos (10–15 min) para maltes parcialmente modificados ou receitas com altos percentuais de trigo.',
  },
  {
    name: 'Beta-Amilase (Sacarificação Baixa)',
    tempRange: '60–65°C',
    enzyme: 'β-Amilase',
    badgeBg: '#ff980026',
    badgeColor: '#e65100',
    desc: 'A beta-amilase corta a cadeia de amido a partir das extremidades, produzindo principalmente maltose — o açúcar mais fermentável. Resultado: mosto seco, FG baixo, alta atenuação.',
    tip: 'Ideal para cervejas secas: Session, Pale Ale, Lager, IPA. A β-amilase se desnatura acima de 65°C, então temperatura precisa é essencial.',
  },
  {
    name: 'Sacarificação Combinada',
    tempRange: '65–68°C',
    enzyme: 'α-amilase + β-amilase',
    badgeBg: '#fb8c0026',
    badgeColor: '#bf360c',
    desc: 'Faixa onde ambas as amilases estão ativas simultaneamente. A β-amilase ainda é ativa mas vai se desnaturando progressivamente. Produz mix de maltose e dextrinas — equilíbrio entre fermentabilidade e corpo.',
    tip: 'A faixa mais comum para receitas "padrão". 66–67°C é o ponto ideal para a maioria das cervejas de corpo médio.',
  },
  {
    name: 'Alpha-Amilase (Sacarificação Alta)',
    tempRange: '68–72°C',
    enzyme: 'α-Amilase',
    badgeBg: '#ef6c0026',
    badgeColor: '#b71c1c',
    desc: 'A alfa-amilase corta a cadeia de amido ao meio, produzindo dextrinas (não fermentáveis) e menos maltose. Resultado: mosto mais denso, FG mais alto, cerveja com mais corpo e dulçor residual.',
    tip: 'Ideal para cervejas encorpadas: Stout, Porter, Doppelbock, Scotch Ale. Acima de 72°C a α-amilase também começa a se desnaturar.',
  },
  {
    name: 'Mash Out',
    tempRange: '75–78°C',
    enzyme: '— (desnaturação)',
    badgeBg: '#f4433626',
    badgeColor: '#c62828',
    desc: 'Eleva o mosto a uma temperatura onde todas as enzimas são permanentemente inativas. "Congela" a composição de açúcares no estado atual. Também reduz a viscosidade do mosto, acelerando a filtragem.',
    tip: 'Recomendado quando você precisa de fermentabilidade precisa e consistente, ou quando a filtragem está lenta. Dispense se fizer BIAB — as enzimas param quando o líquido esfria no fervedor.',
  },
  {
    name: 'Decocção',
    tempRange: 'Fervura (~100°C)',
    enzyme: '— (caramelização)',
    badgeBg: '#9e9e9e1a',
    badgeColor: '#424242',
    desc: 'Técnica onde parte do mosto (com grãos) é retirada, fervida separadamente e reintroduzida para elevar a temperatura. Cria melanoidinas por reação de Maillard — responsáveis por cor âmbar/cobre, sabor de pão/biscoito e corpo adicional.',
    tip: 'Essencial para Märzen, Munich Helles, Dunkel e Bock tradicionais. Não substituível por maltes cristal — o perfil de sabor é diferente.',
  },
]
</script>

<style scoped>
.guide-body {
  max-width: 100%;
}

.guide-intro-text {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--bp-text-secondary);
}

.guide-section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  color: var(--bp-text-muted);
}

.guide-diagram-wrap {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 12px 16px 8px;
  overflow-x: auto;
}

.guide-card {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 12px 14px;
}

.guide-card-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  padding: 4px 10px;
  white-space: nowrap;
  align-self: flex-start;
  margin-top: 1px;
}

.guide-card-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--bp-text-primary);
}

.guide-card-enzyme {
  font-size: 10px;
  font-weight: 500;
  color: var(--q-primary);
  background: color-mix(in srgb, var(--q-primary) 12%, transparent);
  border-radius: 4px;
  padding: 1px 6px;
}

.guide-card-desc {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--bp-text-secondary);
}

.guide-card-tip {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--bp-text-muted);
  font-style: italic;
}

.guide-ramp-section {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 14px;
}

.guide-ramp-item {
  display: flex;
  align-items: flex-start;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--bp-text-secondary);
  gap: 2px;
}

.guide-body-text {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--bp-text-secondary);
}

.guide-tips {
  background: var(--bp-surface-alt);
  border: 1px solid var(--bp-border);
  border-radius: 8px;
  padding: 14px;
}

.guide-tip-card {
  display: flex;
  flex-direction: column;
  background: var(--bp-surface);
  border: 1px solid var(--bp-border);
  border-radius: 6px;
  padding: 10px 12px;
  height: 100%;
}

.guide-tip-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--bp-text-primary);
  margin-bottom: 4px;
}

.guide-tip-body {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--bp-text-secondary);
}
</style>
